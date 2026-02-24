import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

type AccountCode = {
    id: string;
    code: string;
    name: string;
    type: string;
};

type MultiJournalModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSave: (splits: any[]) => void;
    accountCodes: AccountCode[];
    initialAmount?: number;
};

export default function MultiJournalModal({ isOpen, onClose, onSave, accountCodes, initialAmount = 0 }: MultiJournalModalProps) {
    const [totalAmount, setTotalAmount] = useState(initialAmount);
    const [splits, setSplits] = useState([
        { id: Math.random().toString(), accountCodeId: '', amount: 0, description: '' },
    ]);

    useEffect(() => {
        if (isOpen) {
            setTotalAmount(initialAmount);
            if (splits.length === 1 && splits[0].amount === 0) {
                setSplits([{ ...splits[0], amount: initialAmount }]);
            }
        }
    }, [isOpen, initialAmount]);

    if (!isOpen) return null;

    const handleAddSplit = () => {
        setSplits([...splits, { id: Math.random().toString(), accountCodeId: '', amount: 0, description: '' }]);
    };

    const handleRemoveSplit = (id: string) => {
        if (splits.length > 1) {
            setSplits(splits.filter(s => s.id !== id));
        }
    };

    const handleSplitChange = (id: string, field: string, value: any) => {
        setSplits(splits.map(s => s.id === id ? { ...s, [field]: value } : s));
    };

    const currentTotal = splits.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const difference = totalAmount - currentTotal;

    const handleSave = () => {
        if (difference !== 0) {
            alert('입력된 분류 항목의 총합이 전체 금액과 일치하지 않습니다.');
            return;
        }

        const invalidSplits = splits.filter(s => !s.accountCodeId || s.amount <= 0);
        if (invalidSplits.length > 0) {
            alert('계정과목과 올바른 금액을 선택/입력해주세요.');
            return;
        }

        onSave(splits);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">다중 분개 (Multiple Journaling)</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
                    <div className="mb-6 bg-indigo-50 border border-indigo-100 p-4 rounded-lg flex items-center justify-between">
                        <div>
                            <span className="text-sm text-indigo-800 font-medium">분개 대상 총 금액</span>
                            <p className="text-xs text-indigo-600 mt-1">이 금액을 여러 관항목으로 나누어 입력합니다.</p>
                        </div>
                        <input
                            type="number"
                            className="text-right text-lg font-bold text-indigo-900 bg-white border border-indigo-200 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={totalAmount}
                            onChange={(e) => setTotalAmount(Number(e.target.value))}
                        />
                    </div>

                    <div className="space-y-3">
                        {splits.map((split, index) => (
                            <div key={split.id} className="flex gap-3 items-start bg-white p-3 rounded-lg border border-gray-200 shadow-sm relative group">
                                <div className="w-8 shrink-0 flex items-center justify-center h-10 font-medium text-gray-400">
                                    {index + 1}
                                </div>

                                <div className="flex-1 grid grid-cols-12 gap-3">
                                    <div className="col-span-4">
                                        <label className="block text-xs font-semibold text-gray-500 mb-1">관/항/목 (Account)</label>
                                        <select
                                            value={split.accountCodeId}
                                            onChange={(e) => handleSplitChange(split.id, 'accountCodeId', e.target.value)}
                                            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
                                        >
                                            <option value="" disabled>선택하세요</option>
                                            {accountCodes.map(c => (
                                                <option key={c.id} value={c.id}>[{c.type === 'INCOME' ? '수입' : '지출'}] {c.code} - {c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-span-4">
                                        <label className="block text-xs font-semibold text-gray-500 mb-1">적요 (Description)</label>
                                        <input
                                            type="text"
                                            placeholder="항목별 적요 입력"
                                            value={split.description}
                                            onChange={(e) => handleSplitChange(split.id, 'description', e.target.value)}
                                            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
                                        />
                                    </div>
                                    <div className="col-span-4">
                                        <label className="block text-xs font-semibold text-gray-500 mb-1">분배 금액 (Amount)</label>
                                        <input
                                            type="number"
                                            placeholder="0"
                                            value={split.amount || ''}
                                            onChange={(e) => handleSplitChange(split.id, 'amount', Number(e.target.value))}
                                            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm text-right focus:border-indigo-500 font-medium focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleRemoveSplit(split.id)}
                                    disabled={splits.length === 1}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition mt-5 disabled:opacity-30 disabled:hover:text-gray-400 disabled:hover:bg-transparent"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={handleAddSplit}
                        className="mt-4 flex items-center justify-center gap-2 w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50/50 transition"
                    >
                        <Plus className="w-4 h-4" />
                        분개 항목 추가
                    </button>
                </div>

                <div className="px-6 py-4 border-t border-gray-200 bg-white flex justify-between items-center">
                    <div className="flex gap-4 items-center">
                        <div className="text-sm">
                            <span className="text-gray-500">배분된 금액:</span>
                            <span className="ml-2 font-bold text-gray-800">{currentTotal.toLocaleString()} 원</span>
                        </div>
                        <div className="text-sm">
                            <span className="text-gray-500">차액:</span>
                            <span className={`ml-2 font-bold ${difference === 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {difference.toLocaleString()} 원
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                            취소
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={difference !== 0}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
                        >
                            분개 등록
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
