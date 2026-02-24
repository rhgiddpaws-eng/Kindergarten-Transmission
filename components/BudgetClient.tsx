'use client';

import { useState } from 'react';
import { MOCK_BUDGET_ITEMS, BudgetItem } from '../lib/mockData';
import { Download, Plus, BarChart2, TrendingUp, TrendingDown, X, CheckCircle2 } from 'lucide-react';

type Tab = '예산현황' | '세출예산' | '세입예산' | '예산편성' | '결산';

export default function BudgetClient() {
    const [activeTab, setActiveTab] = useState<Tab>('예산현황');
    const [budgetItems, setBudgetItems] = useState<BudgetItem[]>(MOCK_BUDGET_ITEMS);
    const [showEdit, setShowEdit] = useState<BudgetItem | null>(null);
    const [editBudget, setEditBudget] = useState('');
    const [notification, setNotification] = useState<string | null>(null);
    const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');

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

    const tabs: Tab[] = ['예산현황', '세출예산', '세입예산', '예산편성', '결산'];

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
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">예산/결산</h1>
                    <p className="text-gray-500 mt-1 text-sm">2026년도 예산 현황 및 집행 내역</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={exportCSV} className="border border-gray-300 flex items-center gap-2 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-all">
                        <Download className="w-4 h-4" />엑셀다운로드
                    </button>
                    <button className="bg-indigo-600 flex items-center gap-2 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-all">
                        <Plus className="w-4 h-4" />예산 추가
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-gray-500">세입 예산</span>
                    </div>
                    <div className="text-xl font-bold text-blue-600">{totalBudgetIncome.toLocaleString()}</div>
                    <div className="text-xs text-gray-400 mt-1">집행: {totalExecutedIncome.toLocaleString()}</div>
                    <div className="mt-2 w-full bg-blue-100 rounded-full h-1.5">
                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${execRate(totalExecutedIncome, totalBudgetIncome)}%` }} />
                    </div>
                    <div className="text-xs text-blue-600 mt-1">{execRate(totalExecutedIncome, totalBudgetIncome)}% 집행</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingDown className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-gray-500">세출 예산</span>
                    </div>
                    <div className="text-xl font-bold text-red-600">{totalBudgetExpense.toLocaleString()}</div>
                    <div className="text-xs text-gray-400 mt-1">집행: {totalExecutedExpense.toLocaleString()}</div>
                    <div className="mt-2 w-full bg-red-100 rounded-full h-1.5">
                        <div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${execRate(totalExecutedExpense, totalBudgetExpense)}%` }} />
                    </div>
                    <div className="text-xs text-red-600 mt-1">{execRate(totalExecutedExpense, totalBudgetExpense)}% 집행</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <BarChart2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-500">세입 잔액</span>
                    </div>
                    <div className="text-xl font-bold text-green-600">{(totalBudgetIncome - totalExecutedIncome).toLocaleString()}</div>
                    <div className="text-xs text-gray-400 mt-1">미집행 잔액</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <BarChart2 className="w-4 h-4 text-orange-500" />
                        <span className="text-sm text-gray-500">세출 잔액</span>
                    </div>
                    <div className="text-xl font-bold text-orange-600">{(totalBudgetExpense - totalExecutedExpense).toLocaleString()}</div>
                    <div className="text-xs text-gray-400 mt-1">미집행 잔액</div>
                </div>
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
        </div>
    );
}
