import { Link } from 'react-router-dom';

export default function ListingCard({ listing }) {
  return (
    <div className="listing-card">
      {listing.imageUrl && <img src={listing.imageUrl} alt={listing.title} />}
      <h3>{listing.title}</h3>
      <p>{listing.price} BGN</p>
      <p>{listing.category}</p>
      <Link to={`/catalog/${listing.id}`}>View details</Link>
    </div>
  );
}
