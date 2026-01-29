import { GoogleGenAI, Type, Schema } from "@google/genai";
import { InvoiceData } from "../types";

// Helper to convert File to Base64
export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64," or "data:application/pdf;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const invoiceSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    invoiceNumber: { type: Type.STRING, description: "The invoice number or ID." },
    date: { type: Type.STRING, description: "The invoice date in YYYY-MM-DD format." },
    vendorName: { type: Type.STRING, description: "The name of the company or vendor issuing the invoice." },
    currency: { type: Type.STRING, description: "Currency symbol or code (e.g., EGP, USD, SAR)." },
    subtotal: { type: Type.NUMBER, description: "The total before tax." },
    tax: { type: Type.NUMBER, description: "The total tax amount." },
    totalAmount: { type: Type.NUMBER, description: "The final total amount to be paid." },
    items: {
      type: Type.ARRAY,
      description: "List of items purchased. Look for columns like 'Red Code', 'LV TY UC', 'Supplier Ref', 'FAM', 'VAT'. Split description into English and Arabic.",
      items: {
        type: Type.OBJECT,
        properties: {
          redCode: { type: Type.STRING, description: "The Red Code or product code." },
          lvTyUc: { type: Type.STRING, description: "The LV TY UC code or similar classification code." },
          supplierRef: { type: Type.STRING, description: "The Supplier Reference (REF)." },
          fam: { type: Type.STRING, description: "The FAM or Family code." },
          vat: { type: Type.NUMBER, description: "The VAT amount or percentage for this item." },
          descriptionEn: { type: Type.STRING, description: "Item name/description in English." },
          descriptionAr: { type: Type.STRING, description: "Item name/description in Arabic." },
          quantity: { type: Type.NUMBER, description: "Quantity purchased." },
          unitPrice: { type: Type.NUMBER, description: "Price per unit." },
          total: { type: Type.NUMBER, description: "Total line item price." }
        },
        required: ["descriptionEn", "descriptionAr", "total"]
      }
    }
  },
  required: ["vendorName", "totalAmount", "items"]
};

export const parseInvoiceImage = async (file: File): Promise<InvoiceData> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const base64Data = await fileToGenerativePart(file);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: file.type,
              data: base64Data
            }
          },
          {
            text: "Analyze this invoice document. Extract the data strictly according to the schema. Look for columns specifically named 'Red Code', 'LV TY UC', 'Supplier REF', 'FAM', and 'VAT'. For the item description, you MUST split it into 'descriptionEn' (English) and 'descriptionAr' (Arabic). If the invoice only has one language, provide a translation."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: invoiceSchema,
        systemInstruction: "You are an expert accountant AI. Extract specific columns: Red Code, LV TY UC, Supplier REF, FAM, VAT, Qty, Unit Price, Total. Split descriptions into English and Arabic."
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text) as InvoiceData;
      return data;
    } else {
      throw new Error("No data returned from Gemini.");
    }
  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    throw error;
  }
};