import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { postService, categoryService } from '../services';
import './Home.css';

function Home() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory, searchTerm, currentPage]);

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('获取分类失败:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10
      };
      if (selectedCategory) params.category = selectedCategory;
      if (searchTerm) params.search = searchTerm;

      const data = await postService.getPosts(params);
      setPosts(data.posts);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('获取文章失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPosts();
  };

  return (
    <div className="home">
      <div className="hero">
        <h1>生活经验分享平台</h1>
        <p>发现和分享生活中的技巧与经验</p>
        <form onSubmit={handleSearch} className="search-bar">
          <input
            type="text"
            placeholder="搜索生活技巧..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit">搜索</button>
        </form>
      </div>

      <div className="categories">
        <button
          className={!selectedCategory ? 'active' : ''}
          onClick={() => setSelectedCategory('')}
        >
          全部
        </button>
        {categories.map((cat) => (
          <button
            key={cat._id}
            className={selectedCategory === cat._id ? 'active' : ''}
            onClick={() => setSelectedCategory(cat._id)}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      <div className="posts-grid">
        {loading ? (
          <p>加载中...</p>
        ) : posts.length === 0 ? (
          <p>暂无文章</p>
        ) : (
          posts.map((post) => (
            <Link to={`/post/${post._id}`} key={post._id} className="post-card">
              <h3>{post.title}</h3>
              <p className="post-excerpt">
                {post.content.substring(0, 150)}...
              </p>
              <div className="post-meta">
                <span className="author">
                  <img src={post.author.avatar} alt={post.author.username} />
                  {post.author.username}
                </span>
                <span className="category">{post.category.icon} {post.category.name}</span>
                <span className="stats">
                  👁️ {post.views} ❤️ {post.likes.length}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            上一页
          </button>
          <span>第 {currentPage} / {totalPages} 页</span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
}

export default Home;
