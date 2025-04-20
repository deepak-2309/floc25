// Activity related types
export interface Activity {
  /** Unique identifier for the activity */
  id: string;
  /** Title of the activity */
  title: string;
  /** ISO string of activity date and time */
  datetime: string;
  /** Optional location of the activity */
  location?: string;
  /** Optional description of the activity */
  description?: string;
  /** User ID or name of who created the activity */
  createdBy: string;
}

export interface ActivityCardProps {
  /** Activity data to display */
  activity: Activity;
  /** Whether to show who created the activity */
  showCreator?: boolean;
  /** Callback for deleting the activity */
  onDelete?: (activityId: string) => void;
}

// Navigation related types
export type TabType = 'my-activities' | 'friends-activities' | 'profile';

export interface Tab {
  /** Unique identifier for the tab */
  id: TabType;
  /** Display text for the tab */
  label: string;
}

// Common UI component types
export interface ModalProps {
  /** Whether the modal is visible */
  isOpen: boolean;
  /** Callback for closing the modal */
  onClose: () => void;
  /** Modal content */
  children: React.ReactNode;
} 