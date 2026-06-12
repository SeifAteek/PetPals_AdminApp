# PetPals Admin

Web console for platform administrators. Manage users, clinics, shelters, shops, pets, commerce, charity, and community data.

## Setup

1. Copy environment variables from ClinicApp:

```bash
cp ../ClinicApp2/ClinicApp/.env.local .env.local
```

2. Install and run:

```bash
npm install
npm run dev
```

Open **http://localhost:5177**

## Admin access

1. Create a user in Supabase Auth (or use an existing account).
2. Set `profiles.user_type` to `Admin` for that user's `user_id`.
3. Run the **ADMIN APP** SQL block at the bottom of `/dbSQL.txt` in Supabase (creates `is_admin()` and RLS policies).
4. Sign in at the admin portal.

## Features

- **Dashboard** — live counts across major tables
- **CRUD** — browse, search, add, edit, delete for 25+ entity types
- **Community** — manage discussions (subreddits), posts, comments, votes
- **Users** — promote accounts to Admin / Clinic / Shelter / Adopter
