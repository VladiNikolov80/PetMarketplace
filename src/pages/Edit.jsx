import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getListingById, updateListing } from '../services/listings';
import '../components/Form.css';

const PET_TYPES = ['Dog', 'Cat', 'Bird', 'Rodent', 'Fish', 'Other'];

export default function Edit() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [listingType, setListingType] = useState('offer');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('product');
  const [imageUrl, setImageUrl] = useState('');
  const [petType, setPetType] = useState(PET_TYPES[0]);
  const [condition, setCondition] = useState('new');
  const [brand, setBrand] = useState('');
  const [availability, setAvailability] = useState('');

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
          setError('This ad does not exist.');
          return;
        }
        setListingType(data.listingType || 'offer');
        setTitle(data.title);
        setDescription(data.description);
        setPrice(String(data.price));
        setCategory(data.category);
        setImageUrl(data.imageUrl || '');
        setPetType(data.petType || PET_TYPES[0]);
        setCondition(data.condition || 'new');
        setBrand(data.brand || '');
        setAvailability(data.availability || '');
        setAuthorId(data.authorId);
      } catch {
        if (isMounted) {
          setError('Could not load this ad.');
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

    const data = {
      listingType,
      title: title.trim(),
      description: description.trim(),
      price: priceNumber,
      category,
      imageUrl: imageUrl.trim(),
      petType,
    };

    if (category === 'product') {
      data.condition = condition;
      data.brand = brand.trim();
      data.availability = '';
    } else {
      data.availability = availability.trim();
      data.condition = '';
      data.brand = '';
    }

    setSubmitting(true);
    try {
      await updateListing(id, data);
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
    return <p className="form-error">You are not allowed to edit this ad.</p>;
  }

  return (
    <div>
      <h2>Edit Ad</h2>

      <form onSubmit={handleSubmit} className="form">
        <div className="form-field">
          <label htmlFor="listingType">Ad type</label>
          <select
            id="listingType"
            value={listingType}
            onChange={(e) => setListingType(e.target.value)}
          >
            <option value="offer">Offering</option>
            <option value="wanted">Looking for</option>
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="form-field">
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

        <div className="form-field">
          <label htmlFor="petType">Pet type</label>
          <select
            id="petType"
            value={petType}
            onChange={(e) => setPetType(e.target.value)}
          >
            {PET_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {category === 'product' ? (
          <>
            <div className="form-field">
              <label htmlFor="condition">Condition</label>
              <select
                id="condition"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
              >
                <option value="new">New</option>
                <option value="used">Used</option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="brand">Brand (optional)</label>
              <input
                id="brand"
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              />
            </div>
          </>
        ) : (
          <div className="form-field">
            <label htmlFor="availability">Availability (optional)</label>
            <input
              id="availability"
              type="text"
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              placeholder="e.g. Mon-Fri, 9-18h"
            />
          </div>
        )}

        <div className="form-field">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="form-field">
          <label htmlFor="price">{listingType === 'wanted' ? 'Budget (€)' : 'Price (€)'}</label>
          <input
            id="price"
            type="number"
            min="0"
            step="1"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>

        <div className="form-field">
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
