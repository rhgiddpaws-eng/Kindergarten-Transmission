import { useState } from 'react';
import { X, Search, Settings2 } from 'lucide-react';

type ClientAdjustModalProps = {
    isOpen: boolean;
    onClose: () => void;
    transactions: any[];
    onUpdateClient: (transactionIds: string[], newClientName: string) => void;
};

export default function ClientAdjustModal({ isOpen, onClose, transactions, onUpdateClient }: ClientAdjustModalProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [newClientName, setNewClientName] = useState('');

    if (!isOpen) return null;

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

    const filteredData = transactions.filter(d =>
        d.description.includes(searchTerm) || (d.clientName || '').includes(searchTerm)
    );

    const handleSave = () => {
        if (!newClientName.trim()) {
            alert('변경할 거래처명을 입력해주세요.');
            return;
        }
        onUpdateClient(selectedIds, newClientName);
        onClose();
        setNewClientName('');
        setSelectedIds([]);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Settings2 className="w-5 h-5 text-indigo-600" />
                        거래처 일괄 조정
                    </h2>
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
                            placeholder="적요 또는 기존 거래처 검색..."
                        />
                    </div>
                </div>

                <div className="overflow-auto flex-1 bg-white relative min-h-[300px]">
                    <div className="overflow-x-auto">
                    <table className="whitespace-nowrap min-min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100 sticky top-0 z-0 shadow-sm">
                            <tr>
                                <th scope="col" className="px-4 py-3 text-center border-b border-gray-300 w-12">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.length === filteredData.length && filteredData.length > 0}
                                        onChange={handleToggleAll}
                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">일자</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">수입/지출</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">현재 거래처</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">적요 내용</th>
                                <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">금액</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        조회된 전표가 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map((t) => (
                                    <tr key={t.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleToggleSelect(t.id)}>
                                        <td className="px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(t.id)}
                                                onChange={() => handleToggleSelect(t.id)}
                                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500 font-mono">
                                            {new Date(t.date).toISOString().split('T')[0]}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${t.type === 'INCOME' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'}`}>
                                                {t.type === 'INCOME' ? '수입' : '지출'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm font-bold text-gray-800">
                                            {t.clientName || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                            {t.description}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-medium text-gray-700 text-right">
                                            {t.amount.toLocaleString()} 원
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-700">새 거래처명 지정:</span>
                        <input
                            type="text"
                            value={newClientName}
                            onChange={e => setNewClientName(e.target.value)}
                            placeholder="변경할 거래처 입력..."
                            className="block w-48 pl-3 pr-3 py-1.5 border border-indigo-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div className="flex gap-2 items-center">
                        <span className="text-sm text-gray-500 mr-2">선택 {selectedIds.length}건</span>
                        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                            취소
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={selectedIds.length === 0}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
                        >
                            일괄 적용
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
