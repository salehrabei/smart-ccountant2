import React, { useState } from 'react';
import { UploadArea } from './components/UploadArea';
import { ResultTable } from './components/ResultTable';
import { parseInvoiceImage } from './services/geminiService';
import { InvoiceData, AppStatus } from './types';
import { ReceiptText, Loader2, AlertCircle, FileText } from 'lucide-react';

export default function App() {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [data, setData] = useState<InvoiceData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string>('');

  const handleFileSelect = async (file: File) => {
    setStatus(AppStatus.PROCESSING);
    setErrorMsg('');
    setData(null);
    setFileType(file.type);

    // Create a local preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    try {
      const result = await parseInvoiceImage(file);
      setData(result);
      setStatus(AppStatus.SUCCESS);
    } catch (err) {
      console.error(err);
      setStatus(AppStatus.ERROR);
      setErrorMsg("حدث خطأ أثناء معالجة الفاتورة. تأكد من أن الملف واضح وحاول مرة أخرى.");
    }
  };

  const handleReset = () => {
    setStatus(AppStatus.IDLE);
    setData(null);
    setPreviewUrl(null);
    setErrorMsg('');
    setFileType('');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-indigo-600 text-white py-6 shadow-md">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
               <ReceiptText size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">المحاسب الذكي</h1>
              <p className="text-indigo-100 text-sm">استخراج بيانات الفواتير بالذكاء الاصطناعي</p>
            </div>
          </div>
          {status !== AppStatus.IDLE && (
            <button 
              onClick={handleReset}
              className="text-sm bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
            >
              فاتورة جديدة
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 mt-10 max-w-4xl">
        
        {/* Step 1: Upload */}
        {status === AppStatus.IDLE && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 animate-fade-in">
             <div className="mb-6 text-center">
               <h2 className="text-xl font-bold text-gray-800">ابدأ برفع الفاتورة</h2>
               <p className="text-gray-500">ساقوم بقراءة البيانات وتحويلها لملف إكسيل جاهز</p>
             </div>
             <UploadArea onFileSelect={handleFileSelect} disabled={false} />
          </div>
        )}

        {/* Processing State */}
        {status === AppStatus.PROCESSING && (
           <div className="flex flex-col items-center justify-center py-20 animate-pulse">
             <Loader2 size={64} className="text-indigo-600 animate-spin mb-6" />
             <h3 className="text-xl font-bold text-gray-800">جاري تحليل الفاتورة...</h3>
             <p className="text-gray-500 mt-2">يرجى الانتظار، جاري استخراج الأرقام والتفاصيل</p>
             {previewUrl && (
               <div className="mt-8 max-w-xs opacity-50 grayscale flex justify-center w-full">
                 {fileType === 'application/pdf' ? (
                   <div className="flex flex-col items-center p-8 bg-gray-100 rounded-xl border border-gray-200">
                     <FileText size={64} className="text-gray-400 mb-2" />
                     <span className="text-sm text-gray-500 font-medium">ملف PDF</span>
                   </div>
                 ) : (
                   <img src={previewUrl} alt="Processing" className="rounded-lg shadow-md" />
                 )}
               </div>
             )}
           </div>
        )}

        {/* Error State */}
        {status === AppStatus.ERROR && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-lg mx-auto">
            <div className="flex justify-center mb-4 text-red-500">
              <AlertCircle size={48} />
            </div>
            <h3 className="text-lg font-bold text-red-800 mb-2">عفواً، حدث خطأ</h3>
            <p className="text-red-600 mb-6">{errorMsg}</p>
            <button 
              onClick={handleReset}
              className="bg-white border border-red-300 text-red-700 px-6 py-2 rounded-lg hover:bg-red-50 transition-colors"
            >
              حاول مرة أخرى
            </button>
          </div>
        )}

        {/* Step 2: Results */}
        {status === AppStatus.SUCCESS && data && (
          <div className="space-y-8">
             <ResultTable data={data} />
             
             {/* Original Invoice Reference */}
             {previewUrl && (
                <div className="mt-8 bg-white p-6 rounded-xl border border-gray-200 shadow-sm opacity-75 hover:opacity-100 transition-opacity">
                   <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">ملف الفاتورة الأصلي</h3>
                   {fileType === 'application/pdf' ? (
                     <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                       <FileText size={40} className="text-red-500" />
                       <div>
                         <p className="font-bold text-gray-800">مستند PDF</p>
                         <a href={previewUrl} target="_blank" rel="noreferrer" className="text-indigo-600 text-sm hover:underline">
                           عرض الملف
                         </a>
                       </div>
                     </div>
                   ) : (
                     <img src={previewUrl} alt="Original Invoice" className="w-full rounded-lg" />
                   )}
                </div>
             )}
          </div>
        )}
      </main>
    </div>
  );
}