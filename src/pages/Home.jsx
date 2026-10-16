import { Link } from 'react-router-dom';
import './Home.css';

export default function Home() {
  return (
    <div>
      <div className="home-hero">
        <div className="home-hero-content">
          <h1>Find the right product or service for your pet</h1>
          <p>Browse ads from other pet owners, or publish your own.</p>
          <Link to="/catalog" className="home-cta">Browse the Catalog</Link>
        </div>
      </div>

      <div className="home-ad-banner" aria-hidden="true">Your ad here</div>
    </div>
  );
}
