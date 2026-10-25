import { useState } from 'react';
import { Link } from 'react-router-dom';
import './ListingCard.css';

export default function ListingCard({ listing }) {
  const isWanted = listing.listingType === 'wanted';
  // If the image link is broken, we remember it and show the paw placeholder instead
  const [failedImageUrl, setFailedImageUrl] = useState('');
  const showImage = listing.imageUrl && listing.imageUrl !== failedImageUrl;

  return (
    <Link to={`/catalog/${listing.id}`} className="listing-card">
      <div className="listing-card-body">
        <span className={`listing-type-badge ${isWanted ? 'listing-type-badge-wanted' : ''}`}>
          {isWanted ? 'Looking for' : 'Offering'}
        </span>
        <h3>{listing.title}</h3>
        <p className="listing-card-price">{isWanted ? 'Budget: ' : ''}€{listing.price}</p>
        <p className="listing-card-category">{listing.category} · {listing.petType}</p>
      </div>
      {showImage ? (
        <img
          src={listing.imageUrl}
          alt={listing.title}
          className="listing-card-image"
          onError={() => setFailedImageUrl(listing.imageUrl)}
        />
      ) : (
        <div className="listing-card-image listing-card-image-placeholder" aria-hidden="true">🐾</div>
      )}
    </Link>
  );
}
