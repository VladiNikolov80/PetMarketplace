import { useEffect, useState } from 'react';
import { getListings } from '../services/listings';
import ListingCard from '../components/ListingCard';
import './Catalog.css';

export default function Catalog() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadListings() {
      try {
        const data = await getListings();
        if (isMounted) {
          setListings(data);
        }
      } catch {
        if (isMounted) {
          setError('Could not load ads. Please try again later.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadListings();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <p>Loading ads...</p>;
  }

  if (error) {
    return <p className="form-error">{error}</p>;
  }

  return (
    <div className="catalog-page">
      <h2>Catalog</h2>

      {listings.length === 0 ? (
        <p>No ads yet. Be the first to publish one!</p>
      ) : (
        <div className="listing-grid">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
