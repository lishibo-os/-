import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import './Navbar.css';

function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          🏠 生活经验分享
        </Link>

        <div className="navbar-menu">
          <Link to="/" className="navbar-item">首页</Link>
          
          {isAuthenticated ? (
            <>
              <Link to="/create" className="navbar-item">
                ✍️ 发布经验
              </Link>
              <div className="navbar-user">
                <img src={user?.avatar} alt={user?.username} />
                <span>{user?.username}</span>
                <button onClick={handleLogout}>退出</button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-item">登录</Link>
              <Link to="/register" className="navbar-item navbar-register">
                注册
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
