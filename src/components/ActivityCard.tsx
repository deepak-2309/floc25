import React, { useState } from 'react';
import { cardClasses } from '../styles/common';
import { ActivityCardProps } from '../types';
import { formatDateTime } from '../utils/dateTime';
import { deleteActivity } from '../services/firestore';
import { auth } from '../config/firebase';

function ActivityCard({ activity, showCreator = false, onDelete }: ActivityCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const formattedDateTime = formatDateTime(activity.datetime);
  const isOwner = auth.currentUser?.uid === activity.createdBy;

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this activity?')) {
      return;
    }

    try {
      setIsDeleting(true);
      await deleteActivity(activity.id);
      onDelete?.(activity.id);
    } catch (error) {
      console.error('Error deleting activity:', error);
      alert('Failed to delete activity. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={`${cardClasses.container} relative`}>
      <div className="flex justify-between items-start">
        <h3 className={cardClasses.title}>{activity.title}</h3>
        <div className="flex items-center gap-2">
          {showCreator && (
            <span className={cardClasses.metadata}>by {activity.createdBy}</span>
          )}
          {isOwner && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className={`text-red-500 hover:text-red-700 transition-colors ${
                isDeleting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              title="Delete activity"
            >
              {isDeleting ? (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
      <p className={cardClasses.metadata}>
        {formattedDateTime}
      </p>
      {activity.location && (
        <p className={`${cardClasses.metadata} flex items-center gap-1`}>
          <span className="text-instagram-accent">📍</span> {activity.location}
        </p>
      )}
      {activity.description && (
        <p className={cardClasses.description}>{activity.description}</p>
      )}
    </div>
  );
}

export default ActivityCard; 