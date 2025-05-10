export type Competition = {
  id: number;
  title: string;
  description: string;
  image: string;
  category: string;
  ticketPrice: number | string;
  totalTickets: number;
  soldTickets: number;
  endDate: string;
  featured?: boolean;
};

export type CartItem = {
  id: number;
  sessionId: string;
  competitionId: number;
  quantity: number;
  createdAt: string;
};

export type CartItemWithCompetition = CartItem & {
  competition: Competition;
};
