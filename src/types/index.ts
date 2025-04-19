export interface Activity {
  id: string;
  title: string;
  datetime: string;
  location?: string;
  description?: string;
  createdBy: string;
}

export type TabType = 'my-activities' | 'friends-activities';

export interface Tab {
  id: TabType;
  label: string;
}

export interface ActivityCardProps {
  activity: Activity;
  showCreator?: boolean;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export interface NewActivityFormData extends Omit<Activity, 'id' | 'createdBy'> {} 