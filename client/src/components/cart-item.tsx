import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { CartItemWithCompetition } from "@/types";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type CartItemProps = {
  item: CartItemWithCompetition;
  onUpdate: () => void;
};

export default function CartItem({ item, onUpdate }: CartItemProps) {
  const [quantity, setQuantity] = useState(item.quantity);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > 10) return;
    
    setQuantity(newQuantity);
    updateCartItem(newQuantity);
  };

  const updateCartItem = async (newQuantity: number) => {
    try {
      setIsLoading(true);
      await apiRequest('PATCH', `/api/cart/${item.id}`, { quantity: newQuantity });
      onUpdate();
      toast({
        title: "Cart updated",
        description: `${item.competition.title} quantity updated to ${newQuantity}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update cart",
        variant: "destructive",
      });
      // Reset to original quantity on error
      setQuantity(item.quantity);
    } finally {
      setIsLoading(false);
    }
  };

  const removeCartItem = async () => {
    try {
      setIsLoading(true);
      await apiRequest('DELETE', `/api/cart/${item.id}`);
      onUpdate();
      toast({
        title: "Item removed",
        description: `${item.competition.title} removed from cart.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove item",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-start space-x-4 pb-4 border-b border-gray-200 last:border-0 last:pb-0">
      <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
        <img 
          src={item.competition.image} 
          alt={item.competition.title} 
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="flex-1">
        <div className="flex justify-between">
          <h3 className="font-medium text-gray-800">{item.competition.title}</h3>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-gray-400 hover:text-red-500"
            onClick={removeCartItem}
            disabled={isLoading}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Remove</span>
          </Button>
        </div>
        
        <p className="text-sm text-gray-500">
          {quantity} ticket{quantity !== 1 ? 's' : ''} @ {formatPrice(item.competition.ticketPrice)} each
        </p>
        
        <div className="flex justify-between items-center mt-2">
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-6 w-6 rounded-full p-0"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1 || isLoading}
            >
              <Minus className="h-3 w-3" />
              <span className="sr-only">Decrease</span>
            </Button>
            
            <span className="text-sm font-medium">{quantity}</span>
            
            <Button 
              variant="outline" 
              size="icon" 
              className="h-6 w-6 rounded-full p-0"
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={quantity >= 10 || isLoading}
            >
              <Plus className="h-3 w-3" />
              <span className="sr-only">Increase</span>
            </Button>
          </div>
          
          <span className="font-medium">
            {formatPrice(Number(item.competition.ticketPrice) * quantity)}
          </span>
        </div>
      </div>
    </div>
  );
}
