export const contacts = [
  { initials: 'AK', name: 'Ali Khan', phone: '+92 300 1234567' },
  { initials: 'SA', name: 'Sara Ahmed', phone: '+92 321 7654321' },
  { initials: 'HR', name: 'Hamza Raza', phone: '+92 333 4567890' },
  { initials: 'AN', name: 'Ayesha Noor', phone: '+92 301 9081726' },
  { initials: 'UM', name: 'Usman Malik', phone: '+92 312 4412200' },
]

export const conversations = [
  { id: 'ali', initials: 'AK', name: 'Ali Khan', phone: '+92 300 1234567', message: 'Can you share the updated price?', time: '2m' },
  { id: 'sara', initials: 'SA', name: 'Sara Ahmed', phone: '+92 321 7654321', message: 'Thank you!', time: '18m' },
  { id: 'hamza', initials: 'HR', name: 'Hamza Raza', phone: '+92 333 4567890', message: 'I received the broadcast.', time: '1h' },
  { id: 'ayesha', initials: 'AN', name: 'Ayesha Noor', phone: '+92 301 9081726', message: 'Perfect, I will check it.', time: '3h' },
  { id: 'usman', initials: 'UM', name: 'Usman Malik', phone: '+92 312 4412200', message: 'Image', time: 'Yesterday' },
]

export const messages = [
  { id: 1, direction: 'received', text: 'Hi! Can you share the updated price list?', time: '1:30 PM' },
  { id: 2, direction: 'sent', text: 'Sure, I will send it over now.', time: '1:31 PM', status: 'sent' },
  {
    id: 3,
    direction: 'sent',
    text: 'Here is the latest list.',
    image: { label: 'September price list', tone: 'blue' },
    time: '1:32 PM',
    status: 'delivered',
  },
  {
    id: 4,
    direction: 'received',
    text: 'Perfect, thank you. Is this valid for September?',
    replyTo: { author: 'You', text: 'Here is the latest list.', image: true },
    time: '1:34 PM',
  },
  {
    id: 5,
    direction: 'sent',
    text: 'Yes, these prices are valid for the whole month.',
    replyTo: { author: 'Ali Khan', text: 'Is this valid for September?' },
    time: '1:35 PM',
    status: 'read',
  },
]

export const lists = [
  { name: 'VIP Customers', description: 'High-value customers', count: 42 },
  { name: 'Karachi Customers', description: 'Customers in Karachi', count: 128 },
  { name: 'New Arrivals', description: 'Interested in new stock', count: 86 },
  { name: 'Wholesale Buyers', description: 'Bulk and wholesale buyers', count: 34 },
  { name: 'Inactive 30+ Days', description: 'Re-engagement audience', count: 19 },
  { name: 'September Leads', description: 'New leads this month', count: 57 },
]
