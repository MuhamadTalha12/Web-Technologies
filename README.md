# Welcome to your Lovable project

## Running with MongoDB (MERN)

This repo now includes an Express + MongoDB backend in `server/`.

### 1) Start MongoDB

- Ensure MongoDB is running locally (or use MongoDB Atlas).

If you're using MongoDB Atlas, make sure your current IP is allowed under **Atlas → Security → Network Access** (for quick local dev you can temporarily allow `0.0.0.0/0`).

### 2) Start the API server

```sh
cd server
copy .env.example .env
npm i
npm run dev
```

By default the server runs on `http://localhost:5000`.

You can verify the API is reachable at `http://localhost:5000/api/health` (it also reports whether the DB is connected).

If you keep Vite on port `8080`, set `CLIENT_ORIGIN` in `server/.env` to:

```env
CLIENT_ORIGIN=http://localhost:8080
```

### 3) Start the React client

```sh
npm i
npm run dev
```

Vite proxies `/api` and `/uploads` to the backend during development.

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
