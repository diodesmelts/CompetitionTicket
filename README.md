# Competition Ticket Platform

A dynamic prize competitions platform that connects users with exciting challenges through a robust web application.

## Tech Stack
- React frontend with TypeScript
- Express backend
- PostgreSQL database with Drizzle ORM
- Stripe Checkout integration
- TailwindCSS for styling

## Development

To run the application locally:

```bash
npm install
npm run dev
```

## Deployment to Render

This application is configured for easy deployment on Render.

### Prerequisites

1. Create a PostgreSQL database on Render or use any PostgreSQL database
2. Set up a Stripe account and obtain API keys
3. Fork/clone this repository to your GitHub account

### Deployment Steps

1. In Render, create a new Web Service
2. Connect your GitHub repository
3. Use the following settings:
   - **Environment**: Node
   - **Build Command**: `node render-build.js`
   - **Start Command**: `NODE_ENV=production tsx server/index.ts`
4. Set the following environment variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `STRIPE_SECRET_KEY`: Your Stripe secret key
   - `VITE_STRIPE_PUBLIC_KEY`: Your Stripe publishable key
   - `SESSION_SECRET`: A random string for session encryption
5. Deploy the application

### Alternative: Deploy with render.yaml

If you have the Render CLI or Blueprint feature enabled:

1. Fork/clone this repository
2. Run `render blueprint apply` or use the Blueprint button in the Render dashboard
3. Configure the required environment variables

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
DATABASE_URL=postgresql://user:password@localhost:5432/database
SESSION_SECRET=your-session-secret
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
```

## License

MIT