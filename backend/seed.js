const mongoose = require('mongoose');
const Category = require('./models/Category');
require('dotenv').config();

const categories = [
  { name: '健康养生', description: '健康生活、养生技巧、运动健身', icon: '💪' },
  { name: '美食烹饪', description: '食谱分享、烹饪技巧、美食推荐', icon: '🍳' },
  { name: '家居生活', description: '家居装饰、收纳整理、清洁技巧', icon: '🏠' },
  { name: '旅行出游', description: '旅行攻略、景点推荐、旅行贴士', icon: '✈️' },
  { name: '职场技能', description: '职业发展、工作技巧、效率提升', icon: '💼' },
  { name: '学习教育', description: '学习方法、教育经验、知识分享', icon: '📚' },
  { name: '理财投资', description: '理财技巧、投资经验、省钱妙招', icon: '💰' },
  { name: '人际关系', description: '社交技巧、情感交流、人际处理', icon: '👥' },
  { name: '兴趣爱好', description: '手工DIY、摄影、音乐等爱好分享', icon: '🎨' },
  { name: '科技数码', description: '数码产品、软件应用、技术分享', icon: '💻' }
];

const seedCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lifestyle-sharing');
    console.log('数据库连接成功');

    // 清除现有分类
    await Category.deleteMany({});
    console.log('已清除现有分类');

    // 插入新分类
    await Category.insertMany(categories);
    console.log('初始分类数据插入成功');

    mongoose.connection.close();
    console.log('数据库连接已关闭');
  } catch (error) {
    console.error('错误:', error);
    process.exit(1);
  }
};

seedCategories();
