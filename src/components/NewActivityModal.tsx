import React, { useState } from 'react';
import type { Activity } from '../types/Activity';
import Modal from './common/Modal';
import { buttonClasses, formClasses } from '../styles/common';
import { addActivity } from '../services/firestore';
import { auth } from '../config/firebase';

interface NewActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (activity: Activity) => void;
}

interface FormData {
  title: string;
  datetime: string;
  location: string;
  description: string;
}

function NewActivityModal({ isOpen, onClose, onSubmit }: NewActivityModalProps) {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    datetime: '',
    location: '',
    description: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      setError('You must be signed in to create an activity');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const activity = await addActivity({
        ...formData,
        createdBy: auth.currentUser.uid
      }, auth.currentUser.uid);

      onSubmit(activity);
      setFormData({
        title: '',
        datetime: '',
        location: '',
        description: ''
      });
      onClose();
    } catch (err) {
      console.error('Error creating activity:', err);
      setError('Failed to create activity. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-serif text-instagram-brown mb-4">Create New Activity</h2>
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className={formClasses.label}>
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className={formClasses.input}
              placeholder="Activity title"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="datetime" className={formClasses.label}>
              Date and Time *
            </label>
            <input
              type="datetime-local"
              id="datetime"
              name="datetime"
              required
              value={formData.datetime}
              onChange={handleChange}
              className={formClasses.input}
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="location" className={formClasses.label}>
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className={formClasses.input}
              placeholder="Activity location"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="description" className={formClasses.label}>
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={`${formClasses.input} h-24 resize-none`}
              placeholder="Activity description"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className={buttonClasses.secondary}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`${buttonClasses.primary} flex items-center gap-2`}
            disabled={isLoading}
          >
            {isLoading && (
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isLoading ? 'Creating...' : 'Create Activity'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default NewActivityModal; 