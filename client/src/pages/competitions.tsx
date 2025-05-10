import { useQuery } from "@tanstack/react-query";
import { Competition } from "@/types";
import CompetitionCard from "@/components/competition-card";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Competitions() {
  const [category, setCategory] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("newest");

  const { data: competitions = [], isLoading } = useQuery<Competition[]>({
    queryKey: ['/api/competitions', category],
    queryFn: async ({ queryKey }) => {
      const cat = queryKey[1];
      const url = cat ? `/api/competitions?category=${cat}` : '/api/competitions';
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch competitions");
      return res.json();
    },
  });

  // Sort competitions based on selected sort option
  const sortedCompetitions = [...competitions].sort((a, b) => {
    switch (sortBy) {
      case "endingSoon":
        return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
      case "priceLowHigh":
        return Number(a.ticketPrice) - Number(b.ticketPrice);
      case "priceHighLow":
        return Number(b.ticketPrice) - Number(a.ticketPrice);
      case "newest":
      default:
        return b.id - a.id;
    }
  });

  // Extract unique categories from competitions
  const categories = ["All Categories", ...new Set(competitions.map(c => c.category))];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Current Competitions</h1>
      
      {/* Filters */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Browse Competitions</h2>
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-4">
          <Select
            value={category}
            onValueChange={(value) => setCategory(value === "All Categories" ? "" : value)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select
            value={sortBy}
            onValueChange={setSortBy}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Sort by: Newest" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Sort by: Newest</SelectItem>
              <SelectItem value="endingSoon">Sort by: Ending Soon</SelectItem>
              <SelectItem value="priceLowHigh">Sort by: Price: Low to High</SelectItem>
              <SelectItem value="priceHighLow">Sort by: Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Competitions Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition p-5 h-[400px]">
              <div className="w-full h-48 bg-gray-200 animate-pulse rounded-md mb-4"></div>
              <div className="h-6 bg-gray-200 animate-pulse rounded-md mb-4 w-3/4"></div>
              <div className="h-4 bg-gray-200 animate-pulse rounded-md mb-4"></div>
              <div className="h-4 bg-gray-200 animate-pulse rounded-md mb-4 w-1/2"></div>
              <div className="h-10 bg-gray-200 animate-pulse rounded-md mt-auto"></div>
            </div>
          ))}
        </div>
      ) : (
        sortedCompetitions.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedCompetitions.map((competition) => (
              <CompetitionCard key={competition.id} competition={competition} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No competitions found.</p>
          </div>
        )
      )}
      
      {/* Pagination - disabled for now as we don't have pagination in the backend yet */}
      {/* <div className="mt-12 flex justify-center">
        <nav className="inline-flex rounded-md shadow">
          <a href="#" className="py-2 px-4 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50">Previous</a>
          <a href="#" className="py-2 px-4 bg-primary text-white border border-primary">1</a>
          <a href="#" className="py-2 px-4 bg-white border border-gray-300 hover:bg-gray-50">2</a>
          <a href="#" className="py-2 px-4 bg-white border border-gray-300 hover:bg-gray-50">3</a>
          <a href="#" className="py-2 px-4 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50">Next</a>
        </nav>
      </div> */}
    </div>
  );
}
