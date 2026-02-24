import { useState } from 'react';
import { X, Copy, CheckCircle2 } from 'lucide-react';

type PrevYearBudgetModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onImport: (data: any[]) => void;
};

export default function PrevYearBudgetModal({ isOpen, onClose, onImport }: PrevYearBudgetModalProps) {
    const [isLoading, setIsLoading] = useState(false);

    // Dummy previous year data
    const prevYearData = [
        { id: 'py1', type: 'INCOME', category: '수입', item: '보육료수입', subItem: '정부지원보육료', amount: 50000000 },
        { id: 'py2', type: 'INCOME', category: '수입', item: '기타수입', subItem: '예금이자', amount: 200000 },
        { id: 'py3', type: 'EXPENSE', category: '지출', item: '인건비', subItem: '교직원기본급', amount: 30000000 },
        { id: 'py4', type: 'EXPENSE', category: '지출', item: '운영비', subItem: '복리후생비', amount: 5000000 },
        { id: 'py5', type: 'EXPENSE', category: '지출', item: '운영비', subItem: '공공요금', amount: 2000000 },
    ];

    if (!isOpen) return null;

    const handleImport = () => {
        setIsLoading(true);
        setTimeout(() => {
            const importedData = prevYearData.map(d => ({
                ...d,
                id: Math.random().toString() // Generate new IDs for the imported rows
            }));
            onImport(importedData);
            setIsLoading(false);
            onClose();
        }, 800);
    };

    const totalIncome = prevYearData.filter(d => d.type === 'INCOME').reduce((a, b) => a + b.amount, 0);
    const totalExpense = prevYearData.filter(d => d.type === 'EXPENSE').reduce((a, b) => a + b.amount, 0);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">전년도 예산 불러오기 (2024년도 결산 기준)</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 bg-gray-50 flex-1 overflow-y-auto">
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-4">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50 text-gray-700">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold">산출구분</th>
                                    <th className="px-4 py-3 text-left font-semibold">관</th>
                                    <th className="px-4 py-3 text-left font-semibold">항</th>
                                    <th className="px-4 py-3 text-right font-semibold">2024년 결산액</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white text-gray-800">
                                {prevYearData.map((row) => (
                                    <tr key={row.id}>
                                        <td className="px-4 py-3 font-medium">
                                            <span className={`px-2 py-1 rounded text-xs ${row.type === 'INCOME' ? 'bg-indigo-50 text-indigo-700' : 'bg-red-50 text-red-700'}`}>
                                                {row.category}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">{row.item}</td>
                                        <td className="px-4 py-3">{row.subItem}</td>
                                        <td className="px-4 py-3 text-right font-mono">{row.amount.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-gray-50 font-semibold border-t-2">
                                <tr>
                                    <td colSpan={3} className="px-4 py-2 text-right text-gray-600">총 세입:</td>
                                    <td className="px-4 py-2 text-right text-indigo-700 font-mono">{totalIncome.toLocaleString()}</td>
                                </tr>
                                <tr>
                                    <td colSpan={3} className="px-4 py-2 text-right text-gray-600">총 세출:</td>
                                    <td className="px-4 py-2 text-right text-red-700 font-mono">{totalExpense.toLocaleString()}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    <div className="p-4 bg-indigo-50 text-indigo-800 rounded-lg text-sm flex gap-3 items-start border border-indigo-100">
                        <Copy className="w-5 h-5 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold mb-1">전년도 예산을 올해 본예산의 초안으로 복사합니다.</p>
                            <p className="opacity-90">선택된 데이터는 올해 예산서의 새로운 항렬로 추가되며, 복사 후 금액을 수정하여 최종 본예산서를 작성할 수 있습니다.</p>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-200 bg-white flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                        취소
                    </button>
                    <button
                        onClick={handleImport}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 transition shadow-sm"
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                복사 중...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <Copy className="w-4 h-4" /> 내역 복사하여 작성하기
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
