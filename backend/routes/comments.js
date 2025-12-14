const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const { createLimiter } = require('../middleware/rateLimiter');
const Comment = require('../models/Comment');

// Get comments for a post
router.get('/post/:postId', async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId, parentComment: null })
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// Create comment
router.post('/', authMiddleware, createLimiter, [
  body('content').trim().notEmpty().withMessage('请输入评论内容'),
  body('post').notEmpty().withMessage('文章ID不能为空')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content, post, parentComment } = req.body;

    const comment = new Comment({
      content,
      post,
      author: req.user._id,
      parentComment: parentComment || null
    });

    await comment.save();

    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'username avatar');

    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// Delete comment
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: '评论不存在' });
    }

    if (!comment.author.equals(req.user._id)) {
      return res.status(403).json({ message: '无权限删除此评论' });
    }

    await Comment.findByIdAndDelete(req.params.id);

    res.json({ message: '评论已删除' });
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// Like comment
router.post('/:id/like', authMiddleware, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: '评论不存在' });
    }

    const index = comment.likes.indexOf(req.user._id);

    if (index > -1) {
      comment.likes.splice(index, 1);
      await comment.save();
      res.json({ message: '已取消点赞', liked: false, likesCount: comment.likes.length });
    } else {
      comment.likes.push(req.user._id);
      await comment.save();
      res.json({ message: '点赞成功', liked: true, likesCount: comment.likes.length });
    }
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;
