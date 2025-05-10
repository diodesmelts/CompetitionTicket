import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle } from "lucide-react";
import { formatPrice } from "@/lib/utils";

type OrderItem = {
  id: number;
  orderId: number;
  competitionId: number;
  quantity: number;
  ticketPrice: number;
  competition: {
    id: number;
    title: string;
    image: string;
  };
};

type Order = {
  id: number;
  sessionId: string;
  totalAmount: number;
  stripePaymentIntentId: string;
  status: string;
  createdAt: string;
};

type OrderResponse = {
  order: Order;
  items: OrderItem[];
};

export default function Success() {
  const [location] = useLocation();
  const params = new URLSearchParams(location.split('?')[1]);
  const sessionId = params.get('session_id');

  const { data, isLoading, error } = useQuery<OrderResponse>({
    queryKey: [`/api/order/${sessionId}`],
    enabled: !!sessionId,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Something went wrong</h1>
        <p className="text-gray-600 mb-8">We couldn't find your order. Please contact customer support.</p>
        <Link href="/competitions">
          <Button>Browse Competitions</Button>
        </Link>
      </div>
    );
  }

  const { order, items } = data;
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <Card className="shadow-lg">
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600 mb-6">Your tickets have been successfully purchased.</p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <p className="text-gray-700"><span className="font-medium">Order Reference:</span> #{order.id}</p>
            <p className="text-gray-700"><span className="font-medium">Total Amount:</span> {formatPrice(order.totalAmount)}</p>
            <p className="text-gray-700"><span className="font-medium">Date:</span> {orderDate}</p>
          </div>
          
          <div className="mb-6 text-left">
            <h2 className="text-lg font-semibold mb-4">Your Tickets</h2>
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-start space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{item.competition.title}</p>
                    <p className="text-sm text-gray-500">
                      {item.quantity} ticket{item.quantity !== 1 ? 's' : ''} @ {formatPrice(item.ticketPrice)} each
                    </p>
                  </div>
                  <span className="font-medium">
                    {formatPrice(item.ticketPrice * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <p className="text-gray-600 mb-6">
            We've sent a confirmation email with all the details of your order. Good luck in the draws!
          </p>
          
          <div className="flex flex-col space-y-3">
            <Link href="/competitions">
              <Button className="w-full">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
