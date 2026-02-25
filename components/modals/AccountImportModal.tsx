import { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';

type Transaction = {
    id: string;
    date: string;
    description: string;
    amount: number;
    type: string;
    bankName: string;
    accountNumber: string;
};

type AccountImportModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onImport: (selectedTransactions: any[]) => void;
    kindergartenId: string;
    accountCodes: any[];
};

export default function AccountImportModal({ isOpen, onClose, onImport, kindergartenId, accountCodes }: AccountImportModalProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [bankData, setBankData] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            // Simulate bank scraping API delay
            setTimeout(() => {
                const today = new Date().toISOString().split('T')[0];
                const mockBankData: Transaction[] = [
                    { id: 'bank-1', date: today, description: '삼성생명보험', amount: 120000, type: 'EXPENSE', bankName: '농협은행', accountNumber: '302-XXXX-XXXX-XX' },
                    { id: 'bank-2', date: today, description: '홍길동입금', amount: 350000, type: 'INCOME', bankName: '농협은행', accountNumber: '302-XXXX-XXXX-XX' },
                    { id: 'bank-3', date: today, description: '(주)교재나라', amount: 480000, type: 'EXPENSE', bankName: '농협은행', accountNumber: '302-XXXX-XXXX-XX' },
                    { id: 'bank-4', date: today, description: '정부지원금', amount: 3000000, type: 'INCOME', bankName: '농협은행', accountNumber: '302-XXXX-XXXX-XX' }
                ];
                setBankData(mockBankData);
                setSelectedIds(mockBankData.map(d => d.id)); // Default to selecting all new un-imported ones
                setIsLoading(false);
            }, 1500);
        }
    }, [isOpen]);

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

    const filteredData = bankData.filter(d =>
        d.description.includes(searchTerm)
    );

    const handleSave = () => {
        const selected = bankData.filter(d => selectedIds.includes(d.id)).map(d => {
            // Auto mapping logic placeholder
            let matchedCode = accountCodes.find(c => c.type === d.type);
            // Example mapping keyword logic:
            if (d.description.includes('보험')) matchedCode = accountCodes.find(c => c.name.includes('보험')) || matchedCode;
            if (d.description.includes('교재')) matchedCode = accountCodes.find(c => c.name.includes('교구')) || matchedCode;

            return {
                id: Math.random().toString(),
                date: new Date(d.date).toISOString(),
                type: d.type,
                accountCode: matchedCode,
                description: d.description,
                amount: d.amount,
                status: 'PENDING'
            };
        });

        onImport(selected);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">계좌 거래내역 가져오기</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 border-b border-gray-200 bg-indigo-50/50 flex gap-4">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-indigo-200 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="적요명으로 검색..."
                        />
                    </div>
                </div>

                <div className="overflow-auto flex-1 bg-white relative min-h-[300px]">
                    {isLoading ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10 backdrop-blur-sm">
                            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                            <p className="text-gray-600 font-medium animate-pulse">등록된 연동 계좌에서 최근 거래내역을 조회 중입니다...</p>
                        </div>
                    ) : null}

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
                                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">거래 일자</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">금융기관</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">분류</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">적요 내용</th>
                                <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">출금/입금액</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {!isLoading && filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        새로 가져올 계좌 거래내역이 없습니다.
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
                                            {t.date}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500">
                                            {t.bankName} <br />
                                            <span className="text-xs text-gray-400 font-mono">{t.accountNumber}</span>
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${t.type === 'INCOME' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'}`}>
                                                {t.type === 'INCOME' ? '입금' : '출금'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                                            {t.description}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-bold text-gray-800 text-right">
                                            <span className={t.type === 'INCOME' ? 'text-blue-700' : 'text-rose-700'}>
                                                {t.amount.toLocaleString()} 원
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                        <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-xs font-bold">Auto</span>
                        선택된 내역은 사전에 설정한 '현금출납부 기초자료 설정' 및 '키워드 설정'에 따라 계정과목이 자동 맵핑됩니다.
                    </p>
                    <div className="flex gap-2">
                        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                            닫기
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={selectedIds.length === 0 || isLoading}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
                        >
                            출납부 반영 ({selectedIds.length}건)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
