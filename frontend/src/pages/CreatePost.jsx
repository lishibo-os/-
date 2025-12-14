import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { postService, categoryService } from '../services';
import { useAuthStore } from '../store/authStore';
import './CreatePost.css';

function CreatePost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchCategories();
  }, [isAuthenticated]);

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('获取分类失败:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const postData = {
        title,
        content,
        category,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      const post = await postService.createPost(postData);
      navigate(`/post/${post._id}`);
    } catch (err) {
      setError(err.response?.data?.message || '发布失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-post">
      <div className="create-post-container">
        <h2>分享你的生活经验</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>标题</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="给你的经验起个标题..."
              required
            />
          </div>

          <div className="form-group">
            <label>分类</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">选择分类</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>标签（用逗号分隔）</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="例如: 健康, 美食, 旅游"
            />
          </div>

          <div className="form-group">
            <label>内容（支持 Markdown 格式）</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="详细描述你的经验和技巧..."
              required
              rows={15}
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => navigate('/')}>
              取消
            </button>
            <button type="submit" disabled={loading}>
              {loading ? '发布中...' : '发布'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreatePost;
