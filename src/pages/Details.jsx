import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getListingById, deleteListing } from '../services/listings';

export default function Details() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadListing() {
      try {
        const data = await getListingById(id);
        if (isMounted) {
          setListing(data);
        }
      } catch {
        if (isMounted) {
          setError('Could not load this listing.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadListing();

    return () => {
      isMounted = false;
    };
  }, [id]);

  async function handleDelete() {
    const confirmed = window.confirm('Delete this listing? This cannot be undone.');
    if (!confirmed) {
      return;
    }

    try {
      await deleteListing(id);
      navigate('/catalog');
    } catch {
      setError('Could not delete this listing.');
    }
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p className="form-error">{error}</p>;
  }

  if (!listing) {
    return <p>This listing does not exist.</p>;
  }

  const isAuthor = user && user.uid === listing.authorId;

  return (
    <div>
      {listing.imageUrl && <img src={listing.imageUrl} alt={listing.title} />}
      <h2>{listing.title}</h2>
      <p>{listing.category}</p>
      <p>{listing.price} BGN</p>
      <p>{listing.description}</p>
      <p>Posted by {listing.authorName}</p>

      {isAuthor && (
        <div>
          <Link to={`/edit/${listing.id}`}>Edit</Link>
          <button onClick={handleDelete}>Delete</button>
        </div>
      )}
    </div>
  );
}
