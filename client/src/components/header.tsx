import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Menu, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/use-cart";

export default function Header() {
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cartCount, refreshCart } = useCart();
  
  // Refresh cart count when component mounts
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Competitions", href: "/competitions" },
    { name: "Winners", href: "/winners" },
    { name: "How It Works", href: "/how-it-works" },
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="text-2xl font-bold text-primary">
            PrizeWin
          </Link>
        </div>
        
        <nav className="hidden md:flex space-x-8">
          {navigation.map((item) => (
            <Link key={item.name} href={item.href} className={`font-medium ${location === item.href ? 'text-primary' : 'text-gray-800 hover:text-primary'}`}>
              {item.name}
            </Link>
          ))}
        </nav>
        
        <div className="flex items-center">
          <Link href="/cart">
            <Button variant="ghost" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge variant="default" className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center p-0 text-xs">
                  {cartCount}
                </Badge>
              )}
              <span className="sr-only">Cart</span>
            </Button>
          </Link>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden ml-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col space-y-4 mt-8">
                {navigation.map((item) => (
                  <Link key={item.name} href={item.href} className={`text-lg font-medium ${location === item.href ? 'text-primary' : 'text-gray-800'}`}>
                    {item.name}
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
