import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getListingsByAuthor } from '../services/listings';
import { getFavoriteListings } from '../services/favorites';
import ListingCard from '../components/ListingCard';

export default function Profile() {
  const { user } = useAuth();

  const [myListings, setMyListings] = useState([]);
  const [favoriteListings, setFavoriteListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadProfileData() {
      try {
        const [listings, favorites] = await Promise.all([
          getListingsByAuthor(user.uid),
          getFavoriteListings(user.uid),
        ]);
        if (isMounted) {
          setMyListings(listings);
          setFavoriteListings(favorites);
        }
      } catch {
        if (isMounted) {
          setError('Could not load your profile data.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadProfileData();

    return () => {
      isMounted = false;
    };
  }, [user]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p className="form-error">{error}</p>;
  }

  return (
    <div>
      <h2>My Profile</h2>
      <p>{user.email}</p>

      <h3>My Listings</h3>
      {myListings.length === 0 ? (
        <p>You haven't published any listings yet.</p>
      ) : (
        <div className="listing-grid">
          {myListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}

      <h3>Favorites</h3>
      {favoriteListings.length === 0 ? (
        <p>You haven't added any listings to your favorites yet.</p>
      ) : (
        <div className="listing-grid">
          {favoriteListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
