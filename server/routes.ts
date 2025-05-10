import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCartItemSchema, insertOrderSchema, insertOrderItemSchema } from "@shared/schema";
import { ZodError } from "zod";
import Stripe from "stripe";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { cartItems } from "@shared/schema";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("Missing STRIPE_SECRET_KEY environment variable. Stripe payments will not work.");
}

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" }) 
  : null;

export async function registerRoutes(app: Express): Promise<Server> {
  // --- Competition Routes ---
  app.get("/api/competitions", async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      
      if (category) {
        const competitions = await storage.getCompetitionsByCategory(category);
        return res.json(competitions);
      }
      
      const competitions = await storage.getAllCompetitions();
      res.json(competitions);
    } catch (error) {
      console.error("Error fetching competitions:", error);
      res.status(500).json({ message: "Error fetching competitions" });
    }
  });

  app.get("/api/competitions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid competition ID" });
      }

      const competition = await storage.getCompetitionById(id);
      if (!competition) {
        return res.status(404).json({ message: "Competition not found" });
      }

      res.json(competition);
    } catch (error) {
      console.error("Error fetching competition:", error);
      res.status(500).json({ message: "Error fetching competition" });
    }
  });

  // --- Cart Routes ---
  app.get("/api/cart", async (req, res) => {
    try {
      if (!req.session.id) {
        return res.status(400).json({ message: "Invalid session" });
      }

      const cartItems = await storage.getCartItems(req.session.id);
      
      // Fetch competition details for each cart item
      const cartItemsWithDetails = await Promise.all(
        cartItems.map(async (item) => {
          const competition = await storage.getCompetitionById(item.competitionId);
          return {
            ...item,
            competition
          };
        })
      );

      res.json(cartItemsWithDetails);
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ message: "Error fetching cart" });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      if (!req.session.id) {
        return res.status(400).json({ message: "Invalid session" });
      }

      const parsedBody = insertCartItemSchema.parse({
        ...req.body,
        sessionId: req.session.id
      });

      // Check if competition exists
      const competition = await storage.getCompetitionById(parsedBody.competitionId);
      if (!competition) {
        return res.status(404).json({ message: "Competition not found" });
      }

      // Check if quantity is valid (between 1 and 10)
      if (parsedBody.quantity < 1 || parsedBody.quantity > 10) {
        return res.status(400).json({ message: "Quantity must be between 1 and 10" });
      }

      // Check if competition has enough tickets
      if (competition.soldTickets + parsedBody.quantity > competition.totalTickets) {
        return res.status(400).json({ message: "Not enough tickets available" });
      }

      // Check if item already exists in cart
      const existingItem = await storage.getCartItemWithCompetition(
        req.session.id,
        parsedBody.competitionId
      );

      let cartItem;
      if (existingItem) {
        // If the total would exceed 10 tickets, return an error
        if (existingItem.quantity + parsedBody.quantity > 10) {
          return res.status(400).json({ 
            message: "Maximum 10 tickets per competition allowed" 
          });
        }
        
        // Update existing item
        cartItem = await storage.updateCartItemQuantity(
          existingItem.id,
          existingItem.quantity + parsedBody.quantity
        );
      } else {
        // Add new item
        cartItem = await storage.addCartItem(parsedBody);
      }

      res.status(201).json({
        ...cartItem,
        competition
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Invalid input data", 
          errors: error.errors 
        });
      }
      
      console.error("Error adding item to cart:", error);
      res.status(500).json({ message: "Error adding item to cart" });
    }
  });

  app.patch("/api/cart/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid cart item ID" });
      }

      const { quantity } = req.body;
      if (typeof quantity !== 'number' || quantity < 1 || quantity > 10) {
        return res.status(400).json({ message: "Quantity must be between 1 and 10" });
      }

      const updatedItem = await storage.updateCartItemQuantity(id, quantity);
      if (!updatedItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }

      const competition = await storage.getCompetitionById(updatedItem.competitionId);

      res.json({
        ...updatedItem,
        competition
      });
    } catch (error) {
      console.error("Error updating cart item:", error);
      res.status(500).json({ message: "Error updating cart item" });
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid cart item ID" });
      }

      await storage.removeCartItem(id);
      res.status(204).end();
    } catch (error) {
      console.error("Error removing cart item:", error);
      res.status(500).json({ message: "Error removing cart item" });
    }
  });

  // --- Checkout and Payment Routes ---
  app.post("/api/create-checkout-session", async (req, res) => {
    try {
      if (!req.session.id) {
        return res.status(400).json({ message: "Invalid session" });
      }

      if (!stripe) {
        return res.status(500).json({ 
          message: "Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable." 
        });
      }

      // Get cart items
      const sessionId = req.session.id;
      const cartItems = await storage.getCartItems(sessionId);
      
      if (cartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      // Get competition details and calculate total
      let totalAmount = 0;
      const lineItems = [];
      
      for (const item of cartItems) {
        const competition = await storage.getCompetitionById(item.competitionId);
        if (!competition) {
          return res.status(400).json({ 
            message: `Competition with ID ${item.competitionId} not found` 
          });
        }

        // Ensure format is right for Stripe (must be in pennies/cents)
        const unitAmount = Math.round(Number(competition.ticketPrice) * 100);
        
        lineItems.push({
          price_data: {
            currency: 'gbp',
            product_data: {
              name: competition.title,
              description: `${item.quantity} ticket(s) for ${competition.title}`,
            },
            unit_amount: unitAmount,
          },
          quantity: item.quantity,
        });

        totalAmount += unitAmount * item.quantity;
      }

      // Create a Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/cart`,
        metadata: {
          sessionId: sessionId,
        },
      });

      // Create order in database
      const order = await storage.createOrder({
        sessionId: sessionId,
        totalAmount: totalAmount / 100, // Convert back from cents to pounds
        stripePaymentIntentId: session.id,
        status: 'pending',
      });

      // Create order items
      const orderItemsToCreate = await Promise.all(
        cartItems.map(async (item) => {
          const competition = await storage.getCompetitionById(item.competitionId);
          return {
            orderId: order.id,
            competitionId: item.competitionId,
            quantity: item.quantity,
            ticketPrice: Number(competition?.ticketPrice),
          };
        })
      );

      await storage.createOrderItems(orderItemsToCreate);

      res.json({ url: session.url });
    } catch (error) {
      console.error("Error creating checkout session:", error);
      res.status(500).json({ message: "Error creating checkout session" });
    }
  });

  app.post("/api/webhook", async (req: Request & { rawBody?: Buffer }, res) => {
    const signature = req.headers['stripe-signature'];
    
    if (!stripe) {
      return res.status(500).json({ 
        message: "Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable." 
      });
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      return res.status(500).json({ 
        message: "Missing STRIPE_WEBHOOK_SECRET environment variable" 
      });
    }

    if (!req.rawBody) {
      return res.status(400).send('Webhook Error: No raw body available');
    }

    try {
      const event = stripe.webhooks.constructEvent(
        req.rawBody, 
        signature as string, 
        process.env.STRIPE_WEBHOOK_SECRET
      );

      // Handle the checkout.session.completed event
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const sessionId = session.metadata?.sessionId;
        
        if (sessionId) {
          // Find the order by Stripe session ID
          const [order] = await db
            .select()
            .from(orders)
            .where(eq(orders.stripePaymentIntentId, session.id));

          if (order) {
            // Update order status
            await storage.updateOrderStatus(order.id, 'completed');
            
            // Clear the cart
            await storage.clearCart(sessionId);
            
            // Update competition sold tickets
            const orderItemsList = await db
              .select()
              .from(orderItems)
              .where(eq(orderItems.orderId, order.id));
            
            for (const item of orderItemsList) {
              await storage.updateCompetitionSoldTickets(
                item.competitionId, 
                item.quantity
              );
            }
          }
        }
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Error handling webhook:', error);
      res.status(400).send(`Webhook Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  app.get("/api/order/:sessionId", async (req, res) => {
    try {
      const stripeSessionId = req.params.sessionId;
      
      // Find order by Stripe session ID
      const [order] = await db
        .select()
        .from(orders)
        .where(eq(orders.stripePaymentIntentId, stripeSessionId));
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Get order items
      const orderItemsList = await db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, order.id));
      
      // Get competition details for each order item
      const orderItemsWithDetails = await Promise.all(
        orderItemsList.map(async (item) => {
          const competition = await storage.getCompetitionById(item.competitionId);
          return {
            ...item,
            competition
          };
        })
      );
      
      res.json({
        order,
        items: orderItemsWithDetails
      });
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Error fetching order" });
    }
  });

  // Setup server
  const httpServer = createServer(app);
  return httpServer;
}
