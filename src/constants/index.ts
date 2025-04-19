import { Tab, Activity } from '../types';

export const TABS: Tab[] = [
  { id: 'my-activities', label: 'My Activities' },
  { id: 'friends-activities', label: "Friends' Activities" }
];

export const SAMPLE_ACTIVITIES: Activity[] = [
  {
    id: '1',
    title: 'Sprints',
    datetime: '2024-01-20T05:00:00',
    location: 'Central Park',
    description: 'Morning sprint training',
    createdBy: 'me'
  },
  {
    id: '2',
    title: 'Stand-up Comedy Show',
    datetime: '2024-01-21T20:00:00',
    location: 'Laugh Factory',
    description: 'Open mic night',
    createdBy: 'me'
  },
  {
    id: '3',
    title: 'Yoga Session',
    datetime: '2024-01-22T07:00:00',
    location: 'Home',
    description: 'Morning yoga routine',
    createdBy: 'me'
  }
];

export const SAMPLE_FRIENDS_ACTIVITIES: Activity[] = [
  {
    id: '4',
    title: 'Basketball Game',
    datetime: '2024-01-20T18:00:00',
    location: 'Community Center',
    description: 'Pickup basketball game',
    createdBy: 'John'
  },
  {
    id: '5',
    title: 'Book Club Meeting',
    datetime: '2024-01-21T19:00:00',
    location: 'City Library',
    description: 'Discussing "The Midnight Library"',
    createdBy: 'Sarah'
  },
  {
    id: '6',
    title: 'Hiking Trip',
    datetime: '2024-01-22T09:00:00',
    location: 'Mountain Trail',
    description: 'Easy to moderate difficulty, 2-hour hike',
    createdBy: 'Mike'
  }
]; 