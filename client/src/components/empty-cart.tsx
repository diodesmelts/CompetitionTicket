import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

export default function EmptyCart() {
  return (
    <div className="text-center py-12 max-w-md mx-auto">
      <div className="text-gray-400 mb-4">
        <ShoppingCart className="h-16 w-16 mx-auto" />
      </div>
      
      <h2 className="text-xl font-medium text-gray-800 mb-2">Your cart is empty</h2>
      <p className="text-gray-600 mb-6">Looks like you haven't added any competitions to your cart yet.</p>
      
      <Link href="/competitions">
        <Button size="lg">
          Browse Competitions
        </Button>
      </Link>
    </div>
  );
}
