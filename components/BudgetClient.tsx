'use client';

import { useState } from 'react';
import { MOCK_BUDGET_ITEMS, BudgetItem } from '../lib/mockData';
import { Download, Plus, BarChart2, TrendingUp, TrendingDown, X, CheckCircle2 } from 'lucide-react';

type Tab = '본예산' | '추경예산' | '예산현황 및 통계' | '세입세출결산서' | '세입세출예산서' | '공시관련' | '설정';

export default function BudgetClient() {
    const [activeTab, setActiveTab] = useState<Tab>('예산현황 및 통계');
    const [budgetItems, setBudgetItems] = useState<BudgetItem[]>(MOCK_BUDGET_ITEMS);
    const [showEdit, setShowEdit] = useState<BudgetItem | null>(null);
    const [editBudget, setEditBudget] = useState('');
    const [showEdufine, setShowEdufine] = useState(false);
    const [notification, setNotification] = useState<string | null>(null);
    const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
    const [isTransferred, setIsTransferred] = useState(false); // 전송 상태 추가

    const showNotif = (msg: string) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 3000);
    };

    const filteredItems = budgetItems.filter(b => filterType === 'ALL' ? true : b.type === filterType);

    const totalBudgetIncome = budgetItems.filter(b => b.type === 'INCOME').reduce((a, b) => a + b.budgetAmount, 0);
    const totalExecutedIncome = budgetItems.filter(b => b.type === 'INCOME').reduce((a, b) => a + b.executedAmount, 0);
    const totalBudgetExpense = budgetItems.filter(b => b.type === 'EXPENSE').reduce((a, b) => a + b.budgetAmount, 0);
    const totalExecutedExpense = budgetItems.filter(b => b.type === 'EXPENSE').reduce((a, b) => a + b.executedAmount, 0);

    const handleSaveBudget = () => {
        if (!showEdit) return;
        const amt = parseInt(editBudget.replace(/,/g, ''));
        if (isNaN(amt)) { alert('올바른 금액을 입력하세요.'); return; }
        setBudgetItems(prev => prev.map(b =>
            b.id === showEdit.id ? { ...b, budgetAmount: amt, remainingAmount: amt - b.executedAmount } : b
        ));
        setShowEdit(null);
        showNotif('✅ 예산이 수정되었습니다!');
    };

    const execRate = (executed: number, budget: number) => {
        if (budget === 0) return 0;
        return Math.round((executed / budget) * 100);
    };

    const exportCSV = () => {
        const rows = [['코드', '구분', '항목명', '예산액', '집행액', '잔액', '집행률']];
        budgetItems.forEach(b => {
            rows.push([b.code, b.type === 'INCOME' ? '세입' : '세출', b.name,
            String(b.budgetAmount), String(b.executedAmount), String(b.remainingAmount),
            `${execRate(b.executedAmount, b.budgetAmount)}%`]);
        });
        const csv = rows.map(r => r.join(',')).join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = '예산결산_2026.csv'; a.click();
        URL.revokeObjectURL(url);
    };

    const tabs: Tab[] = ['본예산', '추경예산', '예산현황 및 통계', '세입세출결산서', '세입세출예산서', '공시관련', '설정'];

    const isMatch = totalBudgetIncome === totalBudgetExpense;

    return (
        <div className="space-y-4">
            {notification && (
                <div className="fixed top-5 right-5 z-50 bg-green-600 text-white px-5 py-3 rounded-lg shadow-xl flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />{notification}
                </div>
            )}

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">예산/결산 (본예산)</h1>
                    <p className="text-gray-500 mt-1 text-sm">2026학년도 예산서 작성 및 현황</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={exportCSV} className="border border-gray-300 flex items-center gap-2 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-all">
                        <Download className="w-4 h-4" />엑셀다운로드
                    </button>
                    <button onClick={() => setShowEdufine(true)} className="bg-indigo-600 flex items-center gap-2 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-all">
                        <Plus className="w-4 h-4" />에듀파인 업로드
                    </button>
                </div>
            </div>

            {/* 본예산 Dashboard */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <h3 className="text-lg font-bold text-gray-800 mb-3">학년도 [2026년 ▼] 본예산 작성 현황</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-center border-collapse">
                        <thead className="bg-[#eef4f9] text-[#003366] font-bold">
                            <tr>
                                <th className="border p-2">구분</th>
                                <th className="border p-2">세입예산</th>
                                <th className="border p-2">세출예산</th>
                                <th className="border p-2">일치여부</th>
                                <th className="border p-2">추출상태</th>
                                <th className="border p-2">전송상태</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border p-2 font-semibold">본예산</td>
                                <td className="border p-2 text-blue-600 font-bold">{totalBudgetIncome.toLocaleString()}</td>
                                <td className="border p-2 text-red-600 font-bold">{totalBudgetExpense.toLocaleString()}</td>
                                <td className={`border p-2 font-bold ${isMatch ? 'text-green-600' : 'text-orange-500'}`}>
                                    {isMatch ? '✅ 일치' : '❌ 불일치'}
                                </td>
                                <td className="border p-2 text-gray-600">생성완료</td>
                                <td className={`border p-2 font-bold ${isTransferred ? 'text-indigo-600' : 'text-gray-600'}`}>
                                    {isTransferred ? '전송완료' : '미전송'}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                {!isMatch && (
                    <div className="mt-3 text-sm text-red-600 bg-red-50 p-2 rounded">
                        ⚠️ 세입 예산과 세출 예산의 합계가 일치하지 않습니다. 일치해야 에듀파인에 전송할 수 있습니다.
                    </div>
                )}
            </div>

            {/* Tab Bar */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="flex border-b border-gray-200 bg-gray-50">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-5 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === tab
                                ? 'border-indigo-600 text-indigo-600 bg-white'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-white'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                    {/* Filter buttons */}
                    <div className="ml-auto flex items-center gap-1 px-3">
                        {(['ALL', 'INCOME', 'EXPENSE'] as const).map(f => (
                            <button key={f} onClick={() => setFilterType(f)}
                                className={`text-xs px-3 py-1 rounded-full transition-colors ${filterType === f ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                {f === 'ALL' ? '전체' : f === 'INCOME' ? '세입' : '세출'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                {['코드', '구분', '항목명', '예산액', '집행액', '잔액', '집행률', '집행률 Bar', '관리'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {filteredItems.map(b => {
                                const rate = execRate(b.executedAmount, b.budgetAmount);
                                const isOver = rate >= 90;
                                return (
                                    <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 font-mono text-gray-600">{b.code}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${b.type === 'INCOME' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                                                {b.type === 'INCOME' ? '세입' : '세출'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-medium text-gray-900">{b.name}</td>
                                        <td className="px-4 py-3 text-right font-semibold text-gray-700">{b.budgetAmount.toLocaleString()}</td>
                                        <td className={`px-4 py-3 text-right font-semibold ${b.type === 'INCOME' ? 'text-blue-600' : 'text-red-600'}`}>{b.executedAmount.toLocaleString()}</td>
                                        <td className={`px-4 py-3 text-right font-semibold ${b.remainingAmount < 0 ? 'text-red-700 bg-red-50' : 'text-green-600'}`}>{b.remainingAmount.toLocaleString()}</td>
                                        <td className={`px-4 py-3 text-center font-bold ${isOver ? 'text-red-600' : 'text-gray-700'}`}>{rate}%</td>
                                        <td className="px-4 py-3 w-32">
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full transition-all ${rate >= 100 ? 'bg-red-600' : rate >= 80 ? 'bg-orange-500' : 'bg-indigo-500'}`}
                                                    style={{ width: `${Math.min(rate, 100)}%` }}
                                                />
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => { setShowEdit(b); setEditBudget(b.budgetAmount.toLocaleString()); }}
                                                className="text-xs text-indigo-600 hover:underline"
                                            >수정</button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot className="bg-gray-100">
                            <tr>
                                <td colSpan={3} className="px-4 py-3 font-bold text-gray-700">합 계</td>
                                <td className="px-4 py-3 text-right font-bold text-gray-900">
                                    {filteredItems.reduce((a, b) => a + b.budgetAmount, 0).toLocaleString()}
                                </td>
                                <td className="px-4 py-3 text-right font-bold text-gray-900">
                                    {filteredItems.reduce((a, b) => a + b.executedAmount, 0).toLocaleString()}
                                </td>
                                <td className="px-4 py-3 text-right font-bold text-gray-900">
                                    {filteredItems.reduce((a, b) => a + b.remainingAmount, 0).toLocaleString()}
                                </td>
                                <td colSpan={3}></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* Edit Modal */}
            {showEdit && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-xl p-6 w-[380px] shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">예산 수정</h3>
                            <button onClick={() => setShowEdit(null)}><X className="w-5 h-5" /></button>
                        </div>
                        <div className="space-y-3">
                            <div className="bg-gray-50 rounded p-3 text-sm">
                                <div><strong>항목:</strong> {showEdit.name}</div>
                                <div><strong>집행액:</strong> {showEdit.executedAmount.toLocaleString()}원</div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">예산액 (원)</label>
                                <input
                                    value={editBudget}
                                    onChange={e => setEditBudget(e.target.value)}
                                    className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                            <button onClick={() => setShowEdit(null)} className="flex-1 border border-gray-300 rounded-lg py-2 text-sm hover:bg-gray-50">취소</button>
                            <button onClick={handleSaveBudget} className="flex-1 bg-indigo-600 text-white rounded-lg py-2 text-sm hover:bg-indigo-700">저장</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edufine Modal */}
            {showEdufine && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-xl p-6 w-[450px] shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">에듀파인 업로드</h3>
                            <button onClick={() => setShowEdufine(false)}><X className="w-5 h-5" /></button>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-[#eef4f9] p-3 rounded text-sm text-[#003366] mb-2 font-medium">
                                예산 항목을 에듀파인 시스템 규격에 맞춰 전송합니다.
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-semibold text-gray-700">업로드 대상</label>
                                <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none">
                                    <option>본예산</option>
                                    <option>1차 추경</option>
                                    <option>결산</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-semibold text-gray-700">업로드 방식</label>
                                <div className="flex items-center gap-4 mt-1">
                                    <label className="flex items-center gap-2 text-sm"><input type="radio" name="uploadType" defaultChecked className="text-indigo-600" /> ◉ 자동 (K에듀파인전송)</label>
                                    <label className="flex items-center gap-2 text-sm"><input type="radio" name="uploadType" className="text-indigo-600" /> ○ 수동 (파일)</label>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-semibold text-gray-700">인증서</label>
                                <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none">
                                    <option>출납원 인증서 (원장_김말숙_2026)</option>
                                    <option>기타 인증서</option>
                                </select>
                                <label className="flex items-center gap-2 text-sm mt-2 text-gray-600">
                                    <input type="checkbox" defaultChecked className="text-indigo-600 rounded" /> ✓ 원장 함께 처리
                                </label>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-6">
                            <button onClick={() => setShowEdufine(false)} className="flex-1 border border-gray-300 rounded-lg py-2.5 text-sm hover:bg-gray-50 font-medium">취소</button>
                            <button onClick={() => {
                                setShowEdufine(false);
                                setIsTransferred(true);

                                // 모의 에듀파인 전송 데이터 파일 생성 및 다운로드 로직
                                const edufineDataStr = `[EDUFINE TRANSFER DATA]\nDate: 2026-02-28\nStatus: SUCCESS\nIncome Total: ${totalBudgetIncome}\nExpense Total: ${totalBudgetExpense}\n-- END OF FILE --`;
                                const blob = new Blob([edufineDataStr], { type: 'text/plain;charset=utf-8;' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `edufine_transfer_${Date.now()}.txt`;
                                a.click();
                                URL.revokeObjectURL(url);

                                showNotif('에듀파인 전송용 파일이 생성되었으며, 상태가 전송완료로 변경되었습니다.');
                            }} className={`flex-1 text-white rounded-lg py-2.5 text-sm font-medium ${isMatch ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-400 cursor-not-allowed'}`} disabled={!isMatch}>
                                에듀파인 전송
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
