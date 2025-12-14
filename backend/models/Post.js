const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, '请输入标题'],
    trim: true,
    maxlength: [200, '标题最多200个字符']
  },
  content: {
    type: String,
    required: [true, '请输入内容'],
    maxlength: [10000, '内容最多10000个字符']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, '请选择分类']
  },
  tags: [{
    type: String,
    trim: true
  }],
  images: [{
    type: String
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  views: {
    type: Number,
    default: 0
  },
  forkedFrom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  },
  forks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }],
  editHistory: [{
    content: String,
    editedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
postSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Post', postSchema);
