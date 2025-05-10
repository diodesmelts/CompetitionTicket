import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a price value to GBP currency format
 */
export function formatPrice(price: number | string): string {
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericPrice);
}

/**
 * Format date to show remaining time
 */
export function formatDateRemaining(dateString: string): string {
  const endDate = new Date(dateString);
  const now = new Date();
  
  // Calculate the difference in milliseconds
  const diffMs = endDate.getTime() - now.getTime();
  
  // If the date has passed
  if (diffMs < 0) {
    return 'Ended';
  }
  
  // Calculate time units
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  // Format the output
  if (diffDays > 30) {
    const diffMonths = Math.floor(diffDays / 30);
    return `${diffMonths} month${diffMonths !== 1 ? 's' : ''}`;
  } else if (diffDays > 0) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  } else {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
  }
}
