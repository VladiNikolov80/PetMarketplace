import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getListingById, deleteListing } from '../services/listings';
import { isFavorite, addFavorite, removeFavorite } from '../services/favorites';
import { addComment, getComments } from '../services/comments';

export default function Details() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isFav, setIsFav] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [favError, setFavError] = useState('');

  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentError, setCommentError] = useState('');

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

  useEffect(() => {
    let isMounted = true;

    async function loadFavoriteStatus() {
      if (!user) {
        setIsFav(false);
        return;
      }
      try {
        const favorited = await isFavorite(user.uid, id);
        if (isMounted) {
          setIsFav(favorited);
        }
      } catch {
        // Not critical — the button just stays in its default "not favorited" state.
      }
    }

    loadFavoriteStatus();

    return () => {
      isMounted = false;
    };
  }, [id, user]);

  useEffect(() => {
    let isMounted = true;

    async function loadComments() {
      try {
        const data = await getComments(id);
        if (isMounted) {
          setComments(data);
        }
      } catch {
        if (isMounted) {
          setCommentError('Could not load comments.');
        }
      } finally {
        if (isMounted) {
          setCommentsLoading(false);
        }
      }
    }

    loadComments();

    return () => {
      isMounted = false;
    };
  }, [id]);

  async function handleDelete() {
    if (!isAuthor) {
      return;
    }

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

  async function handleToggleFavorite() {
    if (isAuthor) {
      return;
    }

    if (!user) {
      window.alert('Please log in or register to add this listing to your favorites.');
      return;
    }

    setFavError('');
    setFavLoading(true);
    try {
      if (isFav) {
        await removeFavorite(user.uid, id);
        setIsFav(false);
      } else {
        await addFavorite(user.uid, id);
        setIsFav(true);
      }
    } catch {
      setFavError('Could not update favorites. Please try again.');
    } finally {
      setFavLoading(false);
    }
  }

  async function handleCommentSubmit(e) {
    e.preventDefault();
    setCommentError('');

    if (!commentText.trim()) {
      setCommentError('Comment cannot be empty.');
      return;
    }

    setCommentSubmitting(true);
    try {
      await addComment({
        listingId: id,
        userId: user.uid,
        userName: user.email,
        text: commentText.trim(),
      });
      const updated = await getComments(id);
      setComments(updated);
      setCommentText('');
    } catch {
      setCommentError('Could not post your comment. Please try again.');
    } finally {
      setCommentSubmitting(false);
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

      {!isAuthor && (
        <div>
          <button
            onClick={handleToggleFavorite}
            disabled={favLoading}
            className={user ? '' : 'btn-inactive'}
          >
            {isFav ? '👍 Favorited' : '👍 Add to favorites'}
          </button>
          {favError && <p className="form-error">{favError}</p>}
        </div>
      )}

      <div>
        <h3>Comments</h3>

        {commentsLoading ? (
          <p>Loading comments...</p>
        ) : comments.length === 0 ? (
          <p>No comments yet.</p>
        ) : (
          comments.map((comment) => (
            <p key={comment.id}>
              <strong>{comment.userName}</strong>: {comment.text}
            </p>
          ))
        )}

        {user ? (
          <form onSubmit={handleCommentSubmit}>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
            />
            {commentError && <p className="form-error">{commentError}</p>}
            <button type="submit" disabled={commentSubmitting}>
              {commentSubmitting ? 'Posting...' : 'Post comment'}
            </button>
          </form>
        ) : (
          <p>
            <Link to="/login">Log in</Link> to leave a comment.
          </p>
        )}
      </div>
    </div>
  );
}
