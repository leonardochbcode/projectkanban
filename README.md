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
```

### 3. Set up the database

You need to create a PostgreSQL database with the name you specified in the `POSTGRES_URL`. Once the database is created, you can create the schema and populate it with initial data by running the following npm scripts:

First, apply the schema:
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
