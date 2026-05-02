export type OfstedRating = "Outstanding" | "Good" | "Requires Improvement";

export interface Nursery {
  id: number;
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

export interface AIFilters {
  area: string | null;
  maxAge: number | null;
  minAge: number | null;
  ofsted: "Outstanding" | "Good" | "Requires Improvement" | null;
  maxPrice: number | null;
  availFilter: "available" | "waitlist" | "any";
  tags: string[];
  explanation: string;
}