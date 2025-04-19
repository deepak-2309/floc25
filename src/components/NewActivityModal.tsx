import React, { useState } from 'react';
import type { Activity, NewActivityFormData } from '../types';
import Modal from './common/Modal';
import { buttonClasses, formClasses } from '../styles/common';

interface NewActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (activity: Omit<Activity, 'id'>) => void;
}

function NewActivityModal({ isOpen, onClose, onSubmit }: NewActivityModalProps) {
  const [formData, setFormData] = useState<NewActivityFormData>({
    title: '',
    datetime: '',
    location: '',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      createdBy: 'me'
    });
    setFormData({
      title: '',
      datetime: '',
      location: '',
      description: ''
    });
    onClose();
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
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className={buttonClasses.secondary}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={buttonClasses.primary}
          >
            Create Activity
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default NewActivityModal; 