import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "@/components/ui/theme-provider";

document.title = "PrizeWin - Competition Platform";

// Add metadata for SEO
const metaDescription = document.createElement('meta');
metaDescription.name = 'description';
metaDescription.content = 'Enter our competitions for your chance to win incredible prizes with tickets from just £1. From tech gadgets to luxury holidays, find your dream prize at PrizeWin.';
document.head.appendChild(metaDescription);

// Add Open Graph tags
const ogTitle = document.createElement('meta');
ogTitle.property = 'og:title';
ogTitle.content = 'PrizeWin - Enter to Win Amazing Prizes';
document.head.appendChild(ogTitle);

const ogDescription = document.createElement('meta');
ogDescription.property = 'og:description';
ogDescription.content = 'Enter our competitions for your chance to win incredible prizes with tickets from just £1. From tech gadgets to luxury holidays, find your dream prize.';
document.head.appendChild(ogDescription);

const ogType = document.createElement('meta');
ogType.property = 'og:type';
ogType.content = 'website';
document.head.appendChild(ogType);

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <App />
  </ThemeProvider>
);
