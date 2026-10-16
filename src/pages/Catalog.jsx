import { useEffect, useState } from 'react';
import { getListings } from '../services/listings';
import ListingCard from '../components/ListingCard';
import './Catalog.css';

export default function Catalog() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

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

  const filteredListings = listings.filter((listing) => {
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.trim().toLowerCase());
    const matchesType = typeFilter === 'all' || listing.listingType === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="catalog-page">
      <h2>Catalog</h2>

      <div className="catalog-controls">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search ads by title..."
          className="catalog-search"
        />
        <div className="catalog-type-filter">
          <button
            type="button"
            className={typeFilter === 'all' ? 'active' : ''}
            onClick={() => setTypeFilter('all')}
          >
            All
          </button>
          <button
            type="button"
            className={typeFilter === 'offer' ? 'active' : ''}
            onClick={() => setTypeFilter('offer')}
          >
            Offering
          </button>
          <button
            type="button"
            className={typeFilter === 'wanted' ? 'active' : ''}
            onClick={() => setTypeFilter('wanted')}
          >
            Looking for
          </button>
        </div>
      </div>

      <div className="catalog-layout">
        <div className="catalog-ad-slot catalog-ad-slot--left" aria-hidden="true">Your ad here</div>

        <div className="catalog-listings">
          {filteredListings.length === 0 ? (
            <p>
              {listings.length === 0
                ? 'No ads yet. Be the first to publish one!'
                : 'No ads match your search.'}
            </p>
          ) : (
            <div className="listing-grid">
              {filteredListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>

        <div className="catalog-ad-slot catalog-ad-slot--right" aria-hidden="true">Your ad here</div>
      </div>
    </div>
  );
}
