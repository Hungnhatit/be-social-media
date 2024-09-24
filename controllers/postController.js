import mongoose from "mongoose";
import Posts from "../models/postModel.js";
import Users from "../models/userModel.js";
import Comments from "../models/commentmodel.js";

export const createPost = async (req, res, next) => {
  try {
    const { userId } = req.body.user;
    const { description, image } = req.body;

    if (!description) {
      next("You must have a description!");
      return;
      // return res.status(404).json({ success: "failed", message: "You must have a description!" });
    }

    const post = await Posts.create({
      userId,
      description,
      image,
    });

    // Kết quả khi trả về
    res.status(200).json({
      success: true,
      message: "Post created successfully!",
      data: post,
    });

  } catch (error) {
    console.log(error);
    // res.status(404).json({
    //   message: error.message
    // })
    next(error);
  }

}

export const getPosts = async (req, res, next) => {
  try {
    const { userId } = req.body.user;
    const { search } = req.body;

    // Đoạn này dùng để lấy bài đăng của người dùng hiện tại và tất cả bạn bè của người dùng đó  
    const user = await Users.findById(userId);
    const friends = user?.friends?.toString().split(",") ?? [];
    friends.push(userId);

    const searchPostQuery = {
      $or: [
        {
          description: { $regex: search, $option: "i" },
        },
      ],
    };

    const posts = await Posts.find(search ? searchPostQuery : {})
      .populate({
        path: "userId",
        select: "firstName lastName location profileUrl -password",
      })
      .sort({
        _id: -1
      });

    const friendPosts = posts?.filter((post) => {
      return friends.includes(post?.userId?._id.toString());
    });

    const otherPosts = posts?.filter((post) => {
      return !friends.includes(post?.userId?._id.toString());
    });

    let postRes = null;

    if (friendPosts?.length > 0) {
      postRes = search ? friendPosts : [...friendPosts, ...otherPosts];
    } else {
      postRes = posts;
    }

    res.status(200).json({
      success: true,
      message: "Successfully",
      data: postRes,
    })

  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: error.message,
    })
  }

}

export const getPost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await Posts.findById(id)
      .populate({
        path: "userId",
        select: "firstName lastName location profileUrl -password"
      })

    res.status(200).json({
      success: true,
      message: "Successfully",
      data: post
    })

  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: error.message,
    })

  }
}

export const getUserPosts = async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await Posts.find({ userId: id })
      .populate({
        path: "userId",
        select: "firstName lastName location profileUrl -password"
      })
      .sort({
        _id: -1
      });

    res.status(200).json({
      success: true,
      message: "Successfully",
      data: post,
    })

  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: error.message,
    })
  }
};

export const getComments = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const postComments = await Comments.find({ postId })
      .populate({
        path: "userId",
        select: "firstName lastName location profileUrl -password",
      })
      .populate({
        path: "replies.userId",
        select: "firstName lastName location profileUrl -pasword",
      })
      .sort({
        _id: -1
      });
    res.status(200).json({
      success: true,
      message: "Successfully",
      data: postComments,
    })

  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: error.message,
    })
  }
}

export const likePost = async (req, res, next) => {
  try {
    const { userId } = req.body.user;
    const { id } = req.params; //Post id

    const post = await Posts.findById(id);

    const index = post.likes.findIndex((pid) => pid === String(userId));

    if (index === -1) {
      post.likes.push(userId);
    } else {
      post.likes = post.likes.filter((pid) => pid !== String(userId));
    }

    const newPost = await Posts.findByIdAndUpdate(id, post, {
      new: true,
    });
    res.status(200).json({
      success: true,
      message: "Successfully",
      data: newPost,
    });

  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: error.message,
    })
  }
}

export const likePostComment = async (req, res, next) => {
  const { userId } = req.body.user;
  const { id, rid } = req.params;
  try {
    if (rid === undefined || rid === null || rid === `false`) {
      const comment = await Comments.findById(id);

      // Nếu chưa like thì thực hiện 
      const index = comment.likes.findIndex((el) => el === String(userId));
      if (index === -1) {
        comment.likes.push(userId);
      } else {
        comment.likes = comment.likes.filter((i) => i !== String(userId));
      }

      const updated = await Comments.findByIdAndUpdate(id, comment, {
        new: true,
      });

      res.status(200).json(updated);
    } else {
      const replyComments = await Comments.findOne(
        { _id: id },
        {
          replies: {
            $elemMatch: {
              _id: rid,
            },
          },
        }
      );

      const index = replyComments?.replies[0]?.likes.findIndex(
        (i) => i === String(userId)
      );

      if (index === -1) {
        replyComments.replies[0].likes.push(userId);
      } else {
        replyComments.replies[0].likes = replyComments.replies[0]?.likes.filter(
          (i) => i !== String(userId)
        );
      }

      const query = {
        _id: id,
        "replies._id": rid
      }

      const updated = {
        $set: {
          "replies.$.likes": replyComments.replies[0].likes,
        },
      };

      const result = await Comments.updateOne(query, updated, {
        new: true
      });

      res.status(201).json(result);
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: error.message
    })
  }
};

export const commentPost = async (req, res, next) => {
  try {
    const { comment, from } = req.body;
    const { userId } = req.body.user;
    const { id } = req.params;

    if (comment === null) {
      return res.status(404).json({
        message: "Comment is required",
      });
    }

    const newComment = new Comments({
      comment,
      from,
      userId,
      postId: id,
    });

    await newComment.save();

    // Update the post with comments id
    const post = await Posts.findById(id);
    post.comments.push(newComment._id);

    const updatedPost = await Posts.findByIdAndUpdate(id, post, {
      new: true
    });

    res.status(201).json(newComment);

  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: error.message
    });
  }

}

export const replyPostComment = async (req, res, next) => {
  const { userId } = req.body.user;
  const { comment, replyAt, from } = req.body;
  const { id } = req.params;

  if (comment === null) {
    return res.status(404).json({
      message: "Comment is required!"
    });
  };

  try {
    const commentInfo = await Comments.findById(id);
    commentInfo.replies.push({
      comment,
      replyAt,
      from,
      userId,
      created_At: Date.now(),
    });

    commentInfo.save();
    res.status(200).json({ commentInfo });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
}

export const deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Posts.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: "Delete Successfully"
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }

} 