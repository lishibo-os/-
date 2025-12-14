const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// Get user by id
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('followers', 'username avatar')
      .populate('following', 'username avatar');
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// Update user profile
router.put('/me', authMiddleware, async (req, res) => {
  try {
    const { bio, avatar } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { bio, avatar },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// Follow user
router.post('/:id/follow', authMiddleware, async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    
    if (!userToFollow) {
      return res.status(404).json({ message: '用户不存在' });
    }

    if (req.user._id.equals(userToFollow._id)) {
      return res.status(400).json({ message: '不能关注自己' });
    }

    // Add to following
    if (!req.user.following.includes(userToFollow._id)) {
      req.user.following.push(userToFollow._id);
      await req.user.save();
    }

    // Add to followers
    if (!userToFollow.followers.includes(req.user._id)) {
      userToFollow.followers.push(req.user._id);
      await userToFollow.save();
    }

    res.json({ message: '关注成功' });
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// Unfollow user
router.post('/:id/unfollow', authMiddleware, async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.id);
    
    if (!userToUnfollow) {
      return res.status(404).json({ message: '用户不存在' });
    }

    // Remove from following
    req.user.following = req.user.following.filter(
      id => !id.equals(userToUnfollow._id)
    );
    await req.user.save();

    // Remove from followers
    userToUnfollow.followers = userToUnfollow.followers.filter(
      id => !id.equals(req.user._id)
    );
    await userToUnfollow.save();

    res.json({ message: '取消关注成功' });
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;
