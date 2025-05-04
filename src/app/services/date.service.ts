import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DateService {
  constructor() {}

  // Convert various date formats to a Date object
  convertToDate(date: any): Date {
    if (date instanceof Date) {
      return date;
    } else if (typeof date === 'string' || typeof date === 'number') {
      return new Date(date);
    } else if (date?._seconds && date?._nanoseconds) {
      return new Date(date._seconds * 1000); // SerializedTimestamp
    } else if (date?.seconds && date?.nanoseconds) {
      return new Date(date.seconds * 1000); // Firestore Timestamp
    } else {
      console.warn('Unknown date format:', date);
      return new Date();
    }
  }

  // Filter sales data by a selected time period
  filterByDate(data: { saleDate: any }[], period: string): any[] {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'day':
        startDate = new Date(now.setHours(0, 0, 0, 0)); // Beginning of today
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - now.getDay())); // Start of the week
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1); // Start of the month
        break;
      default:
        startDate = new Date(0); // No filter (all dates)
    }
    return data.filter((item) => this.convertToDate(item.saleDate) >= startDate);
  }

  formatDate(date: any) {
    const d = this.convertToDate(date);
    const day = d.getDate().toString().padStart(2, '0'); // Ensure two digits
    const month = (d.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-based
    const year = d.getFullYear();
    return `${day}-${month}-${year}`; // Format: DD-MM-YYYY
  }
}
