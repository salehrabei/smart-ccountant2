import { InvoiceData } from "../types";

export const generateCSV = (data: InvoiceData): string => {
  // BOM for Excel to recognize UTF-8 (essential for Arabic)
  const BOM = "\uFEFF";
  
  // Headers in English only, matching the requested order
  const headers = [
    "Red Code",
    "LV TY UC",
    "Supplier REF",
    "FAM",
    "VAT",
    "Description (EN)",
    "Description (AR)",
    "Qty",
    "Unit Price",
    "Line Total"
  ];

  const rows: string[] = [];
  rows.push(headers.join(","));

  // Create a row for each item
  if (data.items && data.items.length > 0) {
    data.items.forEach((item) => {
      
      // Force Excel to treat these codes as strings by wrapping in ="value"
      // This is crucial to prevent stripping leading zeros (e.g. 00123) or converting to scientific notation
      const redCodeFormatted = item.redCode ? `="${item.redCode}"` : '';
      const lvTyUcFormatted = item.lvTyUc ? `="${item.lvTyUc}"` : '';
      const supplierRefFormatted = item.supplierRef ? `="${item.supplierRef}"` : '';
      const famFormatted = item.fam ? `="${item.fam}"` : '';

      const row = [
        redCodeFormatted,
        lvTyUcFormatted,
        supplierRefFormatted,
        famFormatted,
        item.vat || 0,
        `"${(item.descriptionEn || '').replace(/"/g, '""')}"`, // English Description Column
        `"${(item.descriptionAr || '').replace(/"/g, '""')}"`, // Arabic Description Column
        item.quantity || 0,
        item.unitPrice || 0,
        item.total || 0
      ];
      rows.push(row.join(","));
    });
  } else {
      // Fallback if no items found
      const row = [
        "", "", "", "", 0,
        "No Items Detected",
        "",
        0,
        0,
        0
      ];
      rows.push(row.join(","));
  }

  return BOM + rows.join("\n");
};

export const downloadCSV = (csvContent: string, fileName: string) => {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};