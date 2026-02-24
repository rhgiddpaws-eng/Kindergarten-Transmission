import { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';

type Transaction = {
    id: string;
    date: string;
    kindergarten: any;
    type: string;
    accountCode: any;
    description: string;
    amount: number;
    status: string;
};

type PrevMonthModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onImport: (selectedTransactions: Transaction[]) => void;
    kindergartenId: string;
    accountCodes: any[];
    kindergartens: any[];
};

export default function PrevMonthModal({ isOpen, onClose, onImport, kindergartenId, accountCodes, kindergartens }: PrevMonthModalProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // Mock dummy data for the previous month
    const currentDate = new Date();
    currentDate.setMonth(currentDate.getMonth() - 1);
    const prevMonthStr = currentDate.toISOString().split('T')[0].substring(0, 7); // e.g., 2026-01

    const [dummyData, setDummyData] = useState<Transaction[]>([]);

    useEffect(() => {
        if (isOpen && accountCodes.length > 0) {
            // Generate some random fake data for the previous month when opened
            const incomes = accountCodes.filter(c => c.type === 'INCOME');
            const expenses = accountCodes.filter(c => c.type === 'EXPENSE');

            const mockData: Transaction[] = [
                {
                    id: 'prev-1',
                    date: `${prevMonthStr}-15`,
                    kindergarten: kindergartens.find(k => k.id === kindergartenId) || kindergartens[0],
                    type: 'EXPENSE',
                    accountCode: expenses[0] || accountCodes[0],
                    description: '교원 급여 (홍길동)',
                    amount: 2500000,
                    status: 'SUCCESS'
                },
                {
                    id: 'prev-2',
                    date: `${prevMonthStr}-20`,
                    kindergarten: kindergartens.find(k => k.id === kindergartenId) || kindergartens[0],
                    type: 'EXPENSE',
                    accountCode: expenses[1] || accountCodes[0],
                    description: '전기요금 및 수도요금 (한국전력공사)',
                    amount: 450000,
                    status: 'SUCCESS'
                },
                {
                    id: 'prev-3',
                    date: `${prevMonthStr}-25`,
                    kindergarten: kindergartens.find(k => k.id === kindergartenId) || kindergartens[0],
                    type: 'EXPENSE',
                    accountCode: expenses[2] || accountCodes[0],
                    description: '방과후과정 식재료비',
                    amount: 1100000,
                    status: 'SUCCESS'
                }
            ];
            setDummyData(mockData);
            setSelectedIds([]); // reset selection
        }
    }, [isOpen, kindergartenId, accountCodes, kindergartens, prevMonthStr]);

    if (!isOpen) return null;

    const currentMonthStr = new Date().toISOString().split('T')[0].substring(0, 7);

    const handleToggleSelect = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(v => v !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleToggleAll = () => {
        if (selectedIds.length === filteredData.length && filteredData.length > 0) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredData.map(d => d.id));
        }
    };

    // Make amounts editable for selected transactions just before import? The manual mentions "전월과 금액이 달라질 경우 분개 금액을 수정해서 일치시켜서 처리"
    // To keep it simple, they can edit it in the modal.
    const handleAmountChange = (id: string, newAmount: number) => {
        setDummyData(dummyData.map(d => d.id === id ? { ...d, amount: newAmount } : d));
    };

    const handleDescriptionChange = (id: string, newDesc: string) => {
        setDummyData(dummyData.map(d => d.id === id ? { ...d, description: newDesc } : d));
    }


    const filteredData = dummyData.filter(d =>
        d.description.includes(searchTerm) ||
        d.accountCode?.name.includes(searchTerm)
    );

    const handleSave = () => {
        const selected = dummyData.filter(d => selectedIds.includes(d.id)).map(d => ({
            ...d,
            // Replace date with current month but same day (simplified)
            date: d.date.replace(prevMonthStr, currentMonthStr),
            id: Math.random().toString(), // Generate new IDs for the imported ones
            status: 'PENDING'
        }));
        onImport(selected);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">전월자료 가져오기 ({prevMonthStr})</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 border-b border-gray-200 bg-gray-50 flex gap-4">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="적요, 계정으로 검색..."
                        />
                    </div>
                </div>

                <div className="overflow-auto flex-1 bg-white">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th scope="col" className="px-4 py-3 text-center border-b border-gray-300">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.length === filteredData.length && filteredData.length > 0}
                                        onChange={handleToggleAll}
                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">전월 날짜</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">분류</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">관/항/목 (Account)</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">적요 (Description) - [수정 가능]</th>
                                <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">금액 (Amount) - [수정 가능]</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        검색된 전월 자료가 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map((t) => (
                                    <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 text-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(t.id)}
                                                onChange={() => handleToggleSelect(t.id)}
                                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500 font-mono">
                                            {t.date}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${t.type === 'INCOME' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'}`}>
                                                {t.type === 'INCOME' ? '수입' : '지출'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                                            {t.accountCode?.name || 'N/A'}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <input
                                                type="text"
                                                value={t.description}
                                                onChange={(e) => handleDescriptionChange(t.id, e.target.value)}
                                                className="w-full bg-transparent border-b border-transparent hover:border-gray-300 focus:border-indigo-500 focus:outline-none px-1 py-1"
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-sm font-bold text-gray-800 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <input
                                                    type="number"
                                                    value={t.amount}
                                                    onChange={(e) => handleAmountChange(t.id, Number(e.target.value))}
                                                    className="w-24 text-right bg-transparent border-b border-transparent hover:border-gray-300 focus:border-indigo-500 focus:outline-none px-1 py-1"
                                                />
                                                <span className="text-gray-500 font-normal">원</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                        수정된 금액으로 이번 달 <strong>({currentMonthStr})</strong> 현금출납부에 자동 동기화됩니다.
                    </p>
                    <div className="flex gap-2">
                        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                            취소
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={selectedIds.length === 0}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
                        >
                            선택 내역 단기 분개 적용 ({selectedIds.length}건)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
