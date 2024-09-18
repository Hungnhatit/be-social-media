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
    }

    const post = await Posts.create({
      userId,
      description,
      image,
    });

    res.status(200).json({
      success: true,
      message: "Post created successfully!",
      data: post,
    })

  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: error.message
    })
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
}

export const getComments = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const postComments = await Comments.findById({ postId })
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



  } catch (error) {

  }
}

export const likePost = async (req, res, next) => {

}

export const likePostComment = async (req, res, next) => {

}

export const commentPost = async (req, res, next) => {

}

export const replyPostComment = async (req, res, next) => {

}

export const deletePost = async (req, res, next) => {

}