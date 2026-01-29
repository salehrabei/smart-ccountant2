export interface LineItem {
  redCode?: string;
  lvTyUc?: string;
  supplierRef?: string;
  fam?: string;
  vat?: number;
  descriptionEn: string;
  descriptionAr: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  date: string;
  vendorName: string;
  currency: string;
  subtotal: number;
  tax: number;
  totalAmount: number;
  items: LineItem[];
  summary?: string; // Optional brief summary
}

export enum AppStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}