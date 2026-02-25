'use client';

import { useState } from 'react';
import { CreditCard, Download, Activity, FileSpreadsheet } from 'lucide-react';

export default function CmsClient() {
    const [isSyncing, setIsSyncing] = useState(false);
    const [notification, setNotification] = useState('');

    const showNotif = (msg: string) => {
        setNotification(msg);
        setTimeout(() => setNotification(''), 3000);
    };

    const handleSync = () => {
        setIsSyncing(true);
        setTimeout(() => {
            setIsSyncing(false);
            showNotif('e키즈빌CMS 연동 데이터를 성공적으로 갱신했습니다!');
        }, 1500);
    };

    const mockCmsData = [
        { id: 1, name: '원아_김민준', type: '교육비/수업료', amount: 350000, date: '2026-02-28', status: '출금완료' },
        { id: 2, name: '원아_이서윤', type: '급식비', amount: 120000, date: '2026-02-28', status: '출금완료' },
        { id: 3, name: '원아_박지호', type: '현장학습비', amount: 50000, date: '2026-02-28', status: '출금완료' },
        { id: 4, name: '원아_정하은', type: '교육비/수업료', amount: 350000, date: '2026-02-28', status: '출금실패(잔액부족)' },
        { id: 5, name: '원아_최윤우', type: '급식비', amount: 120000, date: '2026-02-28', status: '출금진행중' },
    ];

    return (
        <div className="space-y-4">
            {notification && (
                <div className="fixed top-5 right-5 z-50 bg-green-600 text-white px-5 py-3 rounded-lg shadow-xl font-bold">
                    {notification}
                </div>
            )}

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">e키즈빌CMS 연동 현황</h1>
                    <p className="text-gray-500 mt-1 text-sm">유치원비 결제(CMS) 시스템과 연동된 최신 입금 및 출금 내역을 관리합니다.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleSync} disabled={isSyncing} className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2 font-medium shadow-sm transition-colors disabled:bg-indigo-400">
                        <Activity className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                        {isSyncing ? '동기화 중...' : '계좌 연동 최신화'}
                    </button>
                    <button onClick={() => showNotif('선택한 CMS 내역이 현금출납부에 수입 반영되었습니다.')} className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 shadow-sm transition-colors font-bold flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        현금출납부 수입 반영
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mt-6">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <CreditCard className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-gray-500">이달의 출금 요청 금액</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">54,500,000 원</div>
                    <div className="text-xs text-gray-400 mt-1">2026년 2월 전체 고지액</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <CreditCard className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-500">출금 완료 (CMS입금)</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">45,200,000 원</div>
                    <div className="text-xs text-gray-400 mt-1">총 145건 완료</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-4 h-4 text-orange-500" />
                        <span className="text-sm text-gray-500">진행 중</span>
                    </div>
                    <div className="text-2xl font-bold text-orange-500">8,500,000 원</div>
                    <div className="text-xs text-gray-400 mt-1">익월 정산 대기</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <FileSpreadsheet className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-gray-500">출금 실패 / 미납</span>
                    </div>
                    <div className="text-2xl font-bold text-red-600">800,000 원</div>
                    <div className="text-xs text-gray-400 mt-1">전체 미납자 알림 발송 요망</div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-5 mt-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-900 border-l-4 border-indigo-600 pl-2">최신 e키즈빌CMS 출금/입금 상세내역</h3>
                </div>
                <table className="min-w-full text-sm border border-gray-200">
                    <thead className="bg-[#eef4f9]">
                        <tr>
                            <th className="px-4 py-2 text-center w-[40px] border-r border-gray-200"><input type="checkbox" /></th>
                            {['승인일자', '요청금액별칭', '원아명', '요청금액(원)', '상태'].map(h => (
                                <th key={h} className="px-3 py-2 text-center text-xs font-bold text-[#003366] border-r border-gray-200">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                        {mockCmsData.map(row => (
                            <tr key={row.id} className="hover:bg-gray-50">
                                <td className="px-4 py-2 text-center border-r border-gray-200"><input type="checkbox" /></td>
                                <td className="px-3 py-2 text-center text-gray-600 border-r border-gray-200">{row.date}</td>
                                <td className="px-3 py-2 font-medium border-r border-gray-200 text-center">{row.type}</td>
                                <td className="px-3 py-2 font-medium border-r border-gray-200 text-center">{row.name}</td>
                                <td className="px-3 py-2 text-right border-r border-gray-200 text-gray-700">{row.amount.toLocaleString()}</td>
                                <td className="px-3 py-2 text-center font-bold border-r border-gray-200">
                                    <span className={`px-2 py-1 rounded text-xs ${row.status.includes('완료') ? 'bg-green-100 text-green-700' :
                                            row.status.includes('실패') ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                                        }`}>{row.status}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
