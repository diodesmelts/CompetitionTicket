import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Competition } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import TicketSelector from "@/components/ticket-selector";
import { formatPrice, formatDateRemaining } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";

export default function CompetitionDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { toast } = useToast();
  
  const { data: competition, isLoading, error } = useQuery<Competition>({
    queryKey: [`/api/competitions/${id}`],
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4 w-32"></div>
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-2/3">
              <div className="h-[400px] bg-gray-200 rounded-xl mb-8"></div>
              <div className="h-10 bg-gray-200 rounded mb-4 w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded mb-6 w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded mb-2 w-full"></div>
              <div className="h-4 bg-gray-200 rounded mb-2 w-full"></div>
              <div className="h-4 bg-gray-200 rounded mb-8 w-2/3"></div>
              <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded mb-2 w-full"></div>
              <div className="h-4 bg-gray-200 rounded mb-8 w-5/6"></div>
            </div>
            <div className="lg:w-1/3">
              <div className="h-[400px] bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !competition) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Competition not found</h2>
        <p className="text-gray-600 mb-8">The competition you're looking for doesn't exist or has been removed.</p>
        <Link href="/competitions">
          <Button className="bg-primary hover:bg-blue-600 text-white">
            Browse Competitions
          </Button>
        </Link>
      </div>
    );
  }

  const soldPercentage = Math.min(100, Math.round((competition.soldTickets / competition.totalTickets) * 100));
  const ticketsRemaining = competition.totalTickets - competition.soldTickets;
  const isEndingSoon = new Date(competition.endDate).getTime() - new Date().getTime() < 3 * 24 * 60 * 60 * 1000; // 3 days
  
  const handleAddToCart = (quantity: number) => {
    addToCart(competition.id, quantity)
      .then(() => {
        toast({
          title: "Added to cart",
          description: `${quantity} ticket${quantity !== 1 ? 's' : ''} for ${competition.title} added to your cart.`,
        });
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      });
  };

  const handleBuyNow = (quantity: number) => {
    addToCart(competition.id, quantity)
      .then(() => {
        window.location.href = "/checkout";
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      });
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <Link href="/competitions">
        <Button variant="ghost" className="mb-6 flex items-center text-gray-700 hover:text-primary">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to competitions
        </Button>
      </Link>
      
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3">
          <img 
            src={competition.image} 
            alt={competition.title} 
            className="w-full h-auto rounded-xl shadow-md mb-8" 
          />
          
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{competition.title}</h1>
          
          <div className="flex flex-wrap gap-2 mb-6">
            <Badge variant="secondary" className="text-sm font-medium px-3 py-1 rounded-full">{competition.category}</Badge>
            <Badge 
              variant="outline" 
              className={`text-sm font-medium px-3 py-1 rounded-full ${isEndingSoon ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-700'}`}
            >
              {isEndingSoon ? 'Ending Soon' : 'Ends in'} {formatDateRemaining(competition.endDate)}
            </Badge>
            <Badge variant="outline" className="text-sm font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-700">
              {competition.soldTickets}/{competition.totalTickets} sold
            </Badge>
          </div>
          
          <div className="prose max-w-none">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Prize Details</h2>
            <p className="text-gray-600 mb-4">{competition.description}</p>
            
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Competition Details</h2>
            <p className="text-gray-600 mb-4">
              This competition will end on {new Date(competition.endDate).toLocaleDateString('en-GB', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })} at 23:59 GMT or when all tickets are sold out, whichever comes first. The winner will be drawn within 24 hours of the competition ending and will be notified via email.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Delivery Information</h2>
            <p className="text-gray-600 mb-4">
              The prize will be delivered to the winner's address within 14 days of the draw. Delivery is available to mainland UK only. For non-mainland UK addresses, a delivery surcharge may apply.
            </p>
          </div>
        </div>
        
        <div className="lg:w-1/3">
          <div className="bg-white rounded-xl shadow-md p-6 sticky top-28">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Enter Competition</h2>
            
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">Ticket Price:</span>
              <span className="text-primary text-xl font-bold">{formatPrice(competition.ticketPrice)} each</span>
            </div>
            
            <div className="mb-6">
              <Progress value={soldPercentage} className="h-2.5 mb-2" />
              <div className="flex justify-between text-sm text-gray-500">
                <span>{soldPercentage}% sold</span>
                <span>{competition.soldTickets}/{competition.totalTickets} tickets</span>
              </div>
            </div>
            
            <TicketSelector 
              maxTickets={Math.min(10, ticketsRemaining)}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
              ticketPrice={Number(competition.ticketPrice)}
            />
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">By entering, you agree to our <Link href="#" className="text-primary hover:underline">Terms & Conditions</Link>.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
