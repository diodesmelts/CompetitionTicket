import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus, ShoppingCart, Zap } from "lucide-react";
import { formatPrice } from "@/lib/utils";

type TicketSelectorProps = {
  maxTickets: number;
  onAddToCart: (quantity: number) => void;
  onBuyNow: (quantity: number) => void;
  ticketPrice: number;
};

export default function TicketSelector({ 
  maxTickets, 
  onAddToCart, 
  onBuyNow, 
  ticketPrice 
}: TicketSelectorProps) {
  const [quantity, setQuantity] = useState(1);

  const handleIncrement = () => {
    if (quantity < maxTickets) {
      setQuantity(quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      if (value > maxTickets) {
        setQuantity(maxTickets);
      } else if (value < 1) {
        setQuantity(1);
      } else {
        setQuantity(value);
      }
    }
  };

  const totalPrice = quantity * ticketPrice;

  return (
    <div>
      <label className="block text-gray-700 font-medium mb-2">How many tickets?</label>
      <div className="flex border border-gray-300 rounded-lg overflow-hidden mb-2">
        <Button 
          type="button" 
          variant="ghost" 
          size="icon"
          className="rounded-none h-full px-3 py-0 bg-gray-100 hover:bg-gray-200 text-gray-600" 
          onClick={handleDecrement}
          disabled={quantity <= 1}
        >
          <Minus className="h-4 w-4" />
          <span className="sr-only">Decrease</span>
        </Button>
        
        <Input
          type="number"
          value={quantity}
          onChange={handleChange}
          min={1}
          max={maxTickets}
          className="w-full text-center rounded-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        
        <Button 
          type="button" 
          variant="ghost" 
          size="icon"
          className="rounded-none h-full px-3 py-0 bg-gray-100 hover:bg-gray-200 text-gray-600" 
          onClick={handleIncrement}
          disabled={quantity >= maxTickets}
        >
          <Plus className="h-4 w-4" />
          <span className="sr-only">Increase</span>
        </Button>
      </div>
      
      <p className="text-xs text-gray-500 mb-4">
        {maxTickets === 0 ? (
          <span className="text-red-500">Sorry, this competition is sold out.</span>
        ) : (
          `Maximum ${maxTickets} tickets per person`
        )}
      </p>
      
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">{quantity} x Ticket(s):</span>
          <span className="font-medium">{formatPrice(totalPrice)}</span>
        </div>
        <div className="border-t border-gray-200 pt-2 mt-2">
          <div className="flex justify-between font-bold">
            <span>Total:</span>
            <span className="text-primary">{formatPrice(totalPrice)}</span>
          </div>
        </div>
      </div>
      
      <Button 
        className="w-full mb-3 flex items-center justify-center"
        onClick={() => onAddToCart(quantity)}
        disabled={maxTickets === 0}
      >
        <ShoppingCart className="mr-2 h-4 w-4" />
        Add to Cart
      </Button>
      
      <Button 
        className="w-full bg-secondary hover:bg-green-600 flex items-center justify-center"
        onClick={() => onBuyNow(quantity)}
        disabled={maxTickets === 0}
      >
        <Zap className="mr-2 h-4 w-4" />
        Buy Now
      </Button>
    </div>
  );
}
