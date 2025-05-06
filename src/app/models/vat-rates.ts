// vat-rates.ts
export interface VatRate {
  id?: string; // Optional ID for Firestore document
  continent: string;
  country: string;
  rate: number;
}

// export const vatRatesByContinent: Record<string, VatRate[]> = {
//   Europe: [
//     { country: 'Austria', rate: 20 },
//     { country: 'Belgium', rate: 21 },
//     { country: 'Bulgaria', rate: 20 },
//     { country: 'Croatia', rate: 25 },
//     { country: 'Cyprus', rate: 19 },
//     { country: 'Czech Republic', rate: 21 },
//     { country: 'Denmark', rate: 25 },
//     { country: 'Estonia', rate: 22 },
//     { country: 'Finland', rate: 25.5 },
//     { country: 'France', rate: 20 },
//     { country: 'Germany', rate: 19 },
//     { country: 'Greece', rate: 24 },
//     { country: 'Hungary', rate: 27 },
//     { country: 'Iceland', rate: 24 },
//     { country: 'Ireland', rate: 23 },
//     { country: 'Italy', rate: 22 },
//     { country: 'Latvia', rate: 21 },
//     { country: 'Lithuania', rate: 21 },
//     { country: 'Luxembourg', rate: 17 },
//     { country: 'Malta', rate: 18 },
//     { country: 'Netherlands', rate: 21 },
//     { country: 'Norway', rate: 25 },
//     { country: 'Poland', rate: 23 },
//     { country: 'Portugal', rate: 23 },
//     { country: 'Romania', rate: 19 },
//     { country: 'Slovakia', rate: 23 },
//     { country: 'Slovenia', rate: 22 },
//     { country: 'Spain', rate: 21 },
//     { country: 'Sweden', rate: 25 },
//     { country: 'Switzerland', rate: 8.1 },
//     { country: 'United Kingdom', rate: 20 },
//   ],
//   Asia: [
//     { country: 'China', rate: 13 },
//     { country: 'India', rate: 18 },
//     { country: 'Indonesia', rate: 11 },
//     { country: 'Israel', rate: 17 },
//     { country: 'Japan', rate: 10 },
//     { country: 'Malaysia', rate: 6 },
//     { country: 'Philippines', rate: 12 },
//     { country: 'Singapore', rate: 8 },
//     { country: 'South Korea', rate: 10 },
//     { country: 'Thailand', rate: 7 },
//     { country: 'Vietnam', rate: 10 },
//   ],
//   Africa: [
//     { country: 'Algeria', rate: 19 },
//     { country: 'Egypt', rate: 14 },
//     { country: 'Ethiopia', rate: 15 },
//     { country: 'Ghana', rate: 15 },
//     { country: 'Kenya', rate: 16 },
//     { country: 'Morocco', rate: 20 },
//     { country: 'Nigeria', rate: 7.5 },
//     { country: 'South Africa', rate: 15 },
//     { country: 'Tunisia', rate: 19 },
//     { country: 'Uganda', rate: 18 },
//   ],
//   NorthAmerica: [
//     { country: 'Canada', rate: 5 },
//     { country: 'Mexico', rate: 16 },
//     { country: 'United States', rate: 0 },
//   ],
//   SouthAmerica: [
//     { country: 'Argentina', rate: 21 },
//     { country: 'Brazil', rate: 17 },
//     { country: 'Chile', rate: 19 },
//     { country: 'Colombia', rate: 19 },
//     { country: 'Ecuador', rate: 15 },
//     { country: 'Peru', rate: 18 },
//     { country: 'Uruguay', rate: 22 },
//     { country: 'Venezuela', rate: 16 },
//   ],
//   Oceania: [
//     { country: 'Australia', rate: 10 },
//     { country: 'Fiji', rate: 15 },
//     { country: 'New Zealand', rate: 15 },
//     { country: 'Papua New Guinea', rate: 10 },
//   ],
// };
//
// export function getVatRateByCountry(country: string): number | null {
//   for (const continent of Object.values(vatRatesByContinent)) {
//     const match = continent.find(entry => entry.country === country);
//     if (match) {
//       return match.rate;
//     }
//   }
//   return null; // Return null if no match found
// }
