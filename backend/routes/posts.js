const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const { createLimiter } = require('../middleware/rateLimiter');
const Post = require('../models/Post');
const User = require('../models/User');

// Get all posts with pagination and filters
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { category, search, tag } = req.query;

    let query = {};

    if (category) {
      query.category = category;
    }

    if (tag) {
      query.tags = tag;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const posts = await Post.find(query)
      .populate('author', 'username avatar')
      .populate('category', 'name icon')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments(query);

    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total
    });
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// Get single post
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username avatar bio')
      .populate('category', 'name icon')
      .populate('forkedFrom', 'title author');

    if (!post) {
      return res.status(404).json({ message: '文章不存在' });
    }

    // Increment views
    post.views += 1;
    await post.save();

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// Create post
router.post('/', authMiddleware, createLimiter, [
  body('title').trim().notEmpty().withMessage('请输入标题'),
  body('content').trim().notEmpty().withMessage('请输入内容'),
  body('category').notEmpty().withMessage('请选择分类')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content, category, tags, images } = req.body;

    const post = new Post({
      title,
      content,
      category,
      tags: tags || [],
      images: images || [],
      author: req.user._id
    });

    await post.save();

    const populatedPost = await Post.findById(post._id)
      .populate('author', 'username avatar')
      .populate('category', 'name icon');

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// Update post
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: '文章不存在' });
    }

    if (!post.author.equals(req.user._id)) {
      return res.status(403).json({ message: '无权限修改此文章' });
    }

    // Save to edit history
    post.editHistory.push({
      content: post.content,
      editedAt: new Date()
    });

    const { title, content, category, tags, images } = req.body;

    post.title = title || post.title;
    post.content = content || post.content;
    post.category = category || post.category;
    post.tags = tags || post.tags;
    post.images = images || post.images;

    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate('author', 'username avatar')
      .populate('category', 'name icon');

    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// Delete post
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: '文章不存在' });
    }

    if (!post.author.equals(req.user._id)) {
      return res.status(403).json({ message: '无权限删除此文章' });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.json({ message: '文章已删除' });
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// Like post
router.post('/:id/like', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: '文章不存在' });
    }

    const index = post.likes.indexOf(req.user._id);

    if (index > -1) {
      // Unlike
      post.likes.splice(index, 1);
      await post.save();
      res.json({ message: '已取消点赞', liked: false, likesCount: post.likes.length });
    } else {
      // Like
      post.likes.push(req.user._id);
      await post.save();
      res.json({ message: '点赞成功', liked: true, likesCount: post.likes.length });
    }
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// Fork post
router.post('/:id/fork', authMiddleware, async (req, res) => {
  try {
    const originalPost = await Post.findById(req.params.id);

    if (!originalPost) {
      return res.status(404).json({ message: '文章不存在' });
    }

    const forkedPost = new Post({
      title: `[转载] ${originalPost.title}`,
      content: originalPost.content,
      category: originalPost.category,
      tags: originalPost.tags,
      author: req.user._id,
      forkedFrom: originalPost._id
    });

    await forkedPost.save();

    // Add to original post's forks
    originalPost.forks.push(forkedPost._id);
    await originalPost.save();

    const populatedPost = await Post.findById(forkedPost._id)
      .populate('author', 'username avatar')
      .populate('category', 'name icon')
      .populate('forkedFrom', 'title author');

    res.status(201).json(populatedPost);
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// Save/bookmark post
router.post('/:id/save', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: '文章不存在' });
    }

    const user = await User.findById(req.user._id);
    const index = user.savedPosts.indexOf(post._id);

    if (index > -1) {
      // Unsave
      user.savedPosts.splice(index, 1);
      await user.save();
      res.json({ message: '已取消收藏', saved: false });
    } else {
      // Save
      user.savedPosts.push(post._id);
      await user.save();
      res.json({ message: '收藏成功', saved: true });
    }
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;
