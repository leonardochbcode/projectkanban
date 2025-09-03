# Project Management Tool

This is a Next.js application for project management, originally a starter template, now migrated to a full-stack application with a PostgreSQL backend.

## Local Development Setup

To run this project locally, you'll need to have Node.js and PostgreSQL installed.

### 1. Clone the repository and install dependencies

```bash
git clone <repository-url>
cd <repository-name>
npm install
```

### 2. Set up the environment variables

Create a `.env.local` file in the root of the project by copying the example below. Replace the placeholder values with your actual PostgreSQL connection details.

```
# .env.local

# PostgreSQL connection details
# Replace with your actual database credentials
POSTGRES_URL="postgresql://jules:password@localhost:5432/chb-systems"

# JWT Secret for authentication
# Use a long, random string for security
JWT_SECRET="your-super-secret-and-long-jwt-secret"

# --- Google OAuth Credentials ---
# Follow the guide below to create these credentials
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# A secret for NextAuth.js. You can generate one with: openssl rand -base64 32
NEXTAUTH_SECRET="your-nextauth-secret"

# The base URL of your application for NextAuth callbacks
NEXTAUTH_URL="http://localhost:9002"
```

#### Setting up Google OAuth

To enable login with Google, you need to create OAuth 2.0 credentials in the Google Cloud Console.

1.  Go to the [Google Cloud Console Credentials page](https://console.cloud.google.com/apis/credentials).
2.  Click **Create credentials** > **OAuth client ID**.
3.  Select **Web application** as the application type.
4.  Give it a name (e.g., "CHBProject Dev").
5.  Under **Authorized redirect URIs**, add the following URL:
    `http://localhost:9002/api/auth/callback/google`
6.  Click **Create**. You will be shown your Client ID and Client Secret. Copy these values into the `.env.local` file.

### 3. Set up the database

You need to create a PostgreSQL database with the name you specified in the `POSTGRES_URL`. Once the database is created, you can create the schema and populate it with initial data by running the following npm scripts:

First, apply the schema. If you had a previous version of the app, you need to run this again to add the fields required for Google Authentication.
```bash
npm run db:schema
```
This will create all the necessary tables, relations, and constraints.

Next, seed the database with initial data:
```bash
npm run db:seed
```
This will populate the tables with sample projects, users, tasks, etc.

### 4. Run the development server

Once the setup is complete, you can start the Next.js development server:

```bash
npm run dev
```

The application should now be running at [http://localhost:9002](http://localhost:9002).

You can log in with one of the default users from the seed data, for example:
- **Email:** `admin@chb.com.br`
- **Password:** `chb123`
