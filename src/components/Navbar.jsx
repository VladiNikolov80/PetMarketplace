import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, displayName, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">🐾 PetMarketplace</Link>

      <div className="navbar-links">
        <Link to="/catalog">Catalog</Link>

        {user ? (
          <>
            <Link to="/create">Add Ad</Link>
            <Link to="/profile">Profile</Link>
            <span className="navbar-email">{displayName || user.email}</span>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
