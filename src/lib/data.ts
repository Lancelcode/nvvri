import type { Nursery, AIFilters, SortOption } from "@/types";

export const nurseries: Nursery[] = [
  {
    id: 1,
    name: "Meadowside Nursery",
    area: "Morningside",
    postcode: "EH10 4BX",
    rating: 4.9,
    reviews: 38,
    ageRange: "3 months – 5 years",
    minAge: 0.25,
    maxAge: 5,
    price: 62,
    spaces: 3,
    tags: ["Outdoor Learning", "Nursery School"],
    ofsted: "Outstanding",
    hours: "7:30am – 6:00pm",
    description:
      "Award-winning nursery with forest school sessions and a dedicated baby room. Edinburgh's highest-rated setting for under-2s.",
  },
  {
    id: 2,
    name: "Little Scholars",
    area: "Leith",
    postcode: "EH6 8DB",
    rating: 4.7,
    reviews: 61,
    ageRange: "6 months – 4 years",
    minAge: 0.5,
    maxAge: 4,
    price: 54,
    spaces: 0,
    tags: ["Bilingual", "STEM Focus"],
    ofsted: "Outstanding",
    hours: "8:00am – 6:00pm",
    description:
      "Bilingual English/French setting with dedicated STEM play zones. Currently at capacity — join the waitlist.",
  },
  {
    id: 3,
    name: "Bumblebee Day Nursery",
    area: "Bruntsfield",
    postcode: "EH10 4HR",
    rating: 4.8,
    reviews: 44,
    ageRange: "2 – 5 years",
    minAge: 2,
    maxAge: 5,
    price: 58,
    spaces: 1,
    tags: ["Arts & Crafts", "Garden"],
    ofsted: "Outstanding",
    hours: "7:45am – 5:45pm",
    description:
      "Intimate, home-from-home setting with a beautiful garden. Specialises in creative arts and natural play.",
  },
  {
    id: 4,
    name: "Sunshine Days",
    area: "Newington",
    postcode: "EH9 1QH",
    rating: 4.6,
    reviews: 29,
    ageRange: "3 months – 5 years",
    minAge: 0.25,
    maxAge: 5,
    price: 49,
    spaces: 5,
    tags: ["Flexible Hours", "Funded Places"],
    ofsted: "Good",
    hours: "8:00am – 6:30pm",
    description:
      "Flexible sessions with early start options. Accepts funded hours for 3–4 year olds. Multiple spaces available.",
  },
  {
    id: 5,
    name: "Little Explorers",
    area: "Stockbridge",
    postcode: "EH3 5NE",
    rating: 4.9,
    reviews: 52,
    ageRange: "1 – 5 years",
    minAge: 1,
    maxAge: 5,
    price: 67,
    spaces: 2,
    tags: ["Nature Play", "Yoga"],
    ofsted: "Outstanding",
    hours: "7:30am – 6:00pm",
    description:
      "Edinburgh's only nursery with weekly parent yoga sessions. Nature-based curriculum with regular trips to Inverleith Park.",
  },
  {
    id: 6,
    name: "Bright Futures",
    area: "Corstorphine",
    postcode: "EH12 7AA",
    rating: 4.5,
    reviews: 33,
    ageRange: "3 months – 4 years",
    minAge: 0.25,
    maxAge: 4,
    price: 51,
    spaces: 7,
    tags: ["Large Setting", "Funded Places"],
    ofsted: "Good",
    hours: "7:30am – 6:30pm",
    description:
      "Spacious purpose-built nursery with a large outdoor area. Most availability in Edinburgh — great for flexible working parents.",
  },
];

export function filterNurseries(
  data: Nursery[],
  search: string,
  maxPrice: number,
  ageFilter: string,
  availFilter: string
): Nursery[] {
  return data.filter((n) => {
    const matchSearch =
      !search ||
      n.name.toLowerCase().includes(search.toLowerCase()) ||
      n.area.toLowerCase().includes(search.toLowerCase()) ||
      n.postcode.toLowerCase().includes(search.toLowerCase()) ||
      n.description.toLowerCase().includes(search.toLowerCase()) ||
      n.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));

    const matchPrice = n.price <= maxPrice;

    const matchAge =
      ageFilter === "any" ||
      (ageFilter === "baby" && n.minAge < 1) ||
      (ageFilter === "toddler" && n.minAge <= 2 && n.maxAge >= 2) ||
      (ageFilter === "preschool" && n.maxAge >= 3);

    const matchAvail =
      availFilter === "any" ||
      (availFilter === "available" && n.spaces > 0) ||
      (availFilter === "waitlist" && n.spaces === 0);

    return matchSearch && matchPrice && matchAge && matchAvail;
  });
}

export function filterByAI(data: Nursery[], f: AIFilters): Nursery[] {
  return data.filter((n) => {
    // Structured filters
    if (f.area && !n.area.toLowerCase().includes(f.area.toLowerCase())) return false;
    if (f.ofsted && n.ofsted !== f.ofsted) return false;
    if (f.maxPrice != null && n.price > f.maxPrice) return false;
    if (f.minAge != null && n.maxAge < f.minAge) return false;
    if (f.maxAge != null && n.minAge > f.maxAge) return false;
    if (f.availFilter === "available" && n.spaces === 0) return false;
    if (f.availFilter === "waitlist" && n.spaces > 0) return false;
    if (f.tags.length > 0 && !f.tags.some((t) => n.tags.includes(t))) return false;

    // Free-text search — name, area, description, tags (partial/half-written words work via includes)
    if (f.nameSearch) {
      const searchable = [n.name, n.area, n.description, ...n.tags]
        .join(" ")
        .toLowerCase();
      const words = f.nameSearch.split(/\s+/);
      // ALL words must appear somewhere in the searchable text
      const allMatch = words.every((w) => searchable.includes(w));
      if (!allMatch) return false;
    }

    return true;
  });
}

export function sortNurseries(data: Nursery[], sort: SortOption): Nursery[] {
  return [...data].sort((a, b) => {
    switch (sort) {
      case "rating":     return b.rating - a.rating;
      case "price-asc":  return a.price - b.price;
      case "price-desc": return b.price - a.price;
      case "spaces":     return b.spaces - a.spaces;
      default:           return 0;
    }
  });
}
