import { useState, useRef } from 'react';
import { X, Upload, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';

type ExcelUploadModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onImport: (transactions: any[]) => void;
    accountCodes: any[];
};

export default function ExcelUploadModal({ isOpen, onClose, onImport, accountCodes }: ExcelUploadModalProps) {
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [fileName, setFileName] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target?.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws);

            // Map generic Excel columns to transaction data
            const mappedData = data.map((row: any, index: number) => {
                const typeStr = row['수입/지출'] || '수입';
                const type = typeStr.includes('지출') ? 'EXPENSE' : 'INCOME';

                // Try finding matching account code
                const desc = (row['적요'] || row['적요내용'] || '엑셀 업로드 내역').toString();
                let matchedCode = accountCodes.find(c => c.type === type);

                return {
                    id: `excel-${Date.now()}-${index}`,
                    date: row['일자'] || row['날짜'] || new Date().toISOString().split('T')[0],
                    type: type,
                    accountCode: matchedCode,
                    description: desc,
                    amount: Number(row['금액'] || 0),
                    clientName: row['거래처'] || row['고객사'] || '',
                    status: 'PENDING'
                };
            });

            setPreviewData(mappedData);
        };
        reader.readAsBinaryString(file);
    };

    const handleUpload = () => {
        if (previewData.length > 0) {
            onImport(previewData);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">엑셀 일괄 업로드</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-4">
                    <input
                        type="file"
                        accept=".xlsx, .xls, .csv"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm transition-colors text-sm"
                    >
                        <Upload className="w-4 h-4" />
                        파일 선택 (엑셀양식)
                    </button>
                    {fileName && <span className="text-sm font-medium text-gray-700 ml-2 text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">{fileName}</span>}
                </div>

                <div className="overflow-auto flex-1 bg-white relative min-h-[300px]">
                    {previewData.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
                            <FileSpreadsheet className="w-16 h-16 text-gray-300 mb-4" />
                            <p className="font-medium text-lg text-gray-800">엑셀 파일을 선택해주세요.</p>
                            <p className="text-sm mt-1">파일의 데이터가 여기에 미리보기로 표시됩니다.</p>
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100 sticky top-0 z-0 shadow-sm">
                                <tr>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">일자</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">수입/지출</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">거래처</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">적요 내용</th>
                                    <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">금액</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {previewData.map((t, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 text-sm text-gray-700">{t.date}</td>
                                        <td className="px-4 py-2 text-sm">
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${t.type === 'INCOME' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'}`}>
                                                {t.type === 'INCOME' ? '수입' : '지출'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-700 font-medium">{t.clientName}</td>
                                        <td className="px-4 py-2 text-sm text-gray-900">{t.description}</td>
                                        <td className="px-4 py-2 text-sm text-right font-bold text-gray-800">{t.amount.toLocaleString()} 원</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                        총 <span className="font-bold text-indigo-700">{previewData.length}</span> 건의 데이터가 확인되었습니다.
                    </p>
                    <div className="flex gap-2">
                        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                            닫기
                        </button>
                        <button
                            onClick={handleUpload}
                            disabled={previewData.length === 0}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
                        >
                            업로드
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
