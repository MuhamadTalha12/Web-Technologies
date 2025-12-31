export const SERVICE_CATEGORIES = [
  { value: 'web_development', label: 'Web Development', icon: '🌐' },
  { value: 'mobile_development', label: 'Mobile Development', icon: '📱' },
  { value: 'ui_ux_design', label: 'UI/UX Design', icon: '🎨' },
  { value: 'graphic_design', label: 'Graphic Design', icon: '✏️' },
  { value: 'digital_marketing', label: 'Digital Marketing', icon: '📈' },
  { value: 'content_writing', label: 'Content Writing', icon: '✍️' },
  { value: 'video_editing', label: 'Video Editing', icon: '🎬' },
  { value: 'photography', label: 'Photography', icon: '📷' },
  { value: 'consulting', label: 'Consulting', icon: '💼' },
  { value: 'other', label: 'Other', icon: '🔧' },
] as const;

export const BOOKING_STATUS = {
  pending: { label: 'Pending', color: 'warning' },
  confirmed: { label: 'Confirmed', color: 'info' },
  in_progress: { label: 'In Progress', color: 'primary' },
  completed: { label: 'Completed', color: 'success' },
  cancelled: { label: 'Cancelled', color: 'destructive' },
} as const;

export const ITEMS_PER_PAGE = 12;
