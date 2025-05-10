import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import CompetitionCard from "@/components/competition-card";
import { useQuery } from "@tanstack/react-query";
import { Competition } from "@/types";

export default function Home() {
  const { data: competitions = [], isLoading } = useQuery<Competition[]>({
    queryKey: ['/api/competitions'],
  });

  // Limit to 4 competitions for the homepage
  const featuredCompetitions = competitions.slice(0, 4);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Win Amazing Prizes</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">Enter our competitions for your chance to win incredible prizes with tickets from just £1.</p>
          <Link href="/competitions">
            <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
              View Competitions
            </Button>
          </Link>
        </div>
      </section>

      {/* Featured Competitions */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-8 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Featured Competitions</h2>
          <Link href="/competitions">
            <Button variant="outline">View All</Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCompetitions.map((competition) => (
              <CompetitionCard key={competition.id} competition={competition} />
            ))}
          </div>
        )}
      </section>

      {/* How It Works Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-md text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-primary text-2xl font-bold mx-auto mb-4">1</div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Choose a Competition</h3>
              <p className="text-gray-600">Browse through our range of exciting competitions and select the prizes you'd love to win.</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-md text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-primary text-2xl font-bold mx-auto mb-4">2</div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Get Your Tickets</h3>
              <p className="text-gray-600">Purchase your tickets - the more tickets you buy, the higher your chances of winning!</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-md text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-primary text-2xl font-bold mx-auto mb-4">3</div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Win Your Prize</h3>
              <p className="text-gray-600">If you're the lucky winner, we'll contact you and arrange delivery of your amazing prize.</p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link href="/competitions">
              <Button className="bg-primary hover:bg-blue-600 text-white">
                Start Winning Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Winners Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Recent Winners</h2>
        <p className="text-center text-gray-600 max-w-3xl mx-auto mb-12">
          These lucky people have already won some amazing prizes. You could be next!
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-gray-200 rounded-full mb-4 overflow-hidden">
              <svg className="h-full w-full text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">Sarah J.</h3>
            <p className="text-primary font-semibold">MacBook Pro</p>
            <p className="text-gray-500 text-sm">London</p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-gray-200 rounded-full mb-4 overflow-hidden">
              <svg className="h-full w-full text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">David M.</h3>
            <p className="text-primary font-semibold">PlayStation 5 Bundle</p>
            <p className="text-gray-500 text-sm">Manchester</p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-gray-200 rounded-full mb-4 overflow-hidden">
              <svg className="h-full w-full text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">Emma T.</h3>
            <p className="text-primary font-semibold">£5,000 Cash Prize</p>
            <p className="text-gray-500 text-sm">Bristol</p>
          </div>
        </div>
      </section>
    </div>
  );
}
