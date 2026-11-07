export type Choice = "none" | "lunch" | "dinner" | "both";
export type Language = "es" | "va";
export type Theme = "light" | "dark";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  secretSanta: boolean;
  role: "user" | "admin";
  createdAt?: string;
  hasVoted?: boolean;
}

export interface PublicConfig {
  eventName: string;
  commissionName: string;
  deadline: string;
  enabledDates: string[];
  resultsAvailable: boolean;
  voterCount: number;
}

export interface AdminUser extends User {
  availability: { date: string; choice: Choice }[];
  voteUpdatedAt: string | null;
}

export interface ResultItem {
  date: string;
  lunch: number;
  dinner: number;
  both: number;
  total: number;
}
