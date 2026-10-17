import { useEffect, useState } from 'react';
import { getListings } from '../services/listings';
import ListingCard from '../components/ListingCard';
import './Catalog.css';

const ADS_PER_PAGE = 18;

export default function Catalog() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

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

  const totalPages = Math.max(1, Math.ceil(filteredListings.length / ADS_PER_PAGE));
  const page = Math.min(currentPage, totalPages);
  const pageListings = filteredListings.slice((page - 1) * ADS_PER_PAGE, page * ADS_PER_PAGE);

  function goToPage(newPage) {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="catalog-page">
      <h2>Catalog</h2>

      <div className="catalog-controls">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Search ads by title..."
          className="catalog-search"
        />
        <div className="catalog-type-filter">
          <button
            type="button"
            className={typeFilter === 'all' ? 'active' : ''}
            onClick={() => {
              setTypeFilter('all');
              setCurrentPage(1);
            }}
          >
            All
          </button>
          <button
            type="button"
            className={typeFilter === 'offer' ? 'active' : ''}
            onClick={() => {
              setTypeFilter('offer');
              setCurrentPage(1);
            }}
          >
            Offering
          </button>
          <button
            type="button"
            className={typeFilter === 'wanted' ? 'active' : ''}
            onClick={() => {
              setTypeFilter('wanted');
              setCurrentPage(1);
            }}
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
            <>
              <div className="listing-grid">
                {pageListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>

              {totalPages > 1 && (
                <nav className="catalog-pagination" aria-label="Pages">
                  <button type="button" disabled={page === 1} onClick={() => goToPage(page - 1)}>
                    ‹ Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      type="button"
                      className={n === page ? 'active' : ''}
                      onClick={() => goToPage(n)}
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={page === totalPages}
                    onClick={() => goToPage(page + 1)}
                  >
                    Next ›
                  </button>
                </nav>
              )}
            </>
          )}
        </div>

        <div className="catalog-ad-slot catalog-ad-slot--right" aria-hidden="true">Your ad here</div>
      </div>
    </div>
  );
}
