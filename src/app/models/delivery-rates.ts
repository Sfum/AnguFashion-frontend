export interface DeliveryRate {
  id?: string;
  country: string;
  delivery_mode: string;
  rate: number;
}

// export const deliveryRatesByContinent: Record<string, DeliveryRate[]> = {
//   Europe: [
//     { country: 'Austria', rate: 10, continent: 'Europe' },
//     { country: 'Belgium', rate: 10, continent: 'Europe' },
//     { country: 'Bulgaria', rate: 10, continent: 'Europe' },
//     { country: 'Croatia', rate: 10, continent: 'Europe' },
//     { country: 'Cyprus', rate: 10, continent: 'Europe' },
//     { country: 'Czech Republic', rate: 10, continent: 'Europe' },
//     { country: 'Denmark', rate: 10, continent: 'Europe' },
//     { country: 'Estonia', rate: 10, continent: 'Europe' },
//     { country: 'Finland', rate: 10, continent: 'Europe' },
//     { country: 'France', rate: 10, continent: 'Europe' },
//     { country: 'Germany', rate: 10, continent: 'Europe' },
//     { country: 'Greece', rate: 10, continent: 'Europe' },
//     { country: 'Hungary', rate: 10, continent: 'Europe' },
//     { country: 'Iceland', rate: 10, continent: 'Europe' },
//     { country: 'Ireland', rate: 10, continent: 'Europe' },
//     { country: 'Italy', rate: 10, continent: 'Europe' },
//     { country: 'Latvia', rate: 10, continent: 'Europe' },
//     { country: 'Lithuania', rate: 10, continent: 'Europe' },
//     { country: 'Luxembourg', rate: 10, continent: 'Europe' },
//     { country: 'Malta', rate: 10, continent: 'Europe' },
//     { country: 'Netherlands', rate: 10, continent: 'Europe' },
//     { country: 'Norway', rate: 10, continent: 'Europe' },
//     { country: 'Poland', rate: 10, continent: 'Europe' },
//     { country: 'Portugal', rate: 10, continent: 'Europe' },
//     { country: 'Romania', rate: 10, continent: 'Europe' },
//     { country: 'Slovakia', rate: 10, continent: 'Europe' },
//     { country: 'Slovenia', rate: 10, continent: 'Europe' },
//     { country: 'Spain', rate: 10, continent: 'Europe' },
//     { country: 'Sweden', rate: 10, continent: 'Europe' },
//     { country: 'Switzerland', rate: 10, continent: 'Europe' },
//     { country: 'United Kingdom', rate: 10, continent: 'Europe' },
//   ],
//   Asia: [
//     { country: 'China', rate: 25, continent: 'Asia' },
//     { country: 'India', rate: 25, continent: 'Asia' },
//     { country: 'Indonesia', rate: 25, continent: 'Asia' },
//     { country: 'Israel', rate: 25, continent: 'Asia' },
//     { country: 'Japan', rate: 25, continent: 'Asia' },
//     { country: 'Malaysia', rate: 25, continent: 'Asia' },
//     { country: 'Philippines', rate: 25, continent: 'Asia' },
//     { country: 'Singapore', rate: 25, continent: 'Asia' },
//     { country: 'South Korea', rate: 25, continent: 'Asia' },
//     { country: 'Thailand', rate: 25, continent: 'Asia' },
//     { country: 'Vietnam', rate: 25, continent: 'Asia' },
//   ],
//   Africa: [
//     { country: 'Algeria', rate: 30, continent: 'Africa' },
//     { country: 'Egypt', rate: 30, continent: 'Africa' },
//     { country: 'Ethiopia', rate: 30, continent: 'Africa' },
//     { country: 'Ghana', rate: 30, continent: 'Africa' },
//     { country: 'Kenya', rate: 30, continent: 'Africa' },
//     { country: 'Morocco', rate: 30, continent: 'Africa' },
//     { country: 'Nigeria', rate: 30, continent: 'Africa' },
//     { country: 'South Africa', rate: 30, continent: 'Africa' },
//     { country: 'Tunisia', rate: 30, continent: 'Africa' },
//     { country: 'Uganda', rate: 30, continent: 'Africa' },
//   ],
//   NorthAmerica: [
//     { country: 'Canada', rate: 28, continent: 'NorthAmerica' },
//     { country: 'Mexico', rate: 28, continent: 'NorthAmerica' },
//     { country: 'United States', rate: 28, continent: 'NorthAmerica' },
//   ],
//   SouthAmerica: [
//     { country: 'Argentina', rate: 30, continent: 'SouthAmerica' },
//     { country: 'Brazil', rate: 30, continent: 'SouthAmerica' },
//     { country: 'Chile', rate: 30, continent: 'SouthAmerica' },
//     { country: 'Colombia', rate: 30, continent: 'SouthAmerica' },
//     { country: 'Ecuador', rate: 30, continent: 'SouthAmerica' },
//     { country: 'Peru', rate: 30, continent: 'SouthAmerica' },
//     { country: 'Uruguay', rate: 30, continent: 'SouthAmerica' },
//     { country: 'Venezuela', rate: 30, continent: 'SouthAmerica' },
//   ],
//   Oceania: [
//     { country: 'Australia', rate: 30, continent: 'Oceania' },
//     { country: 'Fiji', rate: 30, continent: 'Oceania' },
//     { country: 'New Zealand', rate: 30, continent: 'Oceania' },
//     { country: 'Papua New Guinea', rate: 30, continent: 'Oceania' },
//   ],
// };

// export function getDeliveryRateByCountry(country: string): number | null {
//   for (const continent of Object.values(deliveryRatesByContinent)) {
//     const match = continent.find(entry => entry.country === country);
//     if (match) {
//       return match.rate;
//     }
//   }
//   return null;
// }
