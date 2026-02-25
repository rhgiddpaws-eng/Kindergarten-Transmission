'use client';

import { useState } from 'react';
import { MOCK_TRANSACTIONS, MOCK_KINDERGARTENS } from '../../lib/mockData';
import {
    Building2, FileSpreadsheet, Send, CheckCircle2, XCircle, Clock,
    TrendingUp, TrendingDown, AlertCircle, Activity, ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardOverviewClient() {
    const [animating, setAnimating] = useState(false);

    const totalIncome = MOCK_TRANSACTIONS.filter(t => t.type === 'INCOME').reduce((a, b) => a + b.amount, 0);
    const totalExpense = MOCK_TRANSACTIONS.filter(t => t.type === 'EXPENSE').reduce((a, b) => a + b.amount, 0);
    const pendingCount = MOCK_TRANSACTIONS.filter(t => t.status === 'PENDING').length;
    const transmittedCount = MOCK_TRANSACTIONS.filter(t => t.status === 'TRANSMITTED').length;
    const failedCount = MOCK_TRANSACTIONS.filter(t => t.status === 'FAILED').length;

    const recentTransactions = MOCK_TRANSACTIONS.slice(0, 5);

    const handleQuickSync = () => {
        setAnimating(true);
        setTimeout(() => {
            setAnimating(false);
            alert('✅ 에듀파인 자동전송 시뮬레이션 완료!\n전송 건수: ' + pendingCount + '건\n(시뮬레이션 데이터 - 실제 전송 아님)');
        }, 2000);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">에듀파인 연동 대시보드</h1>
                    <p className="text-gray-500 mt-1 text-sm">햇살 유치원 | 2026년 2월 현황</p>
                </div>
                <button
                    onClick={handleQuickSync}
                    disabled={animating}
                    className="bg-indigo-600 flex items-center gap-2 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm hover:bg-indigo-700 transition-all disabled:opacity-60"
                >
                    <Send className={`w-4 h-4 ${animating ? 'animate-bounce' : ''}`} />
                    {animating ? '전송 중...' : '에듀파인 자동전송'}
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-500 text-sm font-medium">등록 유치원</span>
                        <div className="p-2 bg-indigo-50 rounded-lg">
                            <Building2 className="w-4 h-4 text-indigo-600" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{MOCK_KINDERGARTENS.length}</div>
                    <p className="text-xs text-gray-400 mt-1">활성: {MOCK_KINDERGARTENS.filter(k => k.isActive).length}개</p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-500 text-sm font-medium">전송 대기</span>
                        <div className="p-2 bg-amber-50 rounded-lg">
                            <Clock className="w-4 h-4 text-amber-600" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-amber-600">{pendingCount}</div>
                    <p className="text-xs text-gray-400 mt-1">분개 미완료 포함</p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-500 text-sm font-medium">전송 완료</span>
                        <div className="p-2 bg-green-50 rounded-lg">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-green-600">{transmittedCount}</div>
                    <p className="text-xs text-gray-400 mt-1">이번 달 누적</p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-500 text-sm font-medium">전송 실패</span>
                        <div className="p-2 bg-red-50 rounded-lg">
                            <XCircle className="w-4 h-4 text-red-600" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-red-600">{failedCount}</div>
                    <p className="text-xs text-gray-400 mt-1">재시도 필요</p>
                </div>
            </div>

            {/* Income / Expense Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="w-5 h-5 text-blue-500" />
                        <h3 className="font-semibold text-gray-900">이번 달 총 수입</h3>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">{totalIncome.toLocaleString()} 원</div>
                    <div className="mt-3 bg-blue-50 rounded-lg p-3">
                        <div className="text-xs text-blue-600">원비 수입 + 보조금 + 급식비 수입</div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                        <TrendingDown className="w-5 h-5 text-red-500" />
                        <h3 className="font-semibold text-gray-900">이번 달 총 지출</h3>
                    </div>
                    <div className="text-2xl font-bold text-red-600">{totalExpense.toLocaleString()} 원</div>
                    <div className="mt-3 bg-red-50 rounded-lg p-3">
                        <div className="text-xs text-red-600">인건비 + 급식비 + 운영비 + 기타</div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Link href="/dashboard/transactions" className="bg-white border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 rounded-xl p-4 flex flex-col items-center gap-2 transition-all group">
                    <FileSpreadsheet className="w-8 h-8 text-indigo-500 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium text-gray-700">현금출납부</span>
                </Link>
                <Link href="/dashboard/account-sync" className="bg-white border border-gray-200 hover:border-green-300 hover:bg-green-50 rounded-xl p-4 flex flex-col items-center gap-2 transition-all group">
                    <Activity className="w-8 h-8 text-green-500 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium text-gray-700">계좌 연동</span>
                </Link>
                <Link href="/dashboard/transmission" className="bg-white border border-gray-200 hover:border-amber-300 hover:bg-amber-50 rounded-xl p-4 flex flex-col items-center gap-2 transition-all group">
                    <Send className="w-8 h-8 text-amber-500 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium text-gray-700">에듀파인 전송</span>
                </Link>
                <Link href="/dashboard/budget" className="bg-white border border-gray-200 hover:border-purple-300 hover:bg-purple-50 rounded-xl p-4 flex flex-col items-center gap-2 transition-all group">
                    <AlertCircle className="w-8 h-8 text-purple-500 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium text-gray-700">예산/결산</span>
                </Link>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-indigo-500" />
                        최근 거래 내역
                    </h3>
                    <Link href="/dashboard/transactions" className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                        전체보기 <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
                <div className="divide-y divide-gray-100">
                    {recentTransactions.map(t => (
                        <div key={t.id} className="flex items-center px-5 py-3 hover:bg-gray-50 transition-colors">
                            <div className={`w-2 h-2 rounded-full mr-3 ${t.type === 'INCOME' ? 'bg-blue-500' : 'bg-red-500'}`} />
                            <div className="flex-1">
                                <div className="text-sm font-medium text-gray-900">{t.description}</div>
                                <div className="text-xs text-gray-400">{t.date} · {t.accountCode.name}</div>
                            </div>
                            <div className={`font-semibold text-sm ${t.type === 'INCOME' ? 'text-blue-600' : 'text-red-600'}`}>
                                {t.type === 'INCOME' ? '+' : '-'}{t.amount.toLocaleString()}원
                            </div>
                            <div className="ml-3">
                                {t.status === 'TRANSMITTED' && <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">전송완료</span>}
                                {t.status === 'PENDING' && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">대기중</span>}
                                {t.status === 'FAILED' && <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">실패</span>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
