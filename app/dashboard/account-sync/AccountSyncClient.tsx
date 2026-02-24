'use client';

import { useState } from 'react';
import { MOCK_KINDERGARTENS, MOCK_BANK_TRANSACTIONS } from '../../../lib/mockData';
import { DownloadCloud, Building2, CreditCard, RefreshCw, Plus, CheckCircle2, X, AlertCircle } from 'lucide-react';

export default function AccountSyncClient() {
    const [bankTxList, setBankTxList] = useState(MOCK_BANK_TRANSACTIONS);
    const [syncing, setSyncing] = useState<string | null>(null);
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [showAddAccount, setShowAddAccount] = useState(false);
    const [showBankPopup, setShowBankPopup] = useState(false);
    const [newBankName, setNewBankName] = useState('');
    const [newAccountNum, setNewAccountNum] = useState('');
    const [notification, setNotification] = useState<string | null>(null);
    const [kindergartens, setKindergartens] = useState(MOCK_KINDERGARTENS);

    const showNotif = (msg: string) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 3000);
    };

    const handleScrape = (kgId: string, bankId: string) => {
        setSyncing(bankId);
        setTimeout(() => {
            setSyncing(null);
            showNotif('✅ 계좌 거래 내역을 성공적으로 가져왔습니다! (목업 데이터)');
        }, 2000);
    };

    const handleFetchAll = () => {
        setSyncing('all');
        setTimeout(() => {
            setSyncing(null);
            showNotif('✅ 전체 계좌 거래 내역 동기화 완료! (목업 데이터)');
        }, 2500);
    };

    const toggleRow = (id: string) => {
        setSelectedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
    };

    const handleImport = () => {
        const selected = selectedRows.length > 0 ? selectedRows : bankTxList.map(t => t.id);
        setBankTxList(prev => prev.map(t => selected.includes(t.id) ? { ...t, imported: true } : t));
        setSelectedRows([]);
        showNotif(`✅ ${selected.length}건을 현금출납부에 반영했습니다!`);
    };

    const handleAddAccount = () => {
        if (!newBankName || !newAccountNum) {
            alert('은행명과 계좌번호를 입력해주세요.');
            return;
        }
        setKindergartens(prev => prev.map(kg =>
            kg.id === 'kg1'
                ? { ...kg, bankAccounts: [...kg.bankAccounts, { id: `ba${Date.now()}`, bankName: newBankName, accountNumber: newAccountNum, ownerName: '햇살유치원', kindergartenId: 'kg1', lastSynced: undefined }] }
                : kg
        ));
        setShowAddAccount(false);
        setNewBankName('');
        setNewAccountNum('');
        showNotif('✅ 새 계좌가 등록되었습니다!');
    };

    return (
        <div className="space-y-5">
            {/* Notification Toast */}
            {notification && (
                <div className="fixed top-5 right-5 z-50 bg-green-600 text-white px-5 py-3 rounded-lg shadow-xl flex items-center gap-2 animate-bounce">
                    <CheckCircle2 className="w-5 h-5" />
                    {notification}
                </div>
            )}

            {/* Header */}
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-gray-900">계좌 연동 (계좌가져오기)</h1>
                    <p className="text-sm text-gray-500 mt-1">은행 계좌를 연결하고 거래 내역을 현금출납부로 가져옵니다.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowAddAccount(true)}
                        className="bg-white border border-gray-300 flex items-center gap-2 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm hover:bg-gray-50 transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        계좌 추가
                    </button>
                    <button
                        onClick={handleFetchAll}
                        disabled={syncing === 'all'}
                        className="bg-indigo-600 flex items-center gap-2 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm hover:bg-indigo-700 transition-all disabled:opacity-60"
                    >
                        <DownloadCloud className={`w-4 h-4 ${syncing === 'all' ? 'animate-bounce' : ''}`} />
                        {syncing === 'all' ? '조회 중...' : '전체 계좌 가져오기'}
                    </button>
                </div>
            </div>

            {/* Add Account Modal */}
            {showAddAccount && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-xl p-6 w-[400px] shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">계좌 추가하기</h3>
                            <button onClick={() => setShowAddAccount(false)}><X className="w-5 h-5" /></button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-gray-700">은행명</label>
                                <select value={newBankName} onChange={e => setNewBankName(e.target.value)} className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm">
                                    <option value="">선택하세요</option>
                                    <option value="농협중앙회">농협중앙회</option>
                                    <option value="국민은행">국민은행</option>
                                    <option value="신한은행">신한은행</option>
                                    <option value="우리은행">우리은행</option>
                                    <option value="하나은행">하나은행</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">계좌번호</label>
                                <input value={newAccountNum} onChange={e => setNewAccountNum(e.target.value)} placeholder="'-' 없이 입력" className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                            </div>
                        </div>
                        <div className="flex gap-2 mt-5">
                            <button onClick={() => setShowAddAccount(false)} className="flex-1 border border-gray-300 rounded-lg py-2 text-sm hover:bg-gray-50">취소</button>
                            <button onClick={handleAddAccount} className="flex-1 bg-indigo-600 text-white rounded-lg py-2 text-sm hover:bg-indigo-700">등록</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Kindergarten Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {kindergartens.map(kg => (
                    <div key={kg.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col hover:border-indigo-300 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                    <Building2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{kg.name}</h3>
                                    <p className="text-xs text-gray-500">{kg.bankAccounts.length}개 계좌 연결</p>
                                </div>
                            </div>
                            <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${kg.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                {kg.isActive ? '활성' : '비활성'}
                            </span>
                        </div>

                        <div className="flex-1 space-y-2">
                            {kg.bankAccounts.length === 0 ? (
                                <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                    <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500">연결된 계좌 없음</p>
                                    <button onClick={() => setShowAddAccount(true)} className="text-sm font-medium text-indigo-600 mt-1 hover:text-indigo-700 underline">계좌 연결하기</button>
                                </div>
                            ) : (
                                kg.bankAccounts.map(acc => (
                                    <div key={acc.id} className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
                                        <div className="flex justify-between items-center mb-1">
                                            <div className="flex items-center gap-2">
                                                <CreditCard className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm font-medium text-gray-700">{acc.bankName}</span>
                                            </div>
                                            <span className="text-xs font-mono text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200">{acc.accountNumber}</span>
                                        </div>
                                        {acc.lastSynced && (
                                            <p className="text-xs text-gray-400 mb-2">최종 조회: {acc.lastSynced}</p>
                                        )}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => { setShowBankPopup(true); }}
                                                className="flex-1 flex items-center justify-center gap-1 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 py-1.5 rounded transition-colors"
                                            >
                                                <DownloadCloud className="w-3 h-3" />
                                                계좌가져오기
                                            </button>
                                            <button
                                                onClick={() => handleScrape(kg.id, acc.id)}
                                                disabled={syncing === acc.id}
                                                className="flex items-center justify-center gap-1 text-xs font-medium text-indigo-600 border border-indigo-200 bg-white hover:bg-indigo-50 px-3 py-1.5 rounded transition-colors disabled:opacity-50"
                                            >
                                                <RefreshCw className={`w-3 h-3 ${syncing === acc.id ? 'animate-spin' : ''}`} />
                                                즉시조회
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Bank Transaction Popup */}
            {showBankPopup && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-xl w-[800px] max-h-[85vh] shadow-2xl flex flex-col">
                        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-[#005ba6] text-white rounded-t-xl">
                            <h3 className="font-bold text-lg">■ 계좌 현황 보기</h3>
                            <button onClick={() => setShowBankPopup(false)}><X className="w-5 h-5" /></button>
                        </div>

                        {/* Account list */}
                        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                            <div className="flex gap-2 mb-3">
                                <button className="border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-100 rounded">즉시조회</button>
                                <button className="border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-100 rounded">계좌추가하기</button>
                            </div>
                            <table className="w-full text-sm border border-gray-200">
                                <thead className="bg-[#b3d4e6] text-[#003366]">
                                    <tr>
                                        <th className="p-2 text-left border-r border-gray-200">은행명(별명)</th>
                                        <th className="p-2 text-center border-r border-gray-200">자료복구</th>
                                        <th className="p-2 text-center border-r border-gray-200">계좌번호</th>
                                        <th className="p-2 text-center border-r border-gray-200">최종조회</th>
                                        <th className="p-2 text-center">관리</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {MOCK_KINDERGARTENS[0].bankAccounts.map(acc => (
                                        <tr key={acc.id} className="border-t border-gray-200 hover:bg-blue-50">
                                            <td className="p-2 border-r border-gray-200">{acc.bankName}</td>
                                            <td className="p-2 border-r border-gray-200 text-center">
                                                <button
                                                    onClick={() => { showNotif('✅ 1월 전체 복구 완료!'); }}
                                                    className="bg-blue-500 text-white text-xs px-2 py-1 rounded hover:bg-blue-600"
                                                >1월 전체복구</button>
                                            </td>
                                            <td className="p-2 border-r border-gray-200 text-center text-xs font-mono">{acc.accountNumber}</td>
                                            <td className="p-2 border-r border-gray-200 text-center text-xs text-gray-500">{acc.lastSynced || '-'}</td>
                                            <td className="p-2 text-center">
                                                <button className="text-indigo-600 text-xs underline">수정</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Transaction list */}
                        <div className="flex-1 overflow-auto px-6 py-3">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="font-medium text-sm">2026년 2월 거래내역</span>
                                <span className="text-xs text-gray-500">총 {bankTxList.length}건</span>
                                <button
                                    onClick={handleImport}
                                    className="ml-auto bg-indigo-600 text-white text-xs px-3 py-1.5 rounded hover:bg-indigo-700"
                                >선택복구 (현금출납부 반영)</button>
                            </div>
                            <table className="w-full text-sm border border-gray-200">
                                <thead className="bg-[#00a9ba] text-white">
                                    <tr>
                                        <th className="p-2 w-8"><input type="checkbox" onChange={e => {
                                            if (e.target.checked) setSelectedRows(bankTxList.map(t => t.id));
                                            else setSelectedRows([]);
                                        }} /></th>
                                        <th className="p-2 border-l border-white/30">순번</th>
                                        <th className="p-2 border-l border-white/30">일자</th>
                                        <th className="p-2 border-l border-white/30">은행명</th>
                                        <th className="p-2 border-l border-white/30">거래내역</th>
                                        <th className="p-2 border-l border-white/30 text-right">입금액</th>
                                        <th className="p-2 border-l border-white/30 text-right">출금액</th>
                                        <th className="p-2 border-l border-white/30 text-right">잔액</th>
                                        <th className="p-2 border-l border-white/30">반영</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bankTxList.map(t => (
                                        <tr key={t.id} className={`border-t border-gray-200 hover:bg-blue-50 ${t.imported ? 'bg-blue-50' : ''}`}>
                                            <td className="p-2 text-center"><input type="checkbox" checked={selectedRows.includes(t.id)} onChange={() => toggleRow(t.id)} /></td>
                                            <td className="p-2 text-center text-gray-600">{t.seq}</td>
                                            <td className="p-2 text-center text-gray-600 text-xs">{t.date}</td>
                                            <td className="p-2 text-gray-600 text-xs">{t.bankName}</td>
                                            <td className="p-2 text-gray-800 text-xs">{t.description}</td>
                                            <td className="p-2 text-right text-blue-600 text-xs">{t.income > 0 ? t.income.toLocaleString() : ''}</td>
                                            <td className="p-2 text-right text-red-600 text-xs">{t.expense > 0 ? t.expense.toLocaleString() : ''}</td>
                                            <td className="p-2 text-right text-gray-700 text-xs">{t.balance.toLocaleString()}</td>
                                            <td className="p-2 text-center">
                                                {t.imported
                                                    ? <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded">반영</span>
                                                    : <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded">미반영</span>
                                                }
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="px-6 py-3 border-t border-gray-200 flex justify-end gap-2">
                            <button onClick={() => setShowBankPopup(false)} className="border border-gray-300 px-4 py-2 text-sm rounded hover:bg-gray-50">닫기</button>
                            <button onClick={() => { handleImport(); setShowBankPopup(false); }} className="bg-indigo-600 text-white px-4 py-2 text-sm rounded hover:bg-indigo-700">선택항목 현금출납부 반영</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
