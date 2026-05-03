import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding nurseries...");

  await prisma.nursery.deleteMany();

  await prisma.nursery.createMany({
    data: [
      {
        name: "Meadowside Nursery",
        area: "Morningside",
        postcode: "EH10 4BX",
        rating: 4.9,
        reviews: 38,
        ageRange: "3 months - 5 years",
        price: 62,
        spaces: 3,
        tags: ["Outdoor Learning", "Nursery School"],
        ofsted: "Outstanding",
        hours: "7:30am - 6:00pm",
        description:
          "Award-winning nursery with forest school sessions and a dedicated baby room. Edinburgh's highest-rated setting for under-2s.",
        lat: 55.9227,
        lng: -3.2063,
      },
      {
        name: "Little Scholars",
        area: "Leith",
        postcode: "EH6 8DB",
        rating: 4.7,
        reviews: 61,
        ageRange: "6 months - 4 years",
        price: 54,
        spaces: 0,
        tags: ["Bilingual", "STEM Focus"],
        ofsted: "Outstanding",
        hours: "8:00am - 6:00pm",
        description:
          "Bilingual English/French setting with dedicated STEM play zones. Currently at capacity — join the waitlist.",
        lat: 55.9752,
        lng: -3.1659,
      },
      {
        name: "Bumblebee Day Nursery",
        area: "Bruntsfield",
        postcode: "EH10 4HR",
        rating: 4.8,
        reviews: 44,
        ageRange: "2 - 5 years",
        price: 58,
        spaces: 1,
        tags: ["Arts & Crafts", "Garden"],
        ofsted: "Outstanding",
        hours: "7:45am - 5:45pm",
        description:
          "Intimate, home-from-home setting with a beautiful garden. Specialises in creative arts and natural play.",
        lat: 55.9357,
        lng: -3.2034,
      },
      {
        name: "Sunshine Days",
        area: "Newington",
        postcode: "EH9 1QH",
        rating: 4.6,
        reviews: 29,
        ageRange: "3 months - 5 years",
        price: 49,
        spaces: 5,
        tags: ["Flexible Hours", "Funded Places"],
        ofsted: "Good",
        hours: "8:00am - 6:30pm",
        description:
          "Flexible sessions with early start options. Accepts funded hours for 3-4 year olds. Multiple spaces available.",
        lat: 55.9364,
        lng: -3.1833,
      },
      {
        name: "Little Explorers",
        area: "Stockbridge",
        postcode: "EH3 5NE",
        rating: 4.9,
        reviews: 52,
        ageRange: "1 - 5 years",
        price: 67,
        spaces: 2,
        tags: ["Nature Play", "Yoga"],
        ofsted: "Outstanding",
        hours: "7:30am - 6:00pm",
        description:
          "Edinburgh's only nursery with weekly parent yoga sessions. Nature-based curriculum with regular trips to Inverleith Park.",
        lat: 55.9578,
        lng: -3.2065,
      },
      {
        name: "Bright Futures",
        area: "Corstorphine",
        postcode: "EH12 7AA",
        rating: 4.5,
        reviews: 33,
        ageRange: "3 months - 4 years",
        price: 51,
        spaces: 7,
        tags: ["Large Setting", "Funded Places"],
        ofsted: "Good",
        hours: "7:30am - 6:30pm",
        description:
          "Spacious purpose-built nursery with a large outdoor area. Most availability in Edinburgh — great for flexible working parents.",
        lat: 55.9436,
        lng: -3.2795,
      },
    ],
  });

  console.log("Done — 6 nurseries seeded.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());