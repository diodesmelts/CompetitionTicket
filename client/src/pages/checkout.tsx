import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { CartItemWithCompetition } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { Loader2, LockIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Checkout() {
  const [_, navigate] = useLocation();
  const { toast } = useToast();

  const { data: cartItems = [], isLoading } = useQuery<CartItemWithCompetition[]>({
    queryKey: ['/api/cart'],
  });

  const isEmpty = !isLoading && cartItems.length === 0;

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => {
    return sum + (Number(item.competition.ticketPrice) * item.quantity);
  }, 0);
  
  const serviceFee = subtotal > 0 ? 0.50 : 0; // £0.50 service fee if cart is not empty
  const total = subtotal + serviceFee;

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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-6">Your cart is empty</h1>
        <p className="text-gray-600 mb-8">Add some competitions to your cart before proceeding to checkout.</p>
        <Link href="/competitions">
          <Button>Browse Competitions</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">Checkout</h1>
      
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-800">{item.competition.title}</p>
                    <p className="text-sm text-gray-500">
                      {item.quantity} ticket{item.quantity !== 1 ? 's' : ''} @ {formatPrice(item.competition.ticketPrice)} each
                    </p>
                  </div>
                  <span className="font-medium">
                    {formatPrice(Number(item.competition.ticketPrice) * item.quantity)}
                  </span>
                </div>
              ))}
              
              <Separator />
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Service Fee</span>
                  <span className="font-medium">{formatPrice(serviceFee)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-base font-bold pt-2">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border border-gray-300 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <input id="stripe" name="payment-method" type="radio" checked className="h-4 w-4 text-primary focus:ring-primary border-gray-300" />
                    <label htmlFor="stripe" className="ml-2 block text-sm font-medium text-gray-700">
                      Pay with Card
                    </label>
                  </div>
                  <div className="flex space-x-2">
                    <svg className="h-6 w-8 text-blue-700" fill="currentColor" viewBox="0 0 36 24">
                      <path d="M33 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h30c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3Z" fill="white" />
                      <path d="M3 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h30c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2H3Z" fill="currentColor" />
                      <path d="M15 19c3.3 0 6-2.7 6-6s-2.7-6-6-6-6 2.7-6 6 2.7 6 6 6Zm0-10c2.2 0 4 1.8 4 4s-1.8 4-4 4-4-1.8-4-4 1.8-4 4-4Z" fill="white" />
                      <path d="M24 10h2v6h-2v-6Zm-3 0h2v6h-2v-6Zm6 0h2v6h-2v-6Z" fill="white" />
                    </svg>
                    <svg className="h-6 w-8 text-red-500" fill="currentColor" viewBox="0 0 36 24">
                      <path d="M33 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h30c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3Z" fill="white" />
                      <path d="M3 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h30c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2H3Z" fill="currentColor" />
                      <circle cx="12" cy="12" r="7" fill="#EB001B" />
                      <circle cx="24" cy="12" r="7" fill="#F79E1B" />
                      <path d="M18 9a7 7 0 0 0 0 6 7 7 0 0 0 0-6Z" fill="#FF5F00" />
                    </svg>
                    <svg className="h-6 w-8 text-blue-500" fill="currentColor" viewBox="0 0 36 24">
                      <path d="M33 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h30c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3Z" fill="white" />
                      <path d="M3 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h30c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2H3Z" fill="currentColor" />
                      <path d="M19.5 9v6h1.7V9h-1.7ZM23.5 9v6h1.7V9h-1.7ZM11 9l-2.1 6h1.8l.4-1.2h2.2l.4 1.2h1.8L13.4 9H11Zm.1 3.5.6-1.9.7 1.9h-1.3Z" fill="white" />
                      <path d="M17 11.6c0-1.5-1-2.6-2.5-2.6h-3.1v6h1.7v-2h1.4c1.5 0 2.5-1.1 2.5-2.6v-.8Zm-1.7.4c0 .6-.4 1-1 1h-1.2v-2h1.2c.6 0 1 .4 1 1v0Z" fill="white" />
                      <path d="M24 13.8V9h-3.8v6H24v-1.2h-2.1v-1.3H24v-1.2h-2.1V10H24v3.8Z" fill="white" />
                    </svg>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    You'll be redirected to Stripe's secure payment page to complete your purchase.
                  </p>
                  <div className="bg-gray-100 rounded-md p-4 text-center">
                    <LockIcon className="h-8 w-8 mx-auto text-green-500 mb-2" />
                    <p className="text-sm text-gray-700">
                      Payments are securely processed by Stripe. We never store your card details.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button 
                className="w-full flex items-center justify-center" 
                onClick={() => checkout()}
                disabled={isCheckingOut}
              >
                {isCheckingOut ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Pay {formatPrice(total)} securely with Stripe
                    <LockIcon className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
              
              <Link href="/cart">
                <Button variant="outline" className="w-full">
                  Back to Cart
                </Button>
              </Link>
              
              <p className="text-xs text-gray-500 text-center mt-2">
                By completing your purchase, you agree to our 
                <Link href="#" className="text-primary hover:underline mx-1">Terms of Service</Link>
                and
                <Link href="#" className="text-primary hover:underline ml-1">Privacy Policy</Link>.
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
