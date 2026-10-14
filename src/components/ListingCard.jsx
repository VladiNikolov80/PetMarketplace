import { Link } from 'react-router-dom';
import './ListingCard.css';

export default function ListingCard({ listing }) {
  return (
    <Link to={`/catalog/${listing.id}`} className="listing-card">
      <div className="listing-card-body">
        <h3>{listing.title}</h3>
        <p className="listing-card-price">€{listing.price}</p>
        <p className="listing-card-category">{listing.category} · {listing.petType}</p>
      </div>
      {listing.imageUrl ? (
        <img src={listing.imageUrl} alt={listing.title} className="listing-card-image" />
      ) : (
        <div className="listing-card-image listing-card-image-placeholder" aria-hidden="true">🐾</div>
      )}
    </Link>
  );
}
