const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '请输入分类名称'],
    unique: true,
    trim: true,
    maxlength: [50, '分类名称最多50个字符']
  },
  description: {
    type: String,
    maxlength: [200, '分类描述最多200个字符']
  },
  icon: {
    type: String,
    default: '📝'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Category', categorySchema);
