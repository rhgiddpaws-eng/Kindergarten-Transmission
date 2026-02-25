'use client';

import { useState } from 'react';
import { Download, X } from 'lucide-react';

export default function LaborClient() {
    const [hasEdiData, setHasEdiData] = useState(false);
    const [showEdiModal, setShowEdiModal] = useState(false);
    const [notification, setNotification] = useState('');

    const employees = [
        { id: '1', name: '홍길동', position: '원장', baseSalary: 3500000, isActive: true },
        { id: '2', name: '김영희', position: '교사', baseSalary: 2500000, isActive: true },
        { id: '3', name: '이철수', position: '교사', baseSalary: 2400000, isActive: true },
        { id: '4', name: '박민수', position: '조리원', baseSalary: 2000000, isActive: true },
    ];

    const showNotif = (msg: string) => {
        setNotification(msg);
        setTimeout(() => setNotification(''), 3000);
    };

    const calcInsurance = (base: number) => ({
        national: Math.round(base * 0.045),
        health: Math.round(base * 0.03545),
        longterm: Math.round(base * 0.00455),
        employment: Math.round(base * 0.009),
    });

    return (
        <div className="space-y-4">
            {notification && (
                <div className="fixed top-5 right-5 z-50 bg-green-600 text-white px-5 py-3 rounded-lg shadow-xl font-bold">
                    {notification}
                </div>
            )}

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">노무관리 (4대보험 고지내역)</h1>
                    <p className="text-gray-500 mt-1 text-sm">EDI 시스템과 연동하여 4대보험 고지내역을 가져오고 현금출납부에 자동 반영합니다.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setShowEdiModal(true)} className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2 font-medium shadow-sm transition-colors">
                        <Download className="w-4 h-4" /> 4대보험 고지내역 가져오기
                    </button>
                    <button onClick={() => {
                        if (!hasEdiData) {
                            alert('먼저 고지내역을 가져와주세요.');
                            return;
                        }
                        showNotif('사업장 부담분이 현금출납부에 성공적으로 자동 반영되었습니다!');
                    }} className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 shadow-sm transition-colors font-bold">
                        현금출납부 반영
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-5 mt-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-900 border-l-4 border-indigo-600 pl-2">2026년 2월 4대보험 고지내역 대사 (계산액 vs 고지액)</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm border border-gray-200 whitespace-nowrap">
                        <thead className="bg-[#eef4f9]">
                            <tr>
                                {['이름', '직책', '구분', '국민연금', '건강보험', '장기요양', '고용보험', '계(근로자부담)', '계(사업장부담)'].map(h => (
                                    <th key={h} className="px-3 py-2 text-center text-xs font-bold text-[#003366] border-r border-gray-200">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {employees.filter(e => e.isActive).map((emp, index) => {
                                const ins = calcInsurance(emp.baseSalary);
                                const worker = ins.national + ins.health + ins.longterm + ins.employment;
                                const employer = Math.round(worker * 1.05);

                                const isDiff = hasEdiData && index === 1; // Simulate difference for second employee
                                const mockDiff = isDiff ? 150 : 0;
                                const noticeHealth = ins.health + mockDiff;
                                const noticeWorker = worker + mockDiff;
                                const noticeEmployer = employer + mockDiff;

                                return (
                                    <React.Fragment key={emp.id}>
                                        <tr className="hover:bg-gray-50 border-b-0">
                                            <td className="px-3 py-2 font-bold border-r border-gray-200 text-center" rowSpan={hasEdiData ? 3 : 1}>{emp.name}</td>
                                            <td className="px-3 py-2 font-medium text-gray-600 border-r border-gray-200 text-center" rowSpan={hasEdiData ? 3 : 1}>{emp.position}</td>
                                            <td className="px-3 py-2 text-center border-r border-gray-200 bg-gray-50 text-gray-600 text-xs font-semibold">급여계산액</td>
                                            <td className="px-3 py-2 text-right border-r border-gray-200 text-gray-700">{ins.national.toLocaleString()}</td>
                                            <td className="px-3 py-2 text-right border-r border-gray-200 text-gray-700">{ins.health.toLocaleString()}</td>
                                            <td className="px-3 py-2 text-right border-r border-gray-200 text-gray-700">{ins.longterm.toLocaleString()}</td>
                                            <td className="px-3 py-2 text-right border-r border-gray-200 text-gray-700">{ins.employment.toLocaleString()}</td>
                                            <td className="px-3 py-2 text-right font-bold text-red-600 border-r border-gray-200">{worker.toLocaleString()}</td>
                                            <td className="px-3 py-2 text-right font-bold text-orange-600">{employer.toLocaleString()}</td>
                                        </tr>
                                        {hasEdiData && (
                                            <tr className="hover:bg-gray-50 border-b-0">
                                                <td className="px-3 py-2 text-center border-r border-gray-200 bg-blue-50 text-blue-700 text-xs font-semibold">EDI고지액</td>
                                                <td className="px-3 py-2 text-right border-r border-gray-200 font-medium">{ins.national.toLocaleString()}</td>
                                                <td className="px-3 py-2 text-right border-r border-gray-200 font-medium">{noticeHealth.toLocaleString()}</td>
                                                <td className="px-3 py-2 text-right border-r border-gray-200 font-medium">{ins.longterm.toLocaleString()}</td>
                                                <td className="px-3 py-2 text-right border-r border-gray-200 font-medium">{ins.employment.toLocaleString()}</td>
                                                <td className="px-3 py-2 text-right font-bold text-blue-700 border-r border-gray-200">{noticeWorker.toLocaleString()}</td>
                                                <td className="px-3 py-2 text-right font-bold text-blue-700">{noticeEmployer.toLocaleString()}</td>
                                            </tr>
                                        )}
                                        {hasEdiData && (
                                            <tr className={isDiff ? 'bg-red-50/50' : 'bg-gray-50/30'}>
                                                <td className={`px-3 py-2 text-center border-r border-gray-200 ${isDiff ? 'text-red-700' : 'text-gray-500'} text-xs font-bold`}>차액</td>
                                                <td className="px-3 py-2 text-right border-r border-gray-200 text-gray-500">0</td>
                                                <td className={`px-3 py-2 text-right border-r border-gray-200 font-bold ${isDiff ? 'text-red-600' : 'text-gray-500'}`}>{mockDiff}</td>
                                                <td className="px-3 py-2 text-right border-r border-gray-200 text-gray-500">0</td>
                                                <td className="px-3 py-2 text-right border-r border-gray-200 text-gray-500">0</td>
                                                <td className={`px-3 py-2 text-right font-bold ${isDiff ? 'text-red-600' : 'text-gray-500'} border-r border-gray-200`}>{mockDiff}</td>
                                                <td className={`px-3 py-2 text-right font-bold ${isDiff ? 'text-red-600' : 'text-gray-500'}`}>{mockDiff}</td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* EDI Import Modal */}
            {showEdiModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-xl p-6 w-[450px] shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">건강보험/국민연금 EDI 가져오기</h3>
                            <button onClick={() => setShowEdiModal(false)}><X className="w-5 h-5" /></button>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-[#eef4f9] p-3 rounded text-sm text-[#003366] mb-2 font-medium">
                                공단 EDI 시스템과 연동하여 당월 고지내역 금액을 조회합니다.
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-semibold text-gray-700">고지월</label>
                                <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none">
                                    <option>2026년 2월</option>
                                    <option>2026년 1월</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-semibold text-gray-700">인증서 선택</label>
                                <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none">
                                    <option>유치원 사업장 범용 공동인증서</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2 mt-2">
                                <input type="password" placeholder="인증서 비밀번호 입력" className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none w-full" />
                            </div>
                        </div>
                        <div className="flex gap-2 pt-2 mt-4">
                            <button onClick={() => setShowEdiModal(false)} className="flex-1 border border-gray-300 rounded-lg py-3 text-sm hover:bg-gray-50 font-medium text-gray-700">취소</button>
                            <button onClick={() => {
                                setHasEdiData(true);
                                setShowEdiModal(false);
                                showNotif('EDI 고지내역을 성공적으로 불러왔습니다.');
                            }} className="flex-1 bg-indigo-600 text-white rounded-lg py-3 text-sm font-medium hover:bg-indigo-700 shadow-sm">
                                EDI 연동 시작
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
