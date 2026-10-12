import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getListingById, updateListing } from '../services/listings';

export default function Edit() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('product');
  const [imageUrl, setImageUrl] = useState('');

  const [authorId, setAuthorId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadListing() {
      try {
        const data = await getListingById(id);
        if (!isMounted) {
          return;
        }
        if (!data) {
          setError('This listing does not exist.');
          return;
        }
        setTitle(data.title);
        setDescription(data.description);
        setPrice(String(data.price));
        setCategory(data.category);
        setImageUrl(data.imageUrl || '');
        setAuthorId(data.authorId);
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

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!title.trim() || !description.trim() || !price) {
      setError('Please fill in title, description and price.');
      return;
    }

    const priceNumber = Number(price);
    if (Number.isNaN(priceNumber) || priceNumber <= 0) {
      setError('Price must be a positive number.');
      return;
    }

    setSubmitting(true);
    try {
      await updateListing(id, {
        title: title.trim(),
        description: description.trim(),
        price: priceNumber,
        category,
        imageUrl: imageUrl.trim(),
      });
      navigate(`/catalog/${id}`);
    } catch {
      setError('Could not save changes. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p className="form-error">{error}</p>;
  }

  if (authorId !== user.uid) {
    return <p className="form-error">You are not allowed to edit this listing.</p>;
  }

  return (
    <div>
      <h2>Edit Listing</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="category">Category</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="product">Product</option>
            <option value="service">Service</option>
          </select>
        </div>

        <div>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="price">Price (BGN)</label>
          <input
            id="price"
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="imageUrl">Image URL</label>
          <input
            id="imageUrl"
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>

        <button type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}
