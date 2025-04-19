export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
}; 