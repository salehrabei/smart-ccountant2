import React from 'react';
import { InvoiceData } from '../types';
import { FileSpreadsheet } from 'lucide-react';
import { generateCSV, downloadCSV } from '../services/csvService';

interface ResultTableProps {
  data: InvoiceData;
}

export const ResultTable: React.FC<ResultTableProps> = ({ data }) => {
  
  const handleDownload = () => {
    const csv = generateCSV(data);
    const filename = `invoice_extract_${new Date().toISOString().slice(0,10)}.csv`;
    downloadCSV(csv, filename);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-fade-in-up">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-gray-50 to-white">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <span className="text-green-600">✓</span> Extraction Complete
          </h2>
          <p className="text-sm text-gray-500 mt-1">Data ready for export</p>
        </div>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors shadow-sm"
        >
          <FileSpreadsheet size={20} />
          <span>Download Excel (CSV)</span>
        </button>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Vendor</p>
          <p className="text-lg font-bold text-gray-900 mt-1">{data.vendorName || 'N/A'}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Total Amount</p>
          <p className="text-lg font-bold text-green-700 mt-1">{data.totalAmount?.toLocaleString()} {data.currency}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm" dir="ltr">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="py-3 px-4 font-semibold whitespace-nowrap">Red Code</th>
              <th className="py-3 px-4 font-semibold whitespace-nowrap">LV TY UC</th>
              <th className="py-3 px-4 font-semibold whitespace-nowrap">Supplier REF</th>
              <th className="py-3 px-4 font-semibold whitespace-nowrap">FAM</th>
              <th className="py-3 px-4 font-semibold whitespace-nowrap">VAT</th>
              <th className="py-3 px-4 font-semibold whitespace-nowrap">Desc (EN)</th>
              <th className="py-3 px-4 font-semibold whitespace-nowrap text-right">Desc (AR)</th>
              <th className="py-3 px-4 font-semibold text-center whitespace-nowrap">Qty</th>
              <th className="py-3 px-4 font-semibold text-center whitespace-nowrap">Unit Price</th>
              <th className="py-3 px-4 font-semibold text-center whitespace-nowrap">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.items.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 font-mono text-xs text-gray-600">{item.redCode || '-'}</td>
                <td className="py-3 px-4 font-mono text-xs text-gray-600">{item.lvTyUc || '-'}</td>
                <td className="py-3 px-4 font-mono text-xs text-gray-600">{item.supplierRef || '-'}</td>
                <td className="py-3 px-4">{item.fam || '-'}</td>
                <td className="py-3 px-4">{item.vat ? item.vat.toLocaleString() : '-'}</td>
                <td className="py-3 px-4 max-w-[200px] truncate" title={item.descriptionEn}>{item.descriptionEn}</td>
                <td className="py-3 px-4 max-w-[200px] truncate text-right font-arabic" title={item.descriptionAr}>{item.descriptionAr}</td>
                <td className="py-3 px-4 text-center font-bold">{item.quantity}</td>
                <td className="py-3 px-4 text-center">{item.unitPrice.toLocaleString()}</td>
                <td className="py-3 px-4 text-center font-medium">{item.total.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50 font-semibold text-gray-900">
             <tr className="bg-indigo-50 text-indigo-900 text-base">
                <td colSpan={9} className="py-4 px-6 text-right">Grand Total ({data.currency})</td>
                <td className="py-4 px-6 text-center font-bold">{data.totalAmount?.toLocaleString()}</td>
             </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};