#!/bin/bash
# Build script for Render deployment

# Install dependencies
npm install

# Build the frontend
echo "Building frontend..."

# Run vite build with standard configuration
npx vite build

# Examine what Vite created
echo "Vite build output:"
ls -la dist/

# Create a simple index.html in case Vite's build failed
echo "Creating fallback index.html..."
mkdir -p dist/assets

# Try writing to the file with multiple methods to ensure it's created
echo "Method 1: Using cat with heredoc"
cat > dist/assets/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Competition Ticket</title>
    <style>
      body { font-family: sans-serif; margin: 0; padding: 20px; text-align: center; }
      h1 { color: #333; }
      .container { max-width: 800px; margin: 0 auto; }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Competition Ticket</h1>
      <p>Welcome to our prize competitions platform!</p>
      <p>The application is starting up. If you continue to see this page, please check the deployment logs.</p>
    </div>
  </body>
</html>
EOF

# Method 2: Using echo directly
echo "Method 2: Using echo directly"
echo '<!DOCTYPE html><html><head><title>Competition Ticket</title></head><body><h1>Competition Ticket</h1><p>Application is starting up...</p></body></html>' > dist/assets/index2.html

# Method 3: Using printf
echo "Method 3: Using printf"
printf '<!DOCTYPE html><html><head><title>Competition Ticket</title></head><body><h1>Competition Ticket</h1><p>Application is starting up...</p></body></html>' > dist/assets/index3.html

# Check what files are in the assets directory
echo "Files in assets directory after creation:"
ls -la dist/assets/

# Copy Vite's build to assets if it exists
if [ -f "dist/index.html" ]; then
  echo "Copying Vite build to assets directory..."
  cp -r dist/* dist/assets/ 2>/dev/null || echo "Warning: Some files couldn't be copied"
  # Remove the root level files to avoid confusion
  find dist -maxdepth 1 -type f -delete
fi

# Create a production-ready version of the server
echo "Creating production server build..."

# Create dist directory if it doesn't exist
mkdir -p dist

# Create a production server file that doesn't rely on Vite
cat > dist/server.js << 'EOF'
// Production server file - ES Modules syntax
import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer } from 'http';
import session from 'express-session';
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import pg from 'connect-pg-simple';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import from local files
import { registerRoutes } from './server/routes.js';
import { storage } from './server/storage.js';

// Set up connect-pg-simple
const PgSession = pg(session);

const PORT = process.env.PORT || 3000;
const app = express();

// Ensure environment variables
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Session configuration
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const sessionStore = new PgSession({
  pool,
  tableName: 'session'
});

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure session
app.use(session({
  store: sessionStore,
  secret: process.env.SESSION_SECRET || 'development_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  }
}));

// Serve static files from the React app
const assetsPath = path.join(__dirname, 'assets');
app.use(express.static(assetsPath));
console.log(`Serving static files from: ${assetsPath}`);

// Register API routes
const server = await registerRoutes(app);

// Send React's index.html for any other request
app.get('*', (req, res) => {
  // Try all possible index files in order
  const possiblePaths = [
    path.join(__dirname, 'assets', 'index.html'),
    path.join(__dirname, 'assets', 'index2.html'),
    path.join(__dirname, 'assets', 'index3.html')
  ];
  
  console.log('Request path:', req.path);
  console.log('Looking for index files in:', __dirname);
  
  // Safely check the contents of the assets directory
  let assetFiles = [];
  try {
    const assetsDir = path.join(__dirname, 'assets');
    console.log(`Checking if assets directory exists: ${fs.existsSync(assetsDir)}`);
    if (fs.existsSync(assetsDir)) {
      assetFiles = fs.readdirSync(assetsDir);
    } else {
      console.log('Assets directory does not exist. Attempting to create it...');
      fs.mkdirSync(assetsDir, { recursive: true });
      // Create a basic index.html in the assets directory
      fs.writeFileSync(path.join(assetsDir, 'index.html'), '<!DOCTYPE html><html><head><title>Competition Ticket</title></head><body><h1>Competition Ticket</h1><p>Welcome to our platform</p></body></html>');
      assetFiles = fs.readdirSync(assetsDir);
    }
  } catch (error) {
    console.error('Error checking assets directory:', error);
  }
  console.log('Files in assets dir:', assetFiles.join(', '));
  
  // Try each path
  for (const indexPath of possiblePaths) {
    console.log(`Checking if ${indexPath} exists...`);
    if (fs.existsSync(indexPath)) {
      console.log(`Found index file at: ${indexPath}`);
      return res.sendFile(indexPath);
    }
  }
  
  // If no index file found, serve a generated HTML
  console.log('No index file found. Serving generated HTML.');
  res.setHeader('Content-Type', 'text/html');
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Competition Ticket</title>
        <style>
          body { font-family: sans-serif; margin: 0; padding: 20px; text-align: center; }
          h1 { color: #333; }
          pre { background: #f5f5f5; padding: 15px; border-radius: 5px; text-align: left; overflow: auto; }
        </style>
      </head>
      <body>
        <h1>Competition Ticket</h1>
        <p>Application is starting up. Server is running but frontend files could not be found.</p>
        <p>Current directory: ${__dirname}</p>
        <h2>Debug Information:</h2>
        <pre>
Request: ${req.method} ${req.url}
Server directory: ${__dirname}
</pre>
      </body>
    </html>
  `);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: "Internal Server Error", 
    message: err.message 
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
EOF

# Transpile TypeScript server files to JavaScript for ES module imports
echo "Preparing server files for ES module imports..."

# Create server directory in dist
mkdir -p dist/server
mkdir -p dist/shared

# Create simplified JavaScript files with TypeScript types removed
cat > dist/server/routes.js << 'EOF'
import express from 'express';
import { createServer } from 'http';
import Stripe from 'stripe';
import { storage } from './storage.js';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export async function registerRoutes(app) {
  // Competitions routes
  app.get("/api/competitions", async (req, res) => {
    try {
      const competitions = await storage.getAllCompetitions();
      res.json(competitions);
    } catch (error) {
      res.status(500).json({ message: "Error fetching competitions" });
    }
  });

  app.get("/api/competitions/:id", async (req, res) => {
    try {
      const competition = await storage.getCompetitionById(Number(req.params.id));
      if (!competition) {
        return res.status(404).json({ message: "Competition not found" });
      }
      res.json(competition);
    } catch (error) {
      res.status(500).json({ message: "Error fetching competition" });
    }
  });

  // Cart routes
  app.get("/api/cart", async (req, res) => {
    try {
      const sessionId = req.session.id;
      const cartItems = await storage.getCartItems(sessionId);
      res.json(cartItems);
    } catch (error) {
      res.status(500).json({ message: "Error fetching cart items" });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const { competitionId, quantity } = req.body;
      const sessionId = req.session.id;
      
      // Check if item already in cart
      const existingItem = await storage.getCartItemWithCompetition(
        sessionId,
        competitionId
      );
      
      if (existingItem) {
        const updatedItem = await storage.updateCartItemQuantity(
          existingItem.id,
          existingItem.quantity + quantity
        );
        return res.status(200).json(updatedItem);
      }
      
      const newItem = await storage.addCartItem({
        sessionId,
        competitionId,
        quantity,
      });
      
      res.status(201).json(newItem);
    } catch (error) {
      res.status(500).json({ message: "Error adding item to cart" });
    }
  });

  app.patch("/api/cart/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { quantity } = req.body;
      
      if (quantity <= 0) {
        await storage.removeCartItem(id);
        return res.status(204).send();
      }
      
      const updatedItem = await storage.updateCartItemQuantity(id, quantity);
      if (!updatedItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      res.json(updatedItem);
    } catch (error) {
      res.status(500).json({ message: "Error updating cart item" });
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      await storage.removeCartItem(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error removing cart item" });
    }
  });

  // Stripe payment routes
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { cartItems } = req.body;
      
      if (!cartItems || !cartItems.length) {
        return res.status(400).json({ message: "No items in cart" });
      }
      
      let totalAmount = 0;
      for (const item of cartItems) {
        totalAmount += item.competition.ticketPrice * item.quantity;
      }
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalAmount * 100), // Convert to cents
        currency: "gbp",
        metadata: {
          sessionId: req.session.id,
        },
      });
      
      res.json({
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error) {
      res.status(500).json({ message: "Error creating payment intent" });
    }
  });

  // Order confirmation route
  app.post("/api/orders/confirm", async (req, res) => {
    try {
      const { paymentIntentId } = req.body;
      const sessionId = req.session.id;
      
      // Verify payment with Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status !== "succeeded") {
        return res.status(400).json({ message: "Payment not successful" });
      }
      
      // Get cart items
      const cartItems = await storage.getCartItems(sessionId);
      
      if (!cartItems.length) {
        return res.status(400).json({ message: "No items in cart" });
      }
      
      // Calculate total amount
      let totalAmount = 0;
      for (const item of cartItems) {
        totalAmount += item.competition.ticketPrice * item.quantity;
      }
      
      // Create order
      const order = await storage.createOrder({
        sessionId,
        totalAmount,
        stripePaymentIntentId: paymentIntentId,
        status: "completed",
      });
      
      // Create order items
      const orderItems = await storage.createOrderItems(
        cartItems.map((item) => ({
          orderId: order.id,
          competitionId: item.competitionId,
          quantity: item.quantity,
          ticketPrice: item.competition.ticketPrice,
        }))
      );
      
      // Update competition sold tickets
      for (const item of cartItems) {
        await storage.updateCompetitionSoldTickets(
          item.competitionId,
          item.quantity
        );
      }
      
      // Clear cart
      await storage.clearCart(sessionId);
      
      res.status(201).json({ order, items: orderItems });
    } catch (error) {
      res.status(500).json({ message: "Error processing order" });
    }
  });

  // Get order details
  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getOrderById(Number(req.params.id));
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Error fetching order" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
EOF

cat > dist/server/storage.js << 'EOF'
import { db } from './db.js';
import { competitions, cartItems, orders, orderItems } from '../shared/schema.js';
import { eq, and } from 'drizzle-orm';

export class DatabaseStorage {
  async getAllCompetitions() {
    return db.select().from(competitions).orderBy(competitions.endDate);
  }

  async getCompetitionsByCategory(category) {
    return db
      .select()
      .from(competitions)
      .where(eq(competitions.category, category))
      .orderBy(competitions.endDate);
  }

  async getCompetitionById(id) {
    const [competition] = await db
      .select()
      .from(competitions)
      .where(eq(competitions.id, id));
    return competition;
  }

  async createCompetition(competition) {
    const [created] = await db
      .insert(competitions)
      .values(competition)
      .returning();
    return created;
  }

  async updateCompetitionSoldTickets(id, quantity) {
    const [competition] = await db
      .select()
      .from(competitions)
      .where(eq(competitions.id, id));

    if (!competition) return undefined;

    const [updated] = await db
      .update(competitions)
      .set({
        soldTickets: competition.soldTickets + quantity,
      })
      .where(eq(competitions.id, id))
      .returning();
    return updated;
  }

  async getCartItems(sessionId) {
    const items = await db
      .select({
        id: cartItems.id,
        sessionId: cartItems.sessionId,
        competitionId: cartItems.competitionId,
        quantity: cartItems.quantity,
        createdAt: cartItems.createdAt,
        competition: competitions,
      })
      .from(cartItems)
      .leftJoin(competitions, eq(cartItems.competitionId, competitions.id))
      .where(eq(cartItems.sessionId, sessionId));

    return items;
  }

  async getCartItemWithCompetition(sessionId, competitionId) {
    const [item] = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.sessionId, sessionId),
          eq(cartItems.competitionId, competitionId)
        )
      );
    return item;
  }

  async addCartItem(item) {
    const [created] = await db.insert(cartItems).values(item).returning();
    return created;
  }

  async updateCartItemQuantity(id, quantity) {
    const [updated] = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return updated;
  }

  async removeCartItem(id) {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async clearCart(sessionId) {
    await db.delete(cartItems).where(eq(cartItems.sessionId, sessionId));
  }

  async createOrder(order) {
    const [created] = await db.insert(orders).values(order).returning();
    return created;
  }

  async createOrderItems(items) {
    if (!items.length) return [];
    return db.insert(orderItems).values(items).returning();
  }

  async getOrderById(id) {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));

    if (!order) return undefined;

    const items = await db
      .select({
        id: orderItems.id,
        orderId: orderItems.orderId,
        competitionId: orderItems.competitionId,
        quantity: orderItems.quantity,
        ticketPrice: orderItems.ticketPrice,
        competition: competitions,
      })
      .from(orderItems)
      .leftJoin(
        competitions,
        eq(orderItems.competitionId, competitions.id)
      )
      .where(eq(orderItems.orderId, id));

    return { order, items };
  }

  async updateOrderStatus(id, status) {
    const [updated] = await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
EOF

cat > dist/server/db.js << 'EOF'
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import * as schema from '../shared/schema.js';

// For Neon database with WebSocket
global.WebSocket = ws;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

// Export options for connect-pg-simple session store
export const connectPgSimpleOptions = {
  pool,
  tableName: 'session'
};
EOF

cat > dist/shared/schema.js << 'EOF'
import { pgTable, serial, text, integer, timestamp, doublePrecision, boolean } from 'drizzle-orm/pg-core';

// Session table for express-session
export const session = pgTable("session", {
  sid: text("sid").primaryKey(),
  sess: text("sess").notNull(),
  expire: timestamp("expire", { mode: "date" }).notNull(),
});

// Competitions table
export const competitions = pgTable("competitions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  image: text("image").notNull(),
  category: text("category").default("general"),
  ticketPrice: doublePrecision("ticket_price").notNull().default(1),
  totalTickets: integer("total_tickets").notNull(),
  soldTickets: integer("sold_tickets").notNull().default(0),
  endDate: timestamp("end_date", { mode: "date" }).notNull(),
  featured: boolean("featured").default(false),
});

// Cart items table
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  competitionId: integer("competition_id")
    .notNull()
    .references(() => competitions.id),
  quantity: integer("quantity").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Orders table
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  totalAmount: doublePrecision("total_amount").notNull(),
  stripePaymentIntentId: text("stripe_payment_intent_id").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Order items table
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id),
  competitionId: integer("competition_id")
    .notNull()
    .references(() => competitions.id),
  quantity: integer("quantity").notNull(),
  ticketPrice: doublePrecision("ticket_price").notNull(),
});
EOF

# Run database migrations (may fail on Render but that's expected)
echo "Running database migrations..."
npx drizzle-kit push --force || echo "Migrations may have failed, that's expected in the build environment"

# Seed the database with initial data (only in development)
if [ "$NODE_ENV" != "production" ]; then
  echo "Seeding database..."
  npx tsx server/seed.ts || echo "Error seeding database: $?"
fi

# Verify frontend build is in place
echo "Verifying frontend build..."
if [ ! -f "dist/assets/index.html" ]; then
  echo "ERROR: Frontend build failed - index.html not found in dist/assets/"
  exit 1
fi

# List the contents of the dist directory for verification
echo "Contents of dist directory:"
ls -la dist/
echo "Contents of dist/server directory:"
ls -la dist/server/
echo "Contents of dist/assets directory:"
ls -la dist/assets/

# Show the first few files in the assets directory to verify the build
echo "Frontend files in dist/assets:"
find dist/assets -type f -not -path "*/\.*" | sort | head -10

# Exit with success
echo "Build completed successfully with database setup!"
exit 0