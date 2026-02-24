'use client';

import { useState } from 'react';
import { Search, Download, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';

type AccountCode = { id: string; code: string; name: string; type: string };
type Transaction = {
    id: string;
    type: 'INCOME' | 'EXPENSE';
    date: string;
    amount: number;
    description: string;
    status: string;
    accountCode: AccountCode;
    kindergarten?: { id: string; name: string };
    clientName?: string;
    bankName?: string;
    balance?: number;
    journaled?: boolean;
};

type TransactionClientProps = {
    initialTransactions: Transaction[];
    kindergartens: any[];
    accountCodes: AccountCode[];
};

export default function TransactionsClient({ initialTransactions, kindergartens, accountCodes }: TransactionClientProps) {
    const router = useRouter();
    const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
    const [searchYear, setSearchYear] = useState('2026');
    const [searchMonth, setSearchMonth] = useState('02');
    const [startDateInput, setStartDateInput] = useState('2026-02-01');
    const [endDateInput, setEndDateInput] = useState('2026-02-28');
    const [appliedStartDate, setAppliedStartDate] = useState('2026-02-01');
    const [appliedEndDate, setAppliedEndDate] = useState('2026-02-28');
    const [searchDesc, setSearchDesc] = useState('');
    const [filterType, setFilterType] = useState('전체');

    // Modal states
    const [showAccountImport, setShowAccountImport] = useState(false);
    const [showMultiJournal, setShowMultiJournal] = useState(false);
    const [showPrevMonth, setShowPrevMonth] = useState(false);
    const [showCloseMonth, setShowCloseMonth] = useState(false);
    const [showNewEntry, setShowNewEntry] = useState(false);
    const [journalTarget, setJournalTarget] = useState<Transaction | null>(null);

    // 새 기능 모달 상태
    const [showOverpayment, setShowOverpayment] = useState(false);
    const [showExcelUpload, setShowExcelUpload] = useState(false);
    const [showCmsImport, setShowCmsImport] = useState(false);
    const [showAccountStatus, setShowAccountStatus] = useState(false);
    const [showClientManagement, setShowClientManagement] = useState(false);

    // 거래처 임시 데이터
    const [clients, setClients] = useState([
        { id: 1, name: '교보문고', businessNumber: '123-45-67890' },
        { id: 2, name: '삼성물산', businessNumber: '987-65-43210' }
    ]);
    const [newClientName, setNewClientName] = useState('');

    // New entry form
    const [newEntry, setNewEntry] = useState({ type: 'INCOME', date: '2026-02-24', amount: '', description: '', accountCodeId: '' });

    const updateDateInputs = (y: string, m: string) => {
        const lastDay = new Date(Number(y), Number(m), 0).getDate();
        setStartDateInput(`${y}-${m}-01`);
        setEndDateInput(`${y}-${m}-${String(lastDay).padStart(2, '0')}`);
    };

    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const y = e.target.value;
        setSearchYear(y);
        updateDateInputs(y, searchMonth);
    };
    const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const m = e.target.value;
        setSearchMonth(m);
        updateDateInputs(searchYear, m);
    };
    const handleSearch = () => {
        setAppliedStartDate(startDateInput);
        setAppliedEndDate(endDateInput);
    };
    const handleReset = () => {
        const lastDay = new Date(Number(searchYear), Number(searchMonth), 0).getDate();
        const s = `${searchYear}-${searchMonth}-01`;
        const e = `${searchYear}-${searchMonth}-${String(lastDay).padStart(2, '0')}`;
        setStartDateInput(s); setEndDateInput(e);
        setAppliedStartDate(s); setAppliedEndDate(e);
        setSearchDesc('');
        setFilterType('전체');
    };

    const filteredTx = transactions.filter(t => {
        const d = new Date(t.date);
        if (appliedStartDate && d < new Date(appliedStartDate)) return false;
        if (appliedEndDate) { const end = new Date(appliedEndDate); end.setHours(23, 59, 59); if (d > end) return false; }
        if (searchDesc && !t.description.toLowerCase().includes(searchDesc.toLowerCase())) return false;
        if (filterType === '수입' && t.type !== 'INCOME') return false;
        if (filterType === '지출' && t.type !== 'EXPENSE') return false;
        return true;
    });

    const totalIncome = filteredTx.filter(t => t.type === 'INCOME').reduce((a, b) => a + b.amount, 0);
    const totalExpense = filteredTx.filter(t => t.type === 'EXPENSE').reduce((a, b) => a + b.amount, 0);

    const handleJournal = (tx: Transaction) => {
        setJournalTarget(tx);
    };

    const confirmJournal = (accountCodeId: string) => {
        if (!journalTarget) return;
        const ac = accountCodes.find(a => a.id === accountCodeId);
        setTransactions(prev => prev.map(t =>
            t.id === journalTarget.id ? { ...t, journaled: true, accountCode: ac || t.accountCode } : t
        ));
        setJournalTarget(null);
        alert('✅ 분개 완료되었습니다!');
    };

    const handleDelete = (id: string) => {
        if (!confirm('이 거래를 삭제하시겠습니까?')) return;
        setTransactions(prev => prev.filter(t => t.id !== id));
    };

    const handleAddEntry = () => {
        if (!newEntry.amount || !newEntry.description || !newEntry.accountCodeId) {
            alert('모든 필드를 입력해주세요.'); return;
        }
        const ac = accountCodes.find(a => a.id === newEntry.accountCodeId)!;
        const newTx: Transaction = {
            id: `t${Date.now()}`,
            type: newEntry.type as 'INCOME' | 'EXPENSE',
            date: newEntry.date,
            amount: parseInt(newEntry.amount),
            description: newEntry.description,
            status: 'PENDING',
            accountCode: ac,
            journaled: false,
        };
        setTransactions(prev => [newTx, ...prev]);
        setShowNewEntry(false);
        setNewEntry({ type: 'INCOME', date: '2026-02-24', amount: '', description: '', accountCodeId: '' });
        alert('✅ 거래가 수기입력 완료되었습니다!');
    };

    const handlePrevMonth = () => {
        const prevMonthTx = transactions
            .filter(t => t.date.startsWith('2026-01'))
            .map(t => ({ ...t, id: `copy_${t.id}`, date: t.date.replace('2026-01', '2026-02'), status: 'PENDING' as const, journaled: false }));
        if (prevMonthTx.length === 0) { alert('전월 자료가 없습니다.'); return; }
        setTransactions(prev => [...prevMonthTx, ...prev]);
        setShowPrevMonth(false);
        alert(`✅ 전월자료 ${prevMonthTx.length}건을 가져왔습니다!`);
    };

    const handleExcelDownload = () => {
        const rows = [['NO', '구분', '발의일자', '코드', '계정', '적요', '수입', '지출', '잔액', '분개']];
        filteredTx.forEach((t, i) => {
            rows.push([
                String(i + 1), t.type === 'INCOME' ? '수입' : '지출', t.date, t.accountCode.code,
                t.accountCode.name, t.description,
                t.type === 'INCOME' ? String(t.amount) : '0',
                t.type === 'EXPENSE' ? String(t.amount) : '0',
                String(t.balance || 0),
                t.journaled ? '완' : '미완',
            ]);
        });
        const csv = rows.map(r => r.join(',')).join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `현금출납부_${searchYear}${searchMonth}.csv`;
        a.click(); URL.revokeObjectURL(url);
    };

    return (
        <div className="flex flex-col h-full bg-white text-[12px] font-sans text-gray-800 p-2" style={{ minWidth: '1200px' }}>

            {/* Top Layout */}
            <div className="flex w-full mb-1 border border-[#0d7382]">
                {/* Left Panel: 회계진행 사항 */}
                <div className="w-[320px] flex flex-col border-r border-[#0d7382] shrink-0 bg-[#eef4f9]">
                    <div className="bg-[#b3d4e6] font-bold text-[#003366] px-2 py-1.5 border-b border-[#0d7382] text-[12px]">
                        ■ 회계진행 사항
                    </div>
                    <div className="p-2 space-y-2 flex-1">
                        <div className="flex items-center gap-1">
                            <span className="w-16 text-right font-bold pr-1">월 검색</span>
                            <select value={searchYear} onChange={handleYearChange} className="border border-gray-400 px-1 py-0.5 bg-white w-[70px] text-[12px]">
                                {['2025', '2026', '2027'].map(y => <option key={y} value={y}>{y}년</option>)}
                            </select>
                            <select value={searchMonth} onChange={handleMonthChange} className="border border-gray-400 px-1 py-0.5 bg-white w-[50px] text-[12px]">
                                {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(m => (
                                    <option key={m} value={m}>{Number(m)}월</option>
                                ))}
                            </select>
                            <button onClick={handleSearch} className="border border-gray-400 bg-gray-100 hover:bg-gray-200 px-2 py-0.5 ml-1">검색</button>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="w-16 text-right font-bold pr-1">기간 검색</span>
                            <input type="date" value={startDateInput} onChange={e => setStartDateInput(e.target.value)} className="border border-gray-400 px-1 py-0.5 bg-white w-[110px] text-center text-[11px]" />
                            <span>~</span>
                            <input type="date" value={endDateInput} onChange={e => setEndDateInput(e.target.value)} className="border border-gray-400 px-1 py-0.5 bg-white w-[110px] text-center text-[11px]" />
                            <button onClick={handleReset} className="border border-gray-400 bg-gray-100 hover:bg-gray-200 px-1 py-0.5 text-[11px]">초기화</button>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="w-16 text-right font-bold pr-1">적요검색</span>
                            <input type="text" value={searchDesc} onChange={e => setSearchDesc(e.target.value)} placeholder="적요 입력..." className="border border-gray-400 px-1 py-0.5 bg-white flex-1 text-[11px]" />
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="w-16 text-right font-bold pr-1">구분</span>
                            {['전체', '수입', '지출'].map(t => (
                                <button key={t} onClick={() => setFilterType(t)} className={`border px-2 py-0.5 text-[11px] ${filterType === t ? 'bg-[#005ba6] text-white border-[#005ba6]' : 'border-gray-400 bg-white hover:bg-gray-100'}`}>{t}</button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Panel: Tabs and Buttons */}
                <div className="flex-1 flex flex-col">
                    <div className="flex flex-wrap items-end bg-[#005ba6] pt-1 px-1 min-h-[32px]">
                        <div className="bg-white text-[#005ba6] font-bold px-4 py-1.5 border-t-2 border-l-2 border-r-2 border-white rounded-t-sm inline-flex items-center gap-1 cursor-default text-[12px]">
                            ■ 회계기능
                        </div>
                        <div onClick={() => alert('회계검증은 준비 중입니다.')} className="text-white hover:bg-[#004885] px-4 py-1.5 cursor-pointer font-medium inline-flex items-center gap-1 text-[12px]">■ 회계검증</div>
                        <div onClick={() => router.push('/dashboard/budget')} className="text-white hover:bg-[#004885] px-4 py-1.5 cursor-pointer font-medium inline-flex items-center gap-1 text-[12px]">예산/결산</div>
                        <div onClick={() => router.push('/dashboard/hr')} className="text-white hover:bg-[#004885] px-4 py-1.5 cursor-pointer font-medium inline-flex items-center gap-1 text-[12px]">인사관리</div>
                        <div onClick={() => alert('노무관리는 인사관리 모듈과 통합 구현중입니다.')} className="text-white hover:bg-[#004885] px-4 py-1.5 cursor-pointer font-medium inline-flex items-center gap-1 text-[12px]">노무관리</div>
                        <div onClick={() => router.push('/dashboard/settings')} className="text-white hover:bg-[#004885] px-4 py-1.5 cursor-pointer font-medium inline-flex items-center gap-1 text-[12px]">설정</div>
                        <div onClick={() => alert('e키즈빌CMS 연동은 준비 중입니다.')} className="text-yellow-300 hover:bg-[#004885] px-4 py-1.5 cursor-pointer font-bold inline-flex items-center gap-1 ml-4 italic text-[12px]">e키즈빌CMS</div>
                    </div>

                    <div className="p-2 bg-[#f8f9fa] flex flex-col gap-1">
                        <div className="flex gap-1 flex-wrap">
                            <button onClick={() => setShowAccountImport(true)} className="border border-gray-400 bg-white hover:bg-blue-50 px-2 py-1 font-medium min-w-[90px] text-[12px]">계좌가져오기</button>
                            <button onClick={() => setShowMultiJournal(true)} className="border border-gray-400 bg-white hover:bg-blue-50 px-2 py-1 font-medium min-w-[80px] text-[12px]">다중분개</button>
                            <button onClick={() => setShowOverpayment(true)} className="border border-gray-400 bg-white hover:bg-blue-50 px-2 py-1 font-medium min-w-[80px] text-[12px]">과오납적용</button>
                            <button onClick={() => setShowNewEntry(true)} className="border border-gray-400 bg-white hover:bg-blue-50 px-2 py-1 font-medium min-w-[70px] text-[12px]">수기입력</button>
                            <button onClick={() => setShowCloseMonth(true)} className="border border-gray-400 bg-white hover:bg-blue-50 px-2 py-1 font-medium min-w-[90px] text-[12px]">입력마감하기</button>
                            <button onClick={() => setShowExcelUpload(true)} className="border border-gray-400 bg-white hover:bg-blue-50 px-2 py-1 font-medium min-w-[80px] text-[12px]">엑셀업로드</button>
                            <button onClick={() => setShowCmsImport(true)} className="border border-gray-400 bg-white hover:bg-blue-50 px-2 py-1 font-medium min-w-[90px] text-[12px]">CMS가져오기</button>
                            <button onClick={handleExcelDownload} className="border border-green-500 bg-green-50 text-green-800 hover:bg-green-100 px-2 py-1 font-bold min-w-[90px] text-center ml-auto text-[12px] flex items-center gap-1">
                                <Download className="w-3 h-3" />엑셀다운
                            </button>
                        </div>
                        <div className="flex gap-1 flex-wrap">
                            <button onClick={() => setShowAccountStatus(true)} className="border border-gray-400 bg-white hover:bg-blue-50 px-2 py-1 font-medium min-w-[90px] text-[12px]">계좌현황보기</button>
                            <button onClick={() => alert('준비 중인 기능입니다.')} className="border border-gray-400 bg-white hover:bg-blue-50 px-2 py-1 font-medium min-w-[80px] text-[12px]">관항목조정</button>
                            <button onClick={() => alert('준비 중인 기능입니다.')} className="border border-gray-400 bg-white hover:bg-blue-50 px-2 py-1 font-medium min-w-[80px] text-[12px]">과오납해제</button>
                            <button onClick={() => setShowClientManagement(true)} className="border border-gray-400 bg-white hover:bg-blue-50 px-2 py-1 font-medium min-w-[80px] text-[12px]">거래처관리</button>
                            <button onClick={() => alert('준비 중인 기능입니다.')} className="border border-gray-400 bg-white hover:bg-blue-50 px-2 py-1 font-medium min-w-[70px] text-[12px]">조정마감</button>
                            <button onClick={() => setShowPrevMonth(true)} className="border border-indigo-400 bg-indigo-50 text-indigo-800 hover:bg-indigo-100 px-2 py-1 font-medium min-w-[100px] text-[12px]">전월자료가져오기</button>
                            <button onClick={() => alert('준비 중인 기능입니다.')} className="border border-gray-400 bg-white hover:bg-blue-50 px-2 py-1 font-medium min-w-[80px] text-[12px]">거래처조정</button>
                            <button onClick={() => { if (confirm('전체 삭제하시겠습니까?')) setTransactions([]); }} className="border border-orange-500 bg-[#ffe5cc] text-orange-800 hover:bg-orange-200 px-2 py-1 font-bold min-w-[70px] text-center ml-auto text-[12px]">전체삭제</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="flex-1 overflow-auto border-t-2 border-b-2 border-[#00a9ba]">
                <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
                    <thead className="bg-[#00a9ba] text-white sticky top-0 z-10">
                        <tr>
                            <th className="border-r border-b border-[#0d7382] w-[30px] p-1 text-center font-normal"><input type="checkbox" className="w-[11px] h-[11px]" /></th>
                            <th className="border-r border-b border-[#0d7382] w-[35px] p-1 text-center font-normal">NO</th>
                            <th className="border-r border-b border-[#0d7382] w-[50px] p-1 text-center font-normal">구분</th>
                            <th className="border-r border-b border-[#0d7382] w-[80px] p-1 text-center font-normal">발의일자</th>
                            <th className="border-r border-b border-[#0d7382] w-[80px] p-1 text-center font-normal">거래일자</th>
                            <th className="border-r border-b border-[#0d7382] w-[45px] p-1 text-center font-normal">코드</th>
                            <th className="border-r border-b border-[#0d7382] w-[100px] p-1 text-center font-normal">계정</th>
                            <th className="border-r border-b border-[#0d7382] w-[40px] p-1 text-center font-normal">과세</th>
                            <th className="border-r border-b border-[#0d7382] min-w-[150px] p-1 text-center font-normal">적요</th>
                            <th className="border-r border-b border-[#0d7382] w-[90px] p-1 text-center font-normal">수입</th>
                            <th className="border-r border-b border-[#0d7382] w-[90px] p-1 text-center font-normal">지출</th>
                            <th className="border-r border-b border-[#0d7382] w-[100px] p-1 text-center font-normal">잔액</th>
                            <th className="border-r border-b border-[#0d7382] w-[80px] p-1 text-center font-normal">거래처</th>
                            <th className="border-r border-b border-[#0d7382] w-[50px] p-1 text-center font-normal">전송</th>
                            <th className="border-r border-b border-[#0d7382] w-[45px] p-1 text-center font-normal">분개</th>
                            <th className="border-r border-b border-[#0d7382] w-[40px] p-1 text-center font-normal">삭제</th>
                        </tr>
                        {/* Filter Row */}
                        <tr className="bg-[#e4eff1] text-gray-800 border-b border-[#0d7382]">
                            <th className="border-r border-gray-300 p-0 text-center font-normal text-rose-600 bg-[#fceceb]">0</th>
                            <th className="border-r border-gray-300 p-1 text-center font-normal bg-white text-[10px] text-gray-500">↻</th>
                            <th className="border-r border-gray-300 p-0 font-normal bg-white">
                                <select className="w-full text-[11px] border-0 bg-transparent focus:outline-none">
                                    <option>전체</option><option>수입</option><option>지출</option>
                                </select>
                            </th>
                            <th className="border-r border-gray-300 p-0 bg-gray-100 font-normal" colSpan={2}></th>
                            <th className="border-r border-gray-300 p-0 bg-gray-100 font-normal"></th>
                            <th className="border-r border-gray-300 p-0 bg-white font-normal">
                                <select className="w-full text-[11px] border-0 bg-transparent focus:outline-none text-red-500">
                                    <option>목선택</option>
                                    {accountCodes.map(ac => <option key={ac.id} value={ac.id}>{ac.name}</option>)}
                                </select>
                            </th>
                            <th className="border-r border-gray-300 p-0 bg-gray-100 font-normal"></th>
                            <th className="border-r border-gray-300 p-0 bg-white font-normal">
                                <input type="text" placeholder="적요 검색" value={searchDesc} onChange={e => setSearchDesc(e.target.value)} className="w-full text-[11px] border-0 bg-transparent focus:outline-none placeholder-gray-400 px-1" />
                            </th>
                            <th className="border-r border-gray-300 p-0 bg-gray-100 font-normal" colSpan={3}></th>
                            <th className="border-r border-gray-300 p-0 bg-gray-100 font-normal"></th>
                            <th className="border-r border-gray-300 p-0 bg-gray-100 font-normal"></th>
                            <th className="border-r border-gray-300 p-0 bg-[#e6f2eb] font-normal">
                                <div onClick={handleSearch} className="bg-[#339933] text-white text-[10px] m-0.5 rounded-[2px] cursor-pointer text-center py-0.5">검색</div>
                            </th>
                            <th className="border-r border-gray-300 p-0 bg-gray-100 font-normal"></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        {filteredTx.map((t, idx) => (
                            <tr key={t.id} className="hover:bg-blue-50 border-b border-gray-100">
                                <td className="border-r border-gray-200 p-0.5 text-center"><input type="checkbox" className="w-[11px] h-[11px]" /></td>
                                <td className="border-r border-gray-200 p-0.5 text-center text-gray-600">{idx + 1}</td>
                                <td className={`border-r border-gray-200 p-0.5 text-center font-bold ${t.type === 'INCOME' ? 'text-blue-600' : 'text-red-600'}`}>
                                    {t.type === 'INCOME' ? '수입' : '지출'}
                                </td>
                                <td className="border-r border-gray-200 p-0.5 text-center text-gray-600 text-[11px]">{t.date}</td>
                                <td className="border-r border-gray-200 p-0.5 text-center text-gray-600 text-[11px]">{t.date}</td>
                                <td className="border-r border-gray-200 p-0.5 text-center text-gray-600">{t.accountCode?.code}</td>
                                <td className={`border-r border-gray-200 p-0.5 text-left px-1 ${t.journaled ? 'text-gray-700' : 'text-red-500'}`}>{t.accountCode?.name || '미정'}</td>
                                <td className="border-r border-gray-200 p-0.5 text-center"><input type="checkbox" className="w-[11px] h-[11px]" /></td>
                                <td className="border-r border-gray-200 p-0.5 text-left truncate px-1">{t.description}</td>
                                <td className="border-r border-gray-200 p-0.5 text-right text-blue-600 pr-2">
                                    {t.type === 'INCOME' ? t.amount.toLocaleString() : ''}
                                </td>
                                <td className="border-r border-gray-200 p-0.5 text-right text-red-600 pr-2">
                                    {t.type === 'EXPENSE' ? t.amount.toLocaleString() : ''}
                                </td>
                                <td className="border-r border-gray-200 p-0.5 text-right text-gray-700 pr-2 font-medium">
                                    {t.balance ? t.balance.toLocaleString() : '-'}
                                </td>
                                <td className="border-r border-gray-200 p-0.5 text-left truncate px-1 text-[11px] text-gray-500">{t.clientName || '-'}</td>
                                <td className="border-r border-gray-200 p-0.5 text-center">
                                    {t.status === 'TRANSMITTED' && <span className="bg-green-500 text-white text-[10px] px-1 py-0.5 rounded-[2px]">완</span>}
                                    {t.status === 'PENDING' && <span className="bg-gray-400 text-white text-[10px] px-1 py-0.5 rounded-[2px]">대기</span>}
                                </td>
                                <td className="border-r border-gray-200 p-0.5 text-center">
                                    {t.journaled
                                        ? <button className="bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded-[2px]">완</button>
                                        : <button onClick={() => handleJournal(t)} className="bg-[#2c98b6] text-white text-[10px] px-1.5 py-0.5 rounded-[2px] hover:bg-[#1a7a96]">분개</button>
                                    }
                                </td>
                                <td className="border-r border-gray-200 p-0.5 text-center">
                                    <button onClick={() => handleDelete(t.id)} className="bg-[#e45b6c] text-white text-[10px] px-1 py-0.5 rounded-[2px] hover:bg-red-600">×</button>
                                </td>
                            </tr>
                        ))}
                        {/* Empty rows */}
                        {Array.from({ length: Math.max(0, 10 - filteredTx.length) }).map((_, i) => (
                            <tr key={`e${i}`} className="border-b border-gray-50">
                                {Array.from({ length: 16 }).map((_, j) => (
                                    <td key={j} className="border-r border-gray-100 p-0.5 h-6"></td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Bottom Summary */}
            <div className="bg-[#e9ecef] border border-gray-400 p-1 flex items-center justify-between mt-1">
                <span className="text-[12px] pl-2">※ 통장 잔액과 일치하는지 확인하시기 바랍니다. | 조회 건수: {filteredTx.length}건</span>
                <div className="flex bg-white border border-gray-400 h-10 w-[560px] text-[12px]">
                    <div className="flex-1 flex flex-col border-r border-gray-300">
                        <div className="bg-[#66b3e6] text-white text-center font-bold text-[11px] py-0.5 border-b border-gray-300">수 입</div>
                        <div className="flex-1 flex items-center justify-end px-2 text-blue-600 font-bold bg-[#eff5f9]">{totalIncome.toLocaleString()}</div>
                    </div>
                    <div className="flex-1 flex flex-col border-r border-gray-300">
                        <div className="bg-[#ff8c69] text-white text-center font-bold text-[11px] py-0.5 border-b border-gray-300">지 출</div>
                        <div className="flex-1 flex items-center justify-end px-2 text-red-600 font-bold bg-[#fcf0ed]">{totalExpense.toLocaleString()}</div>
                    </div>
                    <div className="flex-1 flex flex-col border-r border-gray-300">
                        <div className="bg-[#5a6268] text-white text-center font-bold text-[11px] py-0.5 border-b border-gray-300">잔 액</div>
                        <div className="flex-1 flex items-center justify-end px-2 font-bold bg-[#eeeeee]">{(totalIncome - totalExpense).toLocaleString()}</div>
                    </div>
                    <div className="w-[140px] flex flex-col">
                        <div className="bg-[#dcdcdc] text-gray-700 text-center font-bold text-[11px] py-0.5 border-b border-gray-300">검 증</div>
                        <div className="flex-1 flex items-center justify-center p-1 bg-[#f5f5f5]">
                            <button onClick={() => alert('✅ 현금출납부 잔액과 통장 잔액이 일치합니다!\n(목업 확인)')} className="border border-red-500 text-red-500 font-bold text-[10px] w-full h-full hover:bg-red-50">현금출납부-통장 잔액 확인</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* === MODALS === */}

            {/* Journal Modal */}
            {journalTarget && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-xl p-5 w-[420px] shadow-2xl">
                        <h3 className="font-bold text-base mb-3">■ 분개 처리</h3>
                        <div className="bg-gray-50 rounded p-3 mb-3 text-[12px]">
                            <div><strong>적요:</strong> {journalTarget.description}</div>
                            <div><strong>금액:</strong> {journalTarget.amount.toLocaleString()}원</div>
                            <div><strong>현재 계정:</strong> {journalTarget.accountCode?.name || '미정'}</div>
                        </div>
                        <div className="mb-3">
                            <label className="text-[12px] font-medium text-gray-700">계정과목 선택</label>
                            <select id="journal-select" className="w-full mt-1 border border-gray-300 rounded px-2 py-1.5 text-[12px]">
                                {accountCodes.map(ac => (
                                    <option key={ac.id} value={ac.id}>{ac.code} - {ac.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setJournalTarget(null)} className="flex-1 border border-gray-300 rounded py-1.5 text-[12px] hover:bg-gray-50">취소</button>
                            <button onClick={() => {
                                const sel = (document.getElementById('journal-select') as HTMLSelectElement)?.value;
                                confirmJournal(sel);
                            }} className="flex-1 bg-indigo-600 text-white rounded py-1.5 text-[12px] hover:bg-indigo-700">분개 완료</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Account Import Modal */}
            {showAccountImport && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-xl p-5 w-[500px] shadow-2xl">
                        <h3 className="font-bold text-base mb-3 text-[#005ba6]">■ 계좌가져오기</h3>
                        <div className="bg-[#b3d4e6]/30 rounded p-3 mb-3 text-[12px] border border-[#b3d4e6]">
                            은행 계좌 현황에서 거래 내역을 현금출납부로 가져옵니다.
                        </div>
                        <table className="w-full text-[12px] border border-gray-200 mb-3">
                            <thead className="bg-[#b3d4e6] text-[#003366]">
                                <tr>
                                    <th className="p-1.5 text-left border-r border-gray-200">은행명</th>
                                    <th className="p-1.5 text-center border-r border-gray-200">자료복구</th>
                                    <th className="p-1.5 text-center">계좌번호</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-t border-gray-200">
                                    <td className="p-1.5 border-r border-gray-200">농협중앙회</td>
                                    <td className="p-1.5 border-r border-gray-200 text-center">
                                        <button onClick={() => { alert('✅ 2월 전체 거래내역 복구 완료! (목업)'); }} className="bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded">2월 전체복구</button>
                                    </td>
                                    <td className="p-1.5 text-center font-mono text-[11px]">352-0611-****-**</td>
                                </tr>
                                <tr className="border-t border-gray-200">
                                    <td className="p-1.5 border-r border-gray-200">국민은행</td>
                                    <td className="p-1.5 border-r border-gray-200 text-center">
                                        <button onClick={() => { alert('✅ 2월 전체 거래내역 복구 완료! (목업)'); }} className="bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded">2월 전체복구</button>
                                    </td>
                                    <td className="p-1.5 text-center font-mono text-[11px]">123-456-***-***</td>
                                </tr>
                            </tbody>
                        </table>
                        <div className="flex gap-2">
                            <button onClick={() => setShowAccountImport(false)} className="flex-1 border border-gray-300 rounded py-1.5 text-[12px] hover:bg-gray-50">닫기</button>
                            <button onClick={() => {
                                alert('✅ 즉시조회 완료! 최신 거래내역이 반영됩니다. (목업)');
                                setShowAccountImport(false);
                            }} className="flex-1 bg-indigo-600 text-white rounded py-1.5 text-[12px] hover:bg-indigo-700">즉시조회</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Multi Journal Modal */}
            {showMultiJournal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-xl p-5 w-[550px] shadow-2xl">
                        <h3 className="font-bold text-base mb-3 text-[#005ba6]">■ 수입 다중분개</h3>
                        <p className="text-[12px] text-gray-600 mb-3">하나의 거래를 여러 계정으로 분할하여 기록합니다.</p>
                        <div className="bg-gray-50 rounded p-2 mb-3 text-[12px]">
                            <div className="flex justify-between"><span>원금액:</span><strong>850,000원</strong></div>
                        </div>
                        <table className="w-full text-[12px] border border-gray-200 mb-3">
                            <thead className="bg-[#00a9ba] text-white">
                                <tr>
                                    <th className="p-1.5 text-center border-r border-white/30">계정과목</th>
                                    <th className="p-1.5 text-center border-r border-white/30">금액</th>
                                    <th className="p-1.5 text-center">적요</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { ac: '원비 수입', amt: '700,000', memo: '수업료' },
                                    { ac: '급식비 수입', amt: '100,000', memo: '급식비' },
                                    { ac: '특별활동비 수입', amt: '50,000', memo: '특별활동비' },
                                ].map((row, i) => (
                                    <tr key={i} className="border-t border-gray-200">
                                        <td className="p-1 border-r border-gray-200">
                                            <select className="w-full border-0 bg-transparent text-[11px]" defaultValue={row.ac}>
                                                {accountCodes.filter(ac => ac.type === 'INCOME').map(ac => (
                                                    <option key={ac.id} value={ac.name}>{ac.name}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="p-1 border-r border-gray-200">
                                            <input defaultValue={row.amt} className="w-full border-0 bg-transparent text-right text-[11px]" />
                                        </td>
                                        <td className="p-1">
                                            <input defaultValue={row.memo} className="w-full border-0 bg-transparent text-[11px]" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="bg-gray-50 border-t border-gray-200">
                                    <td className="p-1.5 font-bold text-right border-r border-gray-200">합계</td>
                                    <td className="p-1.5 font-bold text-right border-r border-gray-200 text-blue-600">850,000원</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                        <div className="flex gap-2">
                            <button onClick={() => setShowMultiJournal(false)} className="flex-1 border border-gray-300 rounded py-1.5 text-[12px] hover:bg-gray-50">취소</button>
                            <button onClick={() => { alert('✅ 다중분개 저장 완료!'); setShowMultiJournal(false); }} className="flex-1 bg-indigo-600 text-white rounded py-1.5 text-[12px] hover:bg-indigo-700">저장</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Overpayment Modal */}
            {showOverpayment && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
                    <div className="bg-white rounded p-4 text-center w-[300px]">
                        <h3 className="font-bold mb-4">과오납 처리</h3>
                        <p className="text-gray-600 text-sm mb-4">선택된 건에 대해 과오납 처리를 진행하시겠습니까?</p>
                        <div className="flex gap-2 justify-center">
                            <button onClick={() => setShowOverpayment(false)} className="px-4 py-1 border bg-gray-100 hover:bg-gray-200">취소</button>
                            <button onClick={() => {
                                alert('과오납 처리가 완료되었습니다.');
                                setShowOverpayment(false);
                            }} className="px-4 py-1 border bg-red-600 text-white hover:bg-red-700">적용</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Excel Upload Modal */}
            {showExcelUpload && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
                    <div className="bg-white rounded p-6 shadow-xl w-[400px]">
                        <h3 className="font-bold mb-4 text-lg">엑셀 업로드</h3>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50 mb-4 h-[100px] flex items-center justify-center cursor-pointer hover:bg-gray-100">
                            <span className="text-gray-500 font-medium whitespace-pre-wrap text-sm">여기를 클릭하여 엑셀 파일을 업로드하세요.</span>
                        </div>
                        <div className="flex gap-2 justify-end mt-4">
                            <button onClick={() => setShowExcelUpload(false)} className="px-4 py-2 border rounded hover:bg-gray-100">취소</button>
                            <button onClick={() => {
                                const newTx = { id: Date.now().toString(), type: 'INCOME', date: '2026-02-28', amount: 500000, description: '엑셀업로드 수입(모의)', status: 'NORMAL', accountCode: accountCodes[0], journaled: false };
                                setTransactions(prev => [...prev, newTx]);
                                alert('엑셀 데이터가 성공적으로 처리되었습니다.');
                                setShowExcelUpload(false);
                            }} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-bold">
                                업로드 실행
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CMS Import Modal */}
            {showCmsImport && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
                    <div className="bg-white rounded p-5 shadow-xl w-[350px]">
                        <h3 className="font-bold mb-4">CMS 자료 가져오기</h3>
                        <p className="text-sm text-gray-600 mb-6">e키즈빌 CMS 서버에서 최신 결제/승인 내역을 가져옵니다. 진행할까요?</p>
                        <div className="flex gap-2 justify-end">
                            <button onClick={() => setShowCmsImport(false)} className="px-4 py-2 border rounded text-sm hover:bg-gray-100">닫기</button>
                            <button onClick={() => {
                                const newTx = { id: Date.now().toString(), type: 'INCOME', date: '2026-02-28', amount: 120000, description: 'CMS 승인건(모의)', status: 'NORMAL', accountCode: accountCodes[0], journaled: false, clientName: 'CMS결제' };
                                setTransactions(prev => [...prev, newTx]);
                                alert('CMS 자료를 성공적으로 불러왔습니다.');
                                setShowCmsImport(false);
                            }} className="px-4 py-2 bg-[#005ba6] text-white text-sm rounded hover:bg-blue-700 font-bold">
                                가져오기 시작
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Account Status Modal */}
            {showAccountStatus && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
                    <div className="bg-white rounded p-5 shadow-xl w-[500px]">
                        <div className="flex justify-between items-center mb-4 border-b pb-2">
                            <h3 className="font-bold text-[#005ba6]">계좌 현황 뷰어</h3>
                            <button onClick={() => setShowAccountStatus(false)} className="text-gray-500 hover:text-gray-800">✖</button>
                        </div>
                        <table className="w-full text-sm border">
                            <thead className="bg-gray-100">
                                <tr><th className="border p-2">은행명</th><th className="border p-2">계좌번호</th><th className="border p-2">잔액 (원)</th></tr>
                            </thead>
                            <tbody>
                                <tr><td className="border p-2 text-center">농협은행</td><td className="border p-2 text-center">123-4567-8901-23</td><td className="border p-2 text-right font-bold text-blue-600">8,500,000</td></tr>
                                <tr><td className="border p-2 text-center">신한은행</td><td className="border p-2 text-center">110-123-456789</td><td className="border p-2 text-right font-bold text-blue-600">12,400,000</td></tr>
                            </tbody>
                        </table>
                        <div className="text-right mt-4">
                            <button onClick={() => setShowAccountStatus(false)} className="px-4 py-2 bg-gray-200 rounded text-sm hover:bg-gray-300">닫기</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Client Management Modal */}
            {showClientManagement && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
                    <div className="bg-white rounded p-5 shadow-xl w-[500px]">
                        <div className="flex justify-between items-center mb-4 border-b pb-2">
                            <h3 className="font-bold text-[#005ba6]">거래처 관리</h3>
                            <button onClick={() => setShowClientManagement(false)} className="text-gray-500 hover:text-gray-800">✖</button>
                        </div>
                        <div className="flex gap-2 mb-4">
                            <input type="text" value={newClientName} onChange={e => setNewClientName(e.target.value)} placeholder="신규 거래처명" className="flex-1 border p-1.5 text-sm" />
                            <button onClick={() => {
                                if (newClientName) {
                                    setClients([...clients, { id: Date.now(), name: newClientName, businessNumber: '000-00-00000' }]);
                                    setNewClientName('');
                                }
                            }} className="bg-[#005ba6] text-white px-3 py-1.5 text-sm rounded">추가</button>
                        </div>
                        <table className="w-full text-sm border">
                            <thead className="bg-gray-100">
                                <tr><th className="border p-2 w-[50px]">ID</th><th className="border p-2">거래처명</th><th className="border p-2 w-[120px]">사업자번호</th><th className="border p-2 w-[60px]">비고</th></tr>
                            </thead>
                            <tbody>
                                {clients.map(c => (
                                    <tr key={c.id}>
                                        <td className="border p-2 text-center">{c.id}</td>
                                        <td className="border p-2 pl-3 font-medium">{c.name}</td>
                                        <td className="border p-2 text-center text-gray-600">{c.businessNumber}</td>
                                        <td className="border p-2 text-center">
                                            <button onClick={() => setClients(clients.filter(client => client.id !== c.id))} className="text-red-600 hover:underline text-xs">삭제</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="text-right mt-4">
                            <button onClick={() => setShowClientManagement(false)} className="px-4 py-2 bg-gray-200 rounded text-sm hover:bg-gray-300">확인완료</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Prev Month Modal */}
            {showPrevMonth && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-xl p-5 w-[400px] shadow-2xl">
                        <h3 className="font-bold text-base mb-3 text-[#005ba6]">■ 전월자료 가져오기</h3>
                        <p className="text-[12px] text-gray-600 mb-4">
                            2026년 1월 자료를 2026년 2월로 복사합니다.<br />
                            <span className="text-orange-600">※ 기존 2월 자료와 중복될 수 있습니다.</span>
                        </p>
                        <div className="bg-amber-50 rounded p-3 text-[12px] border border-amber-200 mb-4">
                            <strong>복사 대상:</strong> 2026년 1월 거래 2건
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setShowPrevMonth(false)} className="flex-1 border border-gray-300 rounded py-1.5 text-[12px] hover:bg-gray-50">취소</button>
                            <button onClick={handlePrevMonth} className="flex-1 bg-indigo-600 text-white rounded py-1.5 text-[12px] hover:bg-indigo-700">전월자료 가져오기</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Close Month Modal */}
            {showCloseMonth && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-xl p-5 w-[380px] shadow-2xl">
                        <h3 className="font-bold text-base mb-3 text-[#005ba6]">■ 입력마감하기</h3>
                        <p className="text-[12px] text-gray-600 mb-4">
                            2026년 2월 현금출납부를 마감합니다.<br />
                            <span className="text-red-600">마감 후에는 추가 입력이 불가합니다.</span>
                        </p>
                        <div className="bg-red-50 rounded p-3 text-[12px] border border-red-200 mb-4">
                            <strong>미전송 건수:</strong> {transactions.filter(t => t.status === 'PENDING').length}건이 남아있습니다.
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setShowCloseMonth(false)} className="flex-1 border border-gray-300 rounded py-1.5 text-[12px] hover:bg-gray-50">취소</button>
                            <button onClick={() => { alert('✅ 2026년 2월 현금출납부가 마감되었습니다!'); setShowCloseMonth(false); }} className="flex-1 bg-red-600 text-white rounded py-1.5 text-[12px] hover:bg-red-700">마감 확인</button>
                        </div>
                    </div>
                </div>
            )}

            {/* New Entry Modal */}
            {showNewEntry && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-xl p-5 w-[420px] shadow-2xl">
                        <h3 className="font-bold text-base mb-3 text-[#005ba6]">■ 수기입력</h3>
                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <label className="text-[12px] font-medium">구분</label>
                                    <select value={newEntry.type} onChange={e => setNewEntry(f => ({ ...f, type: e.target.value }))} className="w-full mt-1 border border-gray-300 rounded px-2 py-1.5 text-[12px]">
                                        <option value="INCOME">수입</option>
                                        <option value="EXPENSE">지출</option>
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label className="text-[12px] font-medium">날짜</label>
                                    <input type="date" value={newEntry.date} onChange={e => setNewEntry(f => ({ ...f, date: e.target.value }))} className="w-full mt-1 border border-gray-300 rounded px-2 py-1.5 text-[12px]" />
                                </div>
                            </div>
                            <div>
                                <label className="text-[12px] font-medium">계정과목</label>
                                <select value={newEntry.accountCodeId} onChange={e => setNewEntry(f => ({ ...f, accountCodeId: e.target.value }))} className="w-full mt-1 border border-gray-300 rounded px-2 py-1.5 text-[12px]">
                                    <option value="">선택하세요</option>
                                    {accountCodes.filter(ac => ac.type === newEntry.type).map(ac => (
                                        <option key={ac.id} value={ac.id}>{ac.code} - {ac.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-[12px] font-medium">금액</label>
                                <input type="number" value={newEntry.amount} onChange={e => setNewEntry(f => ({ ...f, amount: e.target.value }))} placeholder="원 단위 입력" className="w-full mt-1 border border-gray-300 rounded px-2 py-1.5 text-[12px]" />
                            </div>
                            <div>
                                <label className="text-[12px] font-medium">적요 (내용)</label>
                                <input value={newEntry.description} onChange={e => setNewEntry(f => ({ ...f, description: e.target.value }))} placeholder="거래 내용을 입력하세요" className="w-full mt-1 border border-gray-300 rounded px-2 py-1.5 text-[12px]" />
                            </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                            <button onClick={() => setShowNewEntry(false)} className="flex-1 border border-gray-300 rounded py-1.5 text-[12px] hover:bg-gray-50">취소</button>
                            <button onClick={handleAddEntry} className="flex-1 bg-indigo-600 text-white rounded py-1.5 text-[12px] hover:bg-indigo-700">저장</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
