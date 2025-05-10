import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/use-cart";
import { CartItemWithCompetition } from "@/types";
import CartItem from "@/components/cart-item";
import EmptyCart from "@/components/empty-cart";
import { formatPrice } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Cart() {
  const { refreshCart } = useCart();
  const [_, navigate] = useLocation();
  const { toast } = useToast();

  const { data: cartItems = [], isLoading, refetch } = useQuery<CartItemWithCompetition[]>({
    queryKey: ['/api/cart'],
  });
  
  const isEmpty = !isLoading && cartItems.length === 0;
  
  const { mutate: checkout, isPending: isCheckingOut } = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/create-checkout-session');
      return res.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      toast({
        title: "Checkout Error",
        description: error instanceof Error ? error.message : "Failed to create checkout session",
        variant: "destructive",
      });
    },
  });

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => {
    return sum + (Number(item.competition.ticketPrice) * item.quantity);
  }, 0);
  
  const serviceFee = subtotal > 0 ? 0.50 : 0; // £0.50 service fee if cart is not empty
  const total = subtotal + serviceFee;

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">Your Cart</h1>
      
      {isLoading ? (
        <div className="flex justify-center items-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : isEmpty ? (
        <EmptyCart />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Cart Items</h2>
                <div className="space-y-6">
                  {cartItems.map((item) => (
                    <CartItem 
                      key={item.id} 
                      item={item} 
                      onUpdate={refreshCart}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service Fee</span>
                    <span className="font-medium">{formatPrice(serviceFee)}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(total)}</span>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col p-6 pt-0 gap-3">
                <Button 
                  className="w-full" 
                  onClick={() => checkout()}
                  disabled={isCheckingOut}
                >
                  {isCheckingOut ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Proceed to Checkout'
                  )}
                </Button>
                
                <Link href="/competitions">
                  <Button variant="outline" className="w-full">
                    Continue Shopping
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
