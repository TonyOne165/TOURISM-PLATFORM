import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTours } from '../hooks/useTours';
import type { CreateTourInput } from '../types';

export const Admin: React.FC = () => {
  const { userProfile } = useAuth();
  const { tours, createTour, updateTour, deleteTour, loading } = useTours();
  
  const [showForm, setShowForm] = useState(false);
  const [editingTour, setEditingTour] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateTourInput>({
    title: '',
    description: '',
    price: 0,
    coords: { lat: 10.4236, lng: -75.5366 },
    duration: '',
    category: '',
  });
  const [imageUrls, setImageUrls] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Parse image URLs from comma-separated string
      const imagesArray = imageUrls
        .split(',')
        .map(url => url.trim())
        .filter(url => url.length > 0);

      if (editingTour) {
        await updateTour(editingTour, { ...formData, images: imagesArray });
      } else {
        await createTour(formData, userProfile!.uid, imagesArray);
      }
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        price: 0,
        coords: { lat: 10.4236, lng: -75.5366 },
        duration: '',
        category: '',
      });
      setImageUrls('');
      setShowForm(false);
      setEditingTour(null);
    } catch (error) {
      console.error('Error submitting tour:', error);
      alert('Failed to save tour');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (tourId: string) => {
    const tour = tours.find(t => t.id === tourId);
    if (tour) {
      setFormData({
        title: tour.title,
        description: tour.description,
        price: tour.price,
        coords: tour.coords,
        duration: tour.duration,
        category: tour.category,
      });
      setImageUrls(tour.images?.join(', ') || '');
      setEditingTour(tourId);
      setShowForm(true);
    }
  };

  const handleDelete = async (tourId: string) => {
    if (window.confirm('Are you sure you want to delete this tour?')) {
      try {
        await deleteTour(tourId);
      } catch (error) {
        console.error('Error deleting tour:', error);
        alert('Failed to delete tour');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 pt-16 overflow-x-hidden">
      <div className="container mx-auto px-4 sm:px-6 py-8 min-w-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold">Admin Panel</h1>
            <p className="text-base sm:text-lg text-gray-600">Manage tours and bookings</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => {
              setShowForm(!showForm);
              setEditingTour(null);
              setFormData({
                title: '',
                description: '',
                price: 0,
                coords: { lat: 10.4236, lng: -75.5366 },
                duration: '',
                category: '',
              });
              setImageUrls('');
            }}
          >
            {showForm ? 'Cancel' : 'Add New Tour'}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="card bg-base-100 shadow-xl mb-8">
            <div className="card-body">
              <h2 className="card-title">
                {editingTour ? 'Edit Tour' : 'Create New Tour'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Title *</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Price (USD) *</span>
                    </label>
                    <input
                      type="number"
                      className="input input-bordered"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                      required
                      min="0"
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Duration *</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 3 hours, 2 days"
                      className="input input-bordered"
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: e.target.value})}
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Category</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Beach, Historic"
                      className="input input-bordered"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Latitude *</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      className="input input-bordered"
                      value={formData.coords.lat}
                      onChange={(e) => setFormData({
                        ...formData, 
                        coords: {...formData.coords, lat: parseFloat(e.target.value)}
                      })}
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Longitude *</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      className="input input-bordered"
                      value={formData.coords.lng}
                      onChange={(e) => setFormData({
                        ...formData, 
                        coords: {...formData.coords, lng: parseFloat(e.target.value)}
                      })}
                      required
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Description *</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered h-32"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Image URLs (comma-separated)</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered h-24"
                    placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                    value={imageUrls}
                    onChange={(e) => setImageUrls(e.target.value)}
                  />
                  <label className="label">
                    <span className="label-text-alt">Enter image URLs separated by commas. Use Unsplash, Imgur, or any image hosting service.</span>
                  </label>
                </div>

                <div className="flex gap-4">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? <span className="loading loading-spinner"></span> : 'Save Tour'}
                  </button>
                  <button 
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => {
                      setShowForm(false);
                      setEditingTour(null);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tours Table */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title mb-4">All Tours ({tours.length})</h2>
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Title</th>
                    <th>Price</th>
                    <th>Duration</th>
                    <th>Rating</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tours.map(tour => (
                    <tr key={tour.id}>
                      <td>
                        <div className="avatar">
                          <div className="mask mask-squircle w-12 h-12">
                            <img 
                              src={tour.images?.[0] || 'https://placehold.co/100x100'} 
                              alt={tour.title} 
                            />
                          </div>
                        </div>
                      </td>
                      <td>{tour.title}</td>
                      <td>${tour.price}</td>
                      <td>{tour.duration}</td>
                      <td>{tour.rating.toFixed(1)} ⭐</td>
                      <td>
                        <div className="flex gap-2">
                          <button
                            className="btn btn-sm btn-ghost"
                            onClick={() => handleEdit(tour.id!)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-error"
                            onClick={() => handleDelete(tour.id!)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};