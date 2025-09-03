# Supabase Setup for The MAGA Files

This document explains how to set up Supabase for the The MAGA Files application.

## Prerequisites

1. Create a Supabase account at [https://supabase.com](https://supabase.com)
2. Create a new Supabase project

## Environment Variables

Add the following environment variables to your project:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Schema

Run the SQL commands in `supabase-schema.sql` to create the necessary tables:

1. `users` - Stores user information and query limits
2. `user_analyses` - Stores analysis results for premium users

## Authentication

The application uses Supabase's email authentication. Users can sign up with their email address and will be granted access according to their subscription status.

## Free Tier vs Paid Tier

- **Free Tier**: Limited to 3 queries per day
- **Paid Tier**: Unlimited queries and ability to receive analysis results via email

## Implementation Details

The application checks the user's subscription status and query count before allowing analysis requests. Users who exceed their daily limit will be prompted to upgrade to the paid tier.