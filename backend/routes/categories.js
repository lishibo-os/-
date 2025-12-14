const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const Category = require('../models/Category');

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// Get single category
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: '分类不存在' });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// Create category (protected route)
router.post('/', authMiddleware, [
  body('name').trim().notEmpty().withMessage('请输入分类名称')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, icon } = req.body;

    const category = new Category({
      name,
      description,
      icon: icon || '📝'
    });

    await category.save();

    res.status(201).json(category);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: '分类已存在' });
    }
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;
