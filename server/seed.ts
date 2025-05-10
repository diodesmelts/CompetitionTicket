import { db } from "./db";
import { competitions } from "@shared/schema";

async function seed() {
  console.log("🌱 Seeding database...");

  // Check if data already exists
  const existingCompetitions = await db.select().from(competitions);
  if (existingCompetitions.length > 0) {
    console.log("Database already has competitions. Skipping seed.");
    return;
  }

  // Sample competitions data
  const competitionsData = [
    {
      title: "Win a PlayStation 5",
      description: "Win the latest PlayStation 5 console with an extra controller and three games of your choice. This incredible prize includes the disc version of the PS5, an additional DualSense controller, and three AAA game titles.",
      image: "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      category: "Electronics",
      ticketPrice: "1.00",
      totalTickets: 5000,
      soldTickets: 2453,
      endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
      featured: true,
    },
    {
      title: "Luxury Weekend in Paris",
      description: "Enjoy a luxurious weekend for two in Paris, including flights, 5-star hotel accommodation, and a private tour of the city's most iconic landmarks. Experience the romance of Paris with this unforgettable getaway.",
      image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      category: "Travel",
      ticketPrice: "2.50",
      totalTickets: 2000,
      soldTickets: 876,
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      featured: true,
    },
    {
      title: "Apple MacBook Pro 16",
      description: "Win the latest MacBook Pro with M2 Pro chip, 16GB RAM, and 1TB SSD. This powerful laptop is perfect for creative professionals and tech enthusiasts alike, featuring the stunning Liquid Retina XDR display.",
      image: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      category: "Electronics",
      ticketPrice: "5.00",
      totalTickets: 1000,
      soldTickets: 621,
      endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      featured: false,
    },
    {
      title: "Tesla Model 3",
      description: "Win a brand new Tesla Model 3 Long Range in Midnight Silver. This electric vehicle features a range of over 350 miles, premium interior, and Tesla's cutting-edge Autopilot technology.",
      image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      category: "Automotive",
      ticketPrice: "25.00",
      totalTickets: 10000,
      soldTickets: 3542,
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
      featured: true,
    },
    {
      title: "£10,000 Cash Prize",
      description: "Win £10,000 cash delivered directly to your bank account. Use this life-changing sum to pay off debts, take a dream vacation, or invest in your future - the choice is yours!",
      image: "https://images.unsplash.com/photo-1565300667498-2843c56b9fb0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      category: "Cash",
      ticketPrice: "5.00",
      totalTickets: 8000,
      soldTickets: 6235,
      endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      featured: true,
    },
    {
      title: "Gaming PC Bundle",
      description: "Win a high-end gaming PC bundle with RTX 4080, 32GB RAM, 2TB SSD, gaming monitor, mechanical keyboard, and wireless headset. Everything you need to elevate your gaming experience.",
      image: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      category: "Electronics",
      ticketPrice: "2.00",
      totalTickets: 4000,
      soldTickets: 1876,
      endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
      featured: false,
    },
    {
      title: "Luxury Watch Collection",
      description: "Win a collection of three luxury watches from Rolex, Omega, and Tag Heuer. This exclusive prize includes the Rolex Submariner, Omega Seamaster, and Tag Heuer Monaco - a true collector's dream.",
      image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      category: "Luxury",
      ticketPrice: "10.00",
      totalTickets: 2500,
      soldTickets: 987,
      endDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 days from now
      featured: true,
    },
    {
      title: "World Cup Final Tickets",
      description: "Win a pair of tickets to the next FIFA World Cup Final, including flights and 5-star hotel accommodation. Experience the pinnacle of football excellence with this once-in-a-lifetime opportunity.",
      image: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      category: "Sports",
      ticketPrice: "5.00",
      totalTickets: 5000,
      soldTickets: 3254,
      endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
      featured: false,
    },
  ];

  // Insert data
  await db.insert(competitions).values(competitionsData);

  console.log(`✅ Added ${competitionsData.length} competitions to the database.`);
}

// Run the seed function
seed()
  .then(() => {
    console.log("Seeding completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error seeding database:", error);
    process.exit(1);
  });