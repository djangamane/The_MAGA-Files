<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

## Run Locally
This project is designed for deployment on Vercel. The recommended way to run it locally is with the Vercel CLI, which accurately simulates the production environment, including the serverless API function.

**Prerequisites:** Node.js and the Vercel CLI.

1.  **Clone the repository and install dependencies:**
    ```bash
    git clone https://github.com/djangamane/The_MAGA-Files.git
    cd The_MAGA-Files
    npm install
    ```

2.  **Set up local environment variables:**
    Create a file named `.env.local` and add your secret keys. This file is ignored by Git.
    ```sh
    # Your Gemini API Key (kept secret on the server)
    GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"

    # The public URL to your daily-updated CSV file
    VITE_CSV_URL="YOUR_PUBLIC_CSV_URL_HERE"
    
    # Supabase configuration
    VITE_SUPABASE_URL="YOUR_SUPABASE_PROJECT_URL"
    VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
    ```

3.  **Run the development server:**
    ```bash
    npm run start
    ```

## Supabase Setup
This project uses Supabase for user authentication and data storage. To set up Supabase:

1. Create a Supabase account and project at [https://supabase.com](https://supabase.com)
2. Create the necessary database tables by running the SQL commands in `docs/supabase-schema.sql`
3. Configure authentication using the guide in `docs/supabase-auth-setup.md`
4. Add your Supabase credentials to your environment variables as shown above

## Deploy to Vercel
This is the primary method for deploying the application.

1. Push your code to a GitHub repository.
2. Import the project into Vercel from your GitHub repository.
3. Vercel will automatically detect that this is a Vite application.
4. **Crucial Step:** Go to your project's **Settings > Environment Variables** in the Vercel dashboard. Add your `GEMINI_API_KEY`, `VITE_CSV_URL`, `VITE_SUPABASE_URL`, and `VITE_SUPABASE_ANON_KEY`.
5. Deploy! Your serverless function in the `api` directory will be deployed automatically.