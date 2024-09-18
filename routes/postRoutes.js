import express from "express";
import path from "path";
import userAuth from "../middleware/authMiddleware.js";
import { createPost, getComments, getPost, getPosts, getUserPosts } from "../controllers/postController.js";

const router = express.Router();


// Create post
router.post('create-post', userAuth, createPost);

// Get posts
router.post('/', userAuth, getPosts);
router.post('/:id', userAuth, getPost);
router.post('/get-user-post/:id', userAuth, getUserPosts);

// Comment
router.get('/comments/:postId', getComments);

export default router;