export type OfstedRating = "Outstanding" | "Good" | "Requires Improvement";

export interface Nursery {
  id: string;
  name: string;
  area: string;
  postcode: string;
  rating: number;
  reviews: number;
  ageRange: string;
  minAge: number;
  maxAge: number;
  price: number;
  spaces: number;
  tags: string[];
  ofsted: OfstedRating;
  hours: string;
  description: string;
  lat?: number | null;
  lng?: number | null;
}

export interface EnquiryForm {
  name: string;
  email: string;
  phone: string;
  childDob: string;
  startDate: string;
  message: string;
}

export type AgeFilter = "any" | "baby" | "toddler" | "preschool";
export type AvailFilter = "any" | "available" | "waitlist";
export type SortOption = "rating" | "price-asc" | "price-desc" | "spaces";

export interface AIFilters {
  area: string | null;
  minAge: number | null;
  maxAge: number | null;
  ofsted: OfstedRating | null;
  maxPrice: number | null;
  availFilter: "available" | "waitlist" | "any";
  tags: string[];
  nameSearch: string | null;
  explanation: string;
}
