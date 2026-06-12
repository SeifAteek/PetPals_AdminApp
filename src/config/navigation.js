/**
 * Admin navigation — each item maps to a Supabase table config in entities.js
 */
export const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [{ id: 'overview', label: 'Dashboard', icon: 'LayoutDashboard' }],
  },
  {
    label: 'Users',
    items: [
      { id: 'profiles', label: 'Profiles', icon: 'Users' },
      { id: 'adopter_profiles', label: 'Adopters', icon: 'UserCircle' },
    ],
  },
  {
    label: 'Partners',
    items: [
      { id: 'clinics', label: 'Clinics', icon: 'Stethoscope' },
      { id: 'shelter_profiles', label: 'Shelters', icon: 'Home' },
      { id: 'shops', label: 'Shops', icon: 'ShoppingBag' },
    ],
  },
  {
    label: 'Animals',
    items: [
      { id: 'pets', label: 'Pets', icon: 'PawPrint' },
      { id: 'applications', label: 'Adoption Apps', icon: 'FileText' },
      { id: 'smart_collars', label: 'Smart Collars', icon: 'Radio' },
      { id: 'collar_sightings', label: 'Collar Sightings', icon: 'MapPin' },
    ],
  },
  {
    label: 'Clinical',
    items: [
      { id: 'appointments', label: 'Appointments', icon: 'Calendar' },
      { id: 'medical_records', label: 'Medical Records', icon: 'HeartPulse' },
      { id: 'clinic_procedures', label: 'Clinic Procedures', icon: 'ClipboardList' },
      { id: 'clinic_staff', label: 'Clinic Staff', icon: 'UserCog' },
      { id: 'inventory_items', label: 'Clinic Inventory', icon: 'Package' },
      { id: 'clinic_expenses', label: 'Clinic Expenses', icon: 'Wallet' },
    ],
  },
  {
    label: 'Commerce',
    items: [
      { id: 'products', label: 'Products', icon: 'Tag' },
      { id: 'orders', label: 'Orders', icon: 'Truck' },
      { id: 'order_items', label: 'Order Items', icon: 'List' },
      { id: 'invoices', label: 'Invoices', icon: 'Receipt' },
      { id: 'receipts', label: 'Receipts', icon: 'FileCheck' },
    ],
  },
  {
    label: 'Charity',
    items: [
      { id: 'campaigns', label: 'Campaigns', icon: 'Heart' },
      { id: 'donations', label: 'Donations', icon: 'Coins' },
    ],
  },
  {
    label: 'Community',
    items: [
      { id: 'community_subreddits', label: 'Discussions', icon: 'MessagesSquare' },
      { id: 'community_posts', label: 'Posts', icon: 'Newspaper' },
      { id: 'community_comments', label: 'Comments', icon: 'MessageCircle' },
      { id: 'community_votes', label: 'Votes', icon: 'ThumbsUp' },
    ],
  },
  {
    label: 'Engagement',
    items: [
      { id: 'messages', label: 'Messages', icon: 'Mail' },
      { id: 'entity_reviews', label: 'Reviews', icon: 'Star' },
    ],
  },
  {
    label: 'System',
    items: [
      { id: 'user_personality_profiles', label: 'AI Personalities', icon: 'Sparkles' },
      { id: 'appointment_usage', label: 'Appointment Usage', icon: 'PieChart' },
    ],
  },
]

export const OVERVIEW_STATS = [
  { table: 'profiles', label: 'Registered Users', icon: 'Users', description: 'Platform accounts across all roles' },
  { table: 'pets', label: 'Listed Pets', icon: 'PawPrint', description: 'Animals available for adoption' },
  { table: 'clinics', label: 'Veterinary Clinics', icon: 'Stethoscope', description: 'Partner clinics on the platform' },
  { table: 'shelter_profiles', label: 'Animal Shelters', icon: 'Home', description: 'Registered shelter organizations' },
  { table: 'shops', label: 'Pet Shops', icon: 'ShoppingBag', description: 'Retail partners and storefronts' },
  { table: 'orders', label: 'Commerce Orders', icon: 'Truck', description: 'Completed and pending purchases' },
  { table: 'campaigns', label: 'Fundraising Campaigns', icon: 'Heart', description: 'Active and closed charity drives' },
  { table: 'community_posts', label: 'Community Posts', icon: 'Newspaper', description: 'Published discussion threads' },
]
