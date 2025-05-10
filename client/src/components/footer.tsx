import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Facebook, Twitter, Instagram, ArrowRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-12 mt-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">PrizeWin</h3>
            <p className="text-gray-400 mb-4">Enter our competitions for your chance to win incredible prizes with tickets from just £1.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <Facebook size={20} />
                <span className="sr-only">Facebook</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Twitter size={20} />
                <span className="sr-only">Twitter</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Instagram size={20} />
                <span className="sr-only">Instagram</span>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/"><a className="text-gray-400 hover:text-white">Home</a></Link></li>
              <li><Link href="/competitions"><a className="text-gray-400 hover:text-white">Competitions</a></Link></li>
              <li><Link href="/winners"><a className="text-gray-400 hover:text-white">Winners</a></Link></li>
              <li><Link href="/how-it-works"><a className="text-gray-400 hover:text-white">How It Works</a></Link></li>
              <li><Link href="/faqs"><a className="text-gray-400 hover:text-white">FAQs</a></Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Information</h3>
            <ul className="space-y-2">
              <li><Link href="/about"><a className="text-gray-400 hover:text-white">About Us</a></Link></li>
              <li><Link href="/terms"><a className="text-gray-400 hover:text-white">Terms & Conditions</a></Link></li>
              <li><Link href="/privacy"><a className="text-gray-400 hover:text-white">Privacy Policy</a></Link></li>
              <li><Link href="/cookies"><a className="text-gray-400 hover:text-white">Cookie Policy</a></Link></li>
              <li><Link href="/contact"><a className="text-gray-400 hover:text-white">Contact Us</a></Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Newsletter</h3>
            <p className="text-gray-400 mb-4">Subscribe to our newsletter for the latest competitions and offers.</p>
            <form className="space-y-2">
              <div className="flex">
                <Input 
                  type="email" 
                  placeholder="Your email" 
                  className="rounded-r-none text-gray-800 focus:outline-none" 
                />
                <Button type="submit" className="rounded-l-none">
                  <ArrowRight className="h-4 w-4" />
                  <span className="sr-only">Subscribe</span>
                </Button>
              </div>
              <p className="text-xs text-gray-400">We respect your privacy. Unsubscribe at any time.</p>
            </form>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} PrizeWin. All rights reserved.</p>
          <p className="mt-2">Secure payments by Stripe. We never store your payment details.</p>
        </div>
      </div>
    </footer>
  );
}
