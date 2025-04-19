import React from 'react';
import { cardClasses } from '../styles/common';
import { ActivityCardProps } from '../types';
import { formatDateTime } from '../utils/dateTime';

function ActivityCard({ activity, showCreator = false }: ActivityCardProps) {
  const formattedDateTime = formatDateTime(activity.datetime);

  return (
    <div className={cardClasses.container}>
      <div className="flex justify-between items-start">
        <h3 className={cardClasses.title}>{activity.title}</h3>
        {showCreator && (
          <span className={cardClasses.metadata}>by {activity.createdBy}</span>
        )}
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