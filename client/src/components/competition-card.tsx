import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatPrice, formatDateRemaining } from "@/lib/utils";
import { Competition } from "@/types";

type CompetitionCardProps = {
  competition: Competition;
};

export default function CompetitionCard({ competition }: CompetitionCardProps) {
  const {
    id,
    title,
    description,
    image,
    category,
    ticketPrice,
    totalTickets,
    soldTickets,
    endDate
  } = competition;

  const soldPercentage = Math.min(100, Math.round((soldTickets / totalTickets) * 100));
  const isEndingSoon = new Date(endDate).getTime() - new Date().getTime() < 3 * 24 * 60 * 60 * 1000; // 3 days
  
  // Truncate description if too long
  const truncatedDescription = description.length > 60
    ? `${description.substring(0, 60)}...`
    : description;

  return (
    <Card className="overflow-hidden shadow-md hover:shadow-lg transition flex flex-col h-full">
      <div className="h-48 overflow-hidden">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
        />
      </div>
      <CardContent className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-gray-800 line-clamp-1">{title}</h3>
          <Badge 
            variant="secondary" 
            className="text-xs font-medium px-2.5 py-0.5 rounded-full"
          >
            {category}
          </Badge>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{truncatedDescription}</p>
        
        <div className="flex justify-between items-center mb-3">
          <div className="text-sm">
            <span className="font-medium">Ticket Price:</span>
            <span className="text-primary font-bold ml-1">{formatPrice(ticketPrice)}</span>
          </div>
          <div className="text-sm">
            <span className="font-medium">Ends in:</span>
            <span className={`font-bold ml-1 ${isEndingSoon ? 'text-red-500' : 'text-gray-600'}`}>
              {formatDateRemaining(endDate)}
            </span>
          </div>
        </div>
        
        <div className="mt-2 mb-4">
          <Progress value={soldPercentage} className="h-2.5 mb-1" />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{soldPercentage}% sold</span>
            <span>{soldTickets}/{totalTickets} tickets</span>
          </div>
        </div>
        
        <div className="mt-auto">
          <Link href={`/competition/${id}`}>
            <Button className="w-full">
              View Competition
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
