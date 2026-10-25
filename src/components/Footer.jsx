import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <p>
        &copy; 2026 Pet Marketplace. All rights reserved. · <Link to="/contact">Contact us</Link>
      </p>
    </footer>
  );
}
