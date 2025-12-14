import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { postService, commentService } from '../services';
import { useAuthStore } from '../store/authStore';
import './PostDetail.css';

function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const currentUser = useAuthStore((state) => state.user);

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [id]);

  const fetchPost = async () => {
    try {
      const data = await postService.getPost(id);
      setPost(data);
    } catch (error) {
      console.error('获取文章失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const data = await commentService.getComments(id);
      setComments(data);
    } catch (error) {
      console.error('获取评论失败:', error);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      const data = await postService.likePost(id);
      setPost({ ...post, likes: data.liked ? [...post.likes, currentUser.id] : post.likes.filter(id => id !== currentUser.id) });
    } catch (error) {
      console.error('点赞失败:', error);
    }
  };

  const handleFork = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      const forkedPost = await postService.forkPost(id);
      navigate(`/post/${forkedPost._id}`);
    } catch (error) {
      console.error('转载失败:', error);
    }
  };

  const handleSave = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      await postService.savePost(id);
      alert('收藏成功！');
    } catch (error) {
      console.error('收藏失败:', error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      const comment = await commentService.createComment({
        content: newComment,
        post: id
      });
      setComments([comment, ...comments]);
      setNewComment('');
    } catch (error) {
      console.error('评论失败:', error);
    }
  };

  if (loading) return <div className="loading">加载中...</div>;
  if (!post) return <div className="error">文章不存在</div>;

  return (
    <div className="post-detail">
      <div className="post-header">
        <h1>{post.title}</h1>
        <div className="post-info">
          <div className="author-info">
            <img src={post.author.avatar} alt={post.author.username} />
            <div>
              <strong>{post.author.username}</strong>
              <span>{new Date(post.createdAt).toLocaleDateString('zh-CN')}</span>
            </div>
          </div>
          <div className="post-actions">
            <button onClick={handleLike}>
              ❤️ {post.likes.length}
            </button>
            <button onClick={handleSave}>
              ⭐ 收藏
            </button>
            <button onClick={handleFork}>
              🔀 转载
            </button>
          </div>
        </div>
        <div className="post-tags">
          <span className="category">{post.category.icon} {post.category.name}</span>
          {post.tags.map((tag, index) => (
            <span key={index} className="tag">#{tag}</span>
          ))}
        </div>
      </div>

      <div className="post-content">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>

      <div className="post-stats">
        <span>👁️ {post.views} 次浏览</span>
        {post.forkedFrom && (
          <span>转载自: <Link to={`/post/${post.forkedFrom._id}`}>{post.forkedFrom.title}</Link></span>
        )}
      </div>

      <div className="comments-section">
        <h3>评论 ({comments.length})</h3>
        {isAuthenticated && (
          <form onSubmit={handleCommentSubmit} className="comment-form">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="写下你的评论..."
              required
            />
            <button type="submit">发表评论</button>
          </form>
        )}
        <div className="comments-list">
          {comments.map((comment) => (
            <div key={comment._id} className="comment">
              <img src={comment.author.avatar} alt={comment.author.username} />
              <div className="comment-content">
                <strong>{comment.author.username}</strong>
                <p>{comment.content}</p>
                <span>{new Date(comment.createdAt).toLocaleString('zh-CN')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PostDetail;
