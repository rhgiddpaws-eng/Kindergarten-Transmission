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
    const [isClosingGenerated, setIsClosingGenerated] = useState(false); // 결산서 생성 상태

    const [showWriteModal, setShowWriteModal] = useState<'INCOME' | 'EXPENSE' | 'SUPPLEMENTARY' | null>(null);
    const [showCodeSystemModal, setShowCodeSystemModal] = useState(false);
    const [showFinanceModal, setShowFinanceModal] = useState(false);
    const [newBudgetItem, setNewBudgetItem] = useState({ code: '', name: '', amount: '' });
    const [codeSystemItems, setCodeSystemItems] = useState([
        { id: 1, text: '관: 1000 - 보조금 및 지원금', level: 0 },
        { id: 2, text: '항: 1100 - 시도교육청보조금', level: 1 },
        { id: 3, text: '목: 1110 - 유아학비', level: 2 }
    ]);
    const [editingCodeItem, setEditingCodeItem] = useState<number | null>(null);
    const [editingText, setEditingText] = useState('');

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
                    <table className="whitespace-nowrap min-min-w-full text-sm text-center border-collapse">
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

                {/* Content Area */}
                <div className="overflow-x-auto p-0">
                    {activeTab === '예산현황 및 통계' && (
                        <table className="whitespace-nowrap min-w-full divide-y divide-gray-200 text-sm">
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
                    )}

                    {activeTab === '본예산' && (
                        <div className="p-12 text-center text-gray-500 min-h-[400px] flex flex-col items-center justify-center">
                            <h3 className="text-xl font-bold text-gray-800 mb-3">본예산서 작성</h3>
                            <p className="mb-2">새 학년도의 수입과 지출 계획을 세우는 화면입니다.</p>
                            <p className="text-sm border bg-gray-50 rounded-lg p-3 max-w-md mx-auto">아이큐브 매뉴얼 20~21페이지 반영 화면으로,<br />세입/세출 항목별 예산액을 입력하고 일치하는지 확인합니다.</p>
                            <div className="mt-6 flex justify-center gap-3">
                                <button
                                    onClick={() => setShowWriteModal('INCOME')}
                                    className="px-5 py-2.5 bg-blue-50 border border-blue-200 text-blue-700 font-semibold rounded-lg hover:bg-blue-100 transition">세입예산 작성</button>
                                <button
                                    onClick={() => setShowWriteModal('EXPENSE')}
                                    className="px-5 py-2.5 bg-red-50 border border-red-200 text-red-700 font-semibold rounded-lg hover:bg-red-100 transition">세출예산 작성</button>
                                <button
                                    onClick={() => showNotif('✅ 전년도(2025학년도) 예산 데이터를 성공적으로 복사했습니다.')}
                                    className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition">전년도 가져오기</button>
                            </div>
                        </div>
                    )}

                    {activeTab === '추경예산' && (
                        <div className="p-12 text-center text-gray-500 min-h-[400px] flex flex-col items-center justify-center">
                            <h3 className="text-xl font-bold text-gray-800 mb-3">추경예산 편성</h3>
                            <p className="mb-2">학년도 중에 발생하는 예산의 변경사항(추가/감액)을 관리합니다.</p>
                            <p className="text-sm mt-1 mb-6 text-gray-400">아이큐브 매뉴얼 23페이지 참조</p>
                            <div className="max-w-md w-full mx-auto text-left bg-gray-50 p-5 rounded-lg border border-gray-200 shadow-sm text-sm">
                                <div className="mb-3 flex items-center">
                                    <span className="font-semibold w-24 inline-block text-gray-700">추경 차수:</span>
                                    <select className="border border-gray-300 p-1.5 rounded-md bg-white flex-1 focus:ring-2 focus:ring-indigo-500 outline-none">
                                        <option>1차 추경</option>
                                        <option>2차 추경</option>
                                    </select>
                                </div>
                                <div className="flex items-center">
                                    <span className="font-semibold w-24 inline-block text-gray-700">추경 사유:</span>
                                    <input type="text" className="border border-gray-300 p-1.5 rounded-md flex-1 bg-white focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="예: 국고보조금 추가 교부" />
                                </div>
                                <div className="mt-5 pt-4 border-t border-gray-200 mt-4 text-center">
                                    <button
                                        onClick={() => setShowWriteModal('SUPPLEMENTARY')}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">추경 항목 작성하기</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === '세입세출결산서' && (
                        <div className="p-12 text-center text-gray-500 min-h-[400px] flex flex-col items-center justify-center">
                            <h3 className="text-xl font-bold text-gray-800 mb-3">세입세출결산서 (결산)</h3>
                            <p className="mb-2">학년도가 끝난 후 예산 대비 실제 수입/지출을 집계하여 결산서를 생성합니다.</p>
                            <p className="text-sm mt-1 mb-6 text-gray-400">아이큐브 매뉴얼 23페이지 참조</p>

                            <div className="bg-white border rounded-lg p-4 w-full max-w-lg mb-6 shadow-sm">
                                <div className="flex justify-between items-center mb-2 px-2">
                                    <span className="font-semibold">결산 상태</span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${isClosingGenerated ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {isClosingGenerated ? '결산완료' : '진행중'}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                                    <div className={`h-2 rounded-full transition-all duration-1000 ${isClosingGenerated ? 'bg-green-500 w-full' : 'bg-indigo-600 w-[65%]'}`}></div>
                                </div>
                                <div className="text-xs text-right text-gray-500">집행 집계 {isClosingGenerated ? '100% 완료' : '65% 완료'}</div>
                            </div>

                            <div className="flex justify-center gap-3">
                                <button
                                    onClick={() => { setIsClosingGenerated(true); showNotif('✅ 세입세출결산서 집계 및 생성이 완료되었습니다.'); }}
                                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition shadow-sm">결산서 자동 생성</button>
                                <button
                                    onClick={() => {
                                        if (isClosingGenerated) showNotif('결산서 PDF 미리보기를 준비중입니다...');
                                        else alert('결산서 자동 생성을 먼저 완료해야 미리볼 수 있습니다.');
                                    }}
                                    className="px-6 py-2.5 border border-gray-300 text-gray-700 bg-white font-medium hover:bg-gray-50 rounded-lg transition shadow-sm">미리보기</button>
                            </div>
                        </div>
                    )}

                    {activeTab === '세입세출예산서' && (
                        <div className="p-12 text-center text-gray-500 min-h-[400px] flex flex-col items-center justify-center">
                            <h3 className="text-xl font-bold text-gray-800 mb-3">세입세출예산서 (통합 요약)</h3>
                            <p className="mb-6">작성된 예산을 세입/세출 통합 요약표로 인쇄하거나 에듀파인에 올리기 전 최종 확인합니다.</p>
                            <div className="p-6 bg-indigo-50 border border-indigo-100 text-indigo-900 rounded-xl inline-block shadow-sm">
                                <div className="text-sm text-indigo-700 mb-2 font-medium">✨ 현재 예산서 요약 ✨</div>
                                <div className="flex items-center justify-center gap-6 text-lg">
                                    <div><span className="font-bold">세입 합계:</span> <span className="text-blue-700 font-extrabold">{totalBudgetIncome.toLocaleString()}</span>원</div>
                                    <div className="text-gray-400">|</div>
                                    <div><span className="font-bold">세출 합계:</span> <span className="text-red-700 font-extrabold">{totalBudgetExpense.toLocaleString()}</span>원</div>
                                </div>
                                {isMatch ? (
                                    <div className="mt-4 text-sm font-bold text-green-600 bg-green-100 px-3 py-1 rounded inline-block">✅ 세입·세출 일치 (업로드 가능)</div>
                                ) : (
                                    <div className="mt-4 text-sm font-bold text-red-600 bg-red-100 px-3 py-1 rounded inline-block">❌ 세입·세출 불일치 (조정 필요)</div>
                                )}
                            </div>
                            <div className="mt-6 flex justify-center gap-3">
                                <button
                                    onClick={() => showNotif('통합 요약표 문서(PDF) 생성을 시작합니다.')}
                                    className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition">예산서 출력(인쇄)</button>
                            </div>
                        </div>
                    )}

                    {activeTab === '공시관련' && (
                        <div className="p-12 text-center text-gray-500 min-h-[400px] flex flex-col items-center justify-center">
                            <h3 className="text-xl font-bold text-gray-800 mb-3">유치원 알리미 공시자료</h3>
                            <p className="mb-4">예산 및 결산 정보를 학부모와 대중에게 공개하기 위한 공시용 문서를 자동 추출합니다.</p>
                            <button
                                onClick={() => showNotif('파일 다운로드가 시작되었습니다. (알리미공시_2026.xlsx)')}
                                className="px-5 py-2.5 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-lg transition font-medium">공시 양식 다운로드</button>
                        </div>
                    )}

                    {activeTab === '설정' && (
                        <div className="p-12 text-center text-gray-500 min-h-[400px] flex flex-col items-center justify-center">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">예산/결산 환경설정</h3>
                            <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto w-full">
                                <button
                                    onClick={() => setShowCodeSystemModal(true)}
                                    className="p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition text-left">
                                    <div className="font-bold text-gray-800">관·항·목 체계 관리</div>
                                    <div className="text-xs text-gray-500 mt-1">에듀파인 기준 예산항목 코드 설정</div>
                                </button>
                                <button
                                    onClick={() => setShowFinanceModal(true)}
                                    className="p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition text-left">
                                    <div className="font-bold text-gray-800">기초 재무 설정</div>
                                    <div className="text-xs text-gray-500 mt-1">이월금 및 기본 계좌 설정</div>
                                </button>
                            </div>
                        </div>
                    )}
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

            {/* Write Budget Modal */}
            {showWriteModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-xl p-6 w-[400px] shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">
                                {showWriteModal === 'INCOME' ? '세입예산 작성' :
                                    showWriteModal === 'EXPENSE' ? '세출예산 작성' : '추경예산 작성'}
                            </h3>
                            <button onClick={() => setShowWriteModal(null)}><X className="w-5 h-5" /></button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-gray-700">항목 코드</label>
                                <input value={newBudgetItem.code} onChange={e => setNewBudgetItem({ ...newBudgetItem, code: e.target.value })} className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="예: 11-1" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">항목명</label>
                                <input value={newBudgetItem.name} onChange={e => setNewBudgetItem({ ...newBudgetItem, name: e.target.value })} className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="예: 원비" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">예산액 (원)</label>
                                <input type="number" value={newBudgetItem.amount} onChange={e => setNewBudgetItem({ ...newBudgetItem, amount: e.target.value })} className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="금액 입력" />
                            </div>
                        </div>
                        <div className="flex gap-2 mt-6">
                            <button onClick={() => setShowWriteModal(null)} className="flex-1 border border-gray-300 rounded-lg py-2 text-sm hover:bg-gray-50">취소</button>
                            <button onClick={() => {
                                const amt = parseInt(newBudgetItem.amount);
                                if (!newBudgetItem.code || !newBudgetItem.name || isNaN(amt)) {
                                    alert('모든 항목을 올바르게 입력해주세요.');
                                    return;
                                }
                                const newId = `NEW_${Date.now()}`;
                                setBudgetItems(prev => [...prev, {
                                    id: newId,
                                    code: newBudgetItem.code,
                                    type: showWriteModal === 'EXPENSE' ? 'EXPENSE' : 'INCOME',
                                    name: newBudgetItem.name,
                                    budgetAmount: amt,
                                    executedAmount: 0,
                                    remainingAmount: amt
                                }]);
                                setShowWriteModal(null);
                                setNewBudgetItem({ code: '', name: '', amount: '' });
                                showNotif('새 항목이 성공적으로 추가되었습니다!');
                                setActiveTab('예산현황 및 통계');
                            }} className="flex-1 bg-indigo-600 text-white rounded-lg py-2 text-sm hover:bg-indigo-700">
                                저장 후 목록보기
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Code System Modal */}
            {showCodeSystemModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-xl p-6 w-[500px] shadow-2xl max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">관·항·목 체계 관리</h3>
                            <button onClick={() => setShowCodeSystemModal(false)}><X className="w-5 h-5" /></button>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">에듀파인 예산과 매핑되는 아이큐브 내 항목 코드 체계를 설정합니다.</p>
                        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-2">
                            {codeSystemItems.map((item) => (
                                <div key={item.id} className={`flex items-center justify-between bg-white p-2 border rounded ${item.level === 1 ? 'ml-4' : item.level === 2 ? 'ml-8' : ''}`}>
                                    {editingCodeItem === item.id ? (
                                        <div className="flex-1 flex gap-2 w-full">
                                            <input
                                                value={editingText}
                                                onChange={(e) => setEditingText(e.target.value)}
                                                className="flex-1 border px-2 py-1 text-sm rounded outline-none focus:border-indigo-500"
                                                autoFocus
                                            />
                                            <button
                                                onClick={() => {
                                                    setCodeSystemItems(prev => prev.map(i => i.id === item.id ? { ...i, text: editingText } : i));
                                                    setEditingCodeItem(null);
                                                    showNotif('항목이 수정되었습니다.');
                                                }}
                                                className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded"
                                            >저장</button>
                                        </div>
                                    ) : (
                                        <>
                                            <span className={`${item.level === 0 ? 'font-semibold' : 'text-gray-700'} text-sm`}>{item.text}</span>
                                            <button
                                                onClick={() => { setEditingCodeItem(item.id); setEditingText(item.text); }}
                                                className="text-xs text-indigo-600 hover:underline"
                                            >수정</button>
                                        </>
                                    )}
                                </div>
                            ))}

                            <button
                                onClick={() => {
                                    const newItemText = prompt('새 항목 이름 (예: 목: 1120 - 방과후과정비)');
                                    if (newItemText) {
                                        setCodeSystemItems([...codeSystemItems, { id: Date.now(), text: newItemText, level: 2 }]);
                                        showNotif('새 항목이 추가되었습니다.');
                                    }
                                }}
                                className="w-full flex items-center justify-between text-left bg-white p-2 border rounded border-dashed text-sm text-gray-400 hover:text-indigo-500 hover:border-indigo-400 hover:bg-indigo-50 transition"
                            >
                                <span>+ 새 항목 추가</span>
                            </button>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button onClick={() => setShowCodeSystemModal(false)} className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-medium">닫기</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Basic Finance Setting Modal */}
            {showFinanceModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-xl p-6 w-[450px] shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">기초 재무 설정</h3>
                            <button onClick={() => setShowFinanceModal(false)}><X className="w-5 h-5" /></button>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">학년도 기초 이월금 및 기본 거래 계좌를 설정합니다.</p>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-semibold text-gray-700">전년도 순이월금 (원)</label>
                                <input type="text" defaultValue="5,000,000" className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-gray-700">주 거래 은행 계좌</label>
                                <select className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none">
                                    <option>국민은행 (111-222-333333) - 수입계좌</option>
                                    <option>신한은행 (444-555-666666) - 운영계좌</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-6">
                            <button onClick={() => setShowFinanceModal(false)} className="flex-1 border border-gray-300 rounded-lg py-2.5 text-sm hover:bg-gray-50 font-medium">취소</button>
                            <button onClick={() => {
                                showNotif('기초 재무 설정이 저장되었습니다.');
                                setShowFinanceModal(false);
                            }} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2.5 text-sm font-medium">저장</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
