import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createListing } from '../services/listings';
import '../components/Form.css';

const PET_TYPES = ['Dog', 'Cat', 'Bird', 'Rodent', 'Fish', 'Other'];

export default function Create() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('product');
  const [imageUrl, setImageUrl] = useState('');
  const [petType, setPetType] = useState(PET_TYPES[0]);
  const [condition, setCondition] = useState('new');
  const [brand, setBrand] = useState('');
  const [availability, setAvailability] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
      title: title.trim(),
      description: description.trim(),
      price: priceNumber,
      category,
      imageUrl: imageUrl.trim(),
      petType,
      authorId: user.uid,
      authorName: user.email,
    };

    if (category === 'product') {
      data.condition = condition;
      data.brand = brand.trim();
    } else {
      data.availability = availability.trim();
    }

    setSubmitting(true);
    try {
      await createListing(data);
      navigate('/catalog');
    } catch {
      setError('Could not create the listing. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h2>Add Ad</h2>

      <form onSubmit={handleSubmit} className="form">
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
          <label htmlFor="price">Price (€)</label>
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

        {error && <p className="form-error">{error}</p>}

        <button type="submit" disabled={submitting}>
          {submitting ? 'Publishing...' : 'Publish ad'}
        </button>
      </form>
    </div>
  );
}
