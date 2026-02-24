import { useState, useEffect } from 'react';
import { X, Search, RefreshCw } from 'lucide-react';

type CmsRecord = {
    id: string;
    date: string;
    studentName: string;
    amount: number;
    description: string;
};

type CmsImportModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onImport: (selectedTransactions: any[]) => void;
    accountCodes: any[];
};

export default function CmsImportModal({ isOpen, onClose, onImport, accountCodes }: CmsImportModalProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [cmsData, setCmsData] = useState<CmsRecord[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            // Simulate CMS scraping delay (e-Kidsville etc)
            setTimeout(() => {
                const today = new Date().toISOString().split('T')[0];
                const mockCmsData: CmsRecord[] = [
                    { id: 'cms-1', date: today, studentName: '김지민', amount: 250000, description: '원비 납부' },
                    { id: 'cms-2', date: today, studentName: '이서준', amount: 250000, description: '원비 납부' },
                    { id: 'cms-3', date: today, studentName: '박하은', amount: 250000, description: '원비 납부 (CMS자동이체)' },
                    { id: 'cms-4', date: today, studentName: '최도윤', amount: 300000, description: '특기적성비 포함' }
                ];
                setCmsData(mockCmsData);
                setSelectedIds(mockCmsData.map(d => d.id));
                setIsLoading(false);
            }, 1200);
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

    const filteredData = cmsData.filter(d =>
        d.studentName.includes(searchTerm) || d.description.includes(searchTerm)
    );

    const handleSave = () => {
        const selected = cmsData.filter(d => selectedIds.includes(d.id)).map(d => {
            const incomeCode = accountCodes.find(c => c.type === 'INCOME');

            return {
                id: `cms-imported-${Math.random().toString()}`,
                date: new Date(d.date).toISOString(),
                type: 'INCOME',
                accountCode: incomeCode,
                description: `[CMS] ${d.studentName} ${d.description}`,
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
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <RefreshCw className="w-5 h-5 text-indigo-600" />
                        e키즈빌 CMS 가져오기
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 border-b border-gray-200 bg-blue-50/50 flex gap-4">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-blue-200 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="원아명 또는 적요 검색..."
                        />
                    </div>
                </div>

                <div className="overflow-auto flex-1 bg-white relative min-h-[300px]">
                    {isLoading ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10 backdrop-blur-sm">
                            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                            <p className="text-gray-600 font-medium animate-pulse">CMS 서버에서 수납 내역을 실시간으로 가져옵니다...</p>
                        </div>
                    ) : null}

                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100 sticky top-0 z-0 shadow-sm">
                            <tr>
                                <th scope="col" className="px-4 py-3 text-center border-b border-gray-300 w-12">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.length === filteredData.length && filteredData.length > 0}
                                        onChange={handleToggleAll}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">수납 일자</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">원아명</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">적요 내용</th>
                                <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">입금 금액 (원비)</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {!isLoading && filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        새로 가져올 CMS 내역이 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map((t) => (
                                    <tr key={t.id} className="hover:bg-blue-50/50 transition-colors cursor-pointer" onClick={() => handleToggleSelect(t.id)}>
                                        <td className="px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(t.id)}
                                                onChange={() => handleToggleSelect(t.id)}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500 font-mono">
                                            {t.date}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-bold text-gray-800">
                                            {t.studentName}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                                            {t.description}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-bold text-blue-700 text-right">
                                            {t.amount.toLocaleString()} 원
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                        총 <span className="font-bold text-indigo-700">{selectedIds.length}</span>건의 CMS 입금 내역을 현금출납부로 전송합니다.
                    </p>
                    <div className="flex gap-2">
                        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                            닫기
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={selectedIds.length === 0 || isLoading}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
                        >
                            출납부 반영 ({selectedIds.length}건)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
