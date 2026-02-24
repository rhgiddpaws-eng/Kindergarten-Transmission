import { Calculator, X, AlertTriangle, CheckCircle } from 'lucide-react';

type BudgetMatchModalProps = {
    isOpen: boolean;
    onClose: () => void;
    budgetData: any[];
};

export default function BudgetMatchModal({ isOpen, onClose, budgetData }: BudgetMatchModalProps) {
    if (!isOpen) return null;

    const totalIncome = budgetData.filter(d => d.type === 'INCOME').reduce((a, b) => a + Number(b.amount || 0), 0);
    const totalExpense = budgetData.filter(d => d.type === 'EXPENSE').reduce((a, b) => a + Number(b.amount || 0), 0);
    const difference = totalIncome - totalExpense;

    // Determine if income and expense match exactly
    const isMatched = difference === 0 && totalIncome > 0;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Calculator className="w-6 h-6 text-indigo-600" />
                        세입/세출 일치 확인
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 bg-gray-50 flex-1 flex flex-col gap-6">

                    {/* Status Banner */}
                    <div className={`p-4 rounded-lg flex items-start gap-3 border ${isMatched ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                        {isMatched ? <CheckCircle className="w-6 h-6 shrink-0 mt-0.5 text-emerald-600" /> : <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5 text-red-600" />}
                        <div>
                            <h3 className="font-bold text-lg leading-tight mb-1">
                                {isMatched ? '세입과 세출이 정확히 일치합니다.' : '세입과 세출 금액이 일치하지 않습니다.'}
                            </h3>
                            <p className="text-sm opacity-90">
                                {isMatched
                                    ? '본예산서를 마감하고 에듀파인에 관항목을 업로드할 수 있습니다.'
                                    : '유치원회계규칙에 따라 예산의 총수입과 총지출은 일치해야 합니다. 산출 내역을 다시 확인해주세요.'}
                            </p>
                        </div>
                    </div>

                    {/* Summary Chart/Numbers */}
                    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm space-y-4">
                        <div className="flex justify-between items-center border-b pb-4">
                            <div className="font-medium text-gray-600">총 세입 예산액</div>
                            <div className="text-xl font-bold text-indigo-700 font-mono tracking-tight">{totalIncome.toLocaleString()} 원</div>
                        </div>
                        <div className="flex justify-between items-center border-b pb-4">
                            <div className="font-medium text-gray-600">총 세출 예산액</div>
                            <div className="text-xl font-bold text-red-700 font-mono tracking-tight">{totalExpense.toLocaleString()} 원</div>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                            <div className="font-bold text-gray-800">차액 (수입 - 지출)</div>
                            <div className={`text-2xl font-black font-mono tracking-tight ${difference === 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {difference.toLocaleString()} 원
                            </div>
                        </div>
                    </div>

                </div>

                <div className="px-6 py-4 border-t border-gray-200 bg-white flex justify-end gap-2">
                    <button onClick={onClose} className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 transition shadow-sm">
                        확인
                    </button>
                </div>
            </div>
        </div>
    );
}
