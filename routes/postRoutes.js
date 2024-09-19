import express from "express";
import path from "path";
import userAuth from "../middleware/authMiddleware.js";
import { commentPost, createPost, getComments, getPost, getPosts, getUserPosts, likePost, likePostComment, replyPostComment } from "../controllers/postController.js";

const router = express.Router();


// Create post
router.post('create-post', userAuth, createPost);

// Get posts
router.post('/', userAuth, getPosts);
router.post('/:id', userAuth, getPost);
router.post('/get-user-post/:id', userAuth, getUserPosts);

// Comment
router.get('/comments/:postId', getComments);


// Like post and like comment on posts
router.post('/like/:id', userAuth, likePost);
router.post('/like-comment/:id/:rid', userAuth, likePostComment); //id: id của comment, rid: id của reply comment
router.post('/comment/:id', userAuth, commentPost);
router.post('/reply-comment/:id', userAuth, replyPostComment);


// Comment post


// Delete post

export default router;