'use client';

import { useState } from 'react';
import { MOCK_EMPLOYEES, Employee } from '../lib/mockData';
import { Plus, Edit, Trash2, X, Download, CheckCircle2, Users, Calculator } from 'lucide-react';

type HrTab = '직원목록' | '급여대장' | '4대보험' | '인사발령';

export default function HrClient() {
    const [activeTab, setActiveTab] = useState<HrTab>('직원목록');
    const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
    const [showAdd, setShowAdd] = useState(false);
    const [editTarget, setEditTarget] = useState<Employee | null>(null);
    const [form, setForm] = useState({ name: '', position: '', department: '', baseSalary: '' });
    const [notification, setNotification] = useState<string | null>(null);
    const [showPayrollModal, setShowPayrollModal] = useState(false);

    const showNotif = (msg: string) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 3000);
    };

    const handleAdd = () => {
        if (!form.name || !form.position) { alert('이름과 직위를 입력하세요.'); return; }
        const newEmp: Employee = {
            id: `e${Date.now()}`,
            name: form.name,
            position: form.position,
            department: form.department,
            baseSalary: parseInt(form.baseSalary.replace(/,/g, '')) || 0,
            hireDate: new Date().toISOString().split('T')[0],
            isActive: true,
        };
        setEmployees(prev => [newEmp, ...prev]);
        setShowAdd(false);
        setForm({ name: '', position: '', department: '', baseSalary: '' });
        showNotif('✅ 직원이 등록되었습니다!');
    };

    const handleEdit = () => {
        if (!editTarget) return;
        setEmployees(prev => prev.map(e =>
            e.id === editTarget.id
                ? { ...e, name: form.name, position: form.position, department: form.department, baseSalary: parseInt(form.baseSalary.replace(/,/g, '')) || e.baseSalary }
                : e
        ));
        setEditTarget(null);
        showNotif('✅ 직원 정보가 수정되었습니다!');
    };

    const handleDelete = (id: string) => {
        if (!confirm('이 직원을 삭제하시겠습니까?')) return;
        setEmployees(prev => prev.filter(e => e.id !== id));
        showNotif('🗑️ 삭제되었습니다.');
    };

    const totalSalary = employees.reduce((a, e) => a + e.baseSalary, 0);

    const calcInsurance = (base: number) => ({
        national: Math.round(base * 0.045),
        health: Math.round(base * 0.03545),
        longterm: Math.round(base * 0.00455),
        employment: Math.round(base * 0.009),
    });

    const exportCSV = () => {
        const rows = [['이름', '직위', '부서', '기본급', '입사일']];
        employees.forEach(e => rows.push([e.name, e.position, e.department, String(e.baseSalary), e.hireDate]));
        const csv = rows.map(r => r.join(',')).join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = '직원목록_2026.csv'; a.click();
        URL.revokeObjectURL(url);
    };

    const tabs: HrTab[] = ['직원목록', '급여대장', '4대보험', '인사발령'];

    return (
        <div className="space-y-4">
            {notification && (
                <div className="fixed top-5 right-5 z-50 bg-green-600 text-white px-5 py-3 rounded-lg shadow-xl flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />{notification}
                </div>
            )}

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">인사/급여 관리</h1>
                    <p className="text-gray-500 mt-1 text-sm">직원 정보 및 급여 현황을 관리합니다.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={exportCSV} className="border border-gray-300 flex items-center gap-2 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50">
                        <Download className="w-4 h-4" />엑셀다운로드
                    </button>
                    <button onClick={() => setShowPayrollModal(true)} className="border border-indigo-300 bg-indigo-50 flex items-center gap-2 text-indigo-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-100">
                        <Calculator className="w-4 h-4" />급여계산
                    </button>
                    <button onClick={() => { setShowAdd(true); setForm({ name: '', position: '', department: '', baseSalary: '' }); }} className="bg-indigo-600 flex items-center gap-2 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700">
                        <Plus className="w-4 h-4" />직원 추가
                    </button>
                </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-indigo-500" />
                        <span className="text-sm text-gray-500">전체 직원</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{employees.length}명</div>
                    <div className="text-xs text-gray-400 mt-1">재직중: {employees.filter(e => e.isActive).length}명</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Calculator className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-500">총 급여</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">{totalSalary.toLocaleString()} 원</div>
                    <div className="text-xs text-gray-400 mt-1">이번 달 지급 예정</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-orange-500" />
                        <span className="text-sm text-gray-500">평균 급여</span>
                    </div>
                    <div className="text-2xl font-bold text-orange-600">
                        {employees.length > 0 ? Math.round(totalSalary / employees.length).toLocaleString() : 0} 원
                    </div>
                    <div className="text-xs text-gray-400 mt-1">1인 평균</div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="flex border-b border-gray-200 bg-gray-50">
                    {tabs.map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === tab ? 'border-indigo-600 text-indigo-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                            {tab}
                        </button>
                    ))}
                </div>

                {activeTab === '직원목록' && (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {['이름', '직위', '부서', '기본급', '입사일', '상태', '관리'].map(h => (
                                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {employees.map(emp => (
                                <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                                                {emp.name.charAt(0)}
                                            </div>
                                            <span className="font-medium text-gray-900">{emp.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{emp.position}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{emp.department}</td>
                                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{emp.baseSalary.toLocaleString()} 원</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{emp.hireDate}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${emp.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                            {emp.isActive ? '재직' : '퇴직'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <button onClick={() => { setEditTarget(emp); setForm({ name: emp.name, position: emp.position, department: emp.department, baseSalary: emp.baseSalary.toLocaleString() }); }}
                                                className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(emp.id)} className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {activeTab === '급여대장' && (
                    <div className="p-5">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-gray-900">2026년 2월 급여대장</h3>
                            <button onClick={() => alert('✅ EDI 파일 생성 완료! (목업)')} className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700">EDI 파일 생성</button>
                        </div>
                        <table className="min-w-full text-sm border border-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    {['이름', '직위', '기본급', '국민연금(-)', '건강보험(-)', '고용보험(-)', '실수령액'].map(h => (
                                        <th key={h} className="px-4 py-2 text-left text-xs font-semibold text-gray-600 border-r border-gray-200">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {employees.filter(e => e.isActive).map(emp => {
                                    const ins = calcInsurance(emp.baseSalary);
                                    const total = ins.national + ins.health + ins.longterm + ins.employment;
                                    return (
                                        <tr key={emp.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium border-r border-gray-200">{emp.name}</td>
                                            <td className="px-4 py-3 text-gray-600 border-r border-gray-200">{emp.position}</td>
                                            <td className="px-4 py-3 text-right font-medium border-r border-gray-200">{emp.baseSalary.toLocaleString()}</td>
                                            <td className="px-4 py-3 text-right text-red-500 border-r border-gray-200">{ins.national.toLocaleString()}</td>
                                            <td className="px-4 py-3 text-right text-red-500 border-r border-gray-200">{ins.health.toLocaleString()}</td>
                                            <td className="px-4 py-3 text-right text-red-500 border-r border-gray-200">{ins.employment.toLocaleString()}</td>
                                            <td className="px-4 py-3 text-right font-bold text-green-600">{(emp.baseSalary - total).toLocaleString()}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot className="bg-gray-100">
                                <tr>
                                    <td colSpan={2} className="px-4 py-2 font-bold">합 계</td>
                                    <td className="px-4 py-2 text-right font-bold">{employees.reduce((a, e) => a + e.baseSalary, 0).toLocaleString()}</td>
                                    <td colSpan={4}></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                )}

                {activeTab === '4대보험' && (
                    <div className="p-5">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-gray-900">4대보험 보험료 내역</h3>
                            <button onClick={() => alert('✅ EDI 신고 파일 생성 완료! (목업)')} className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700">EDI 신고 파일</button>
                        </div>
                        <table className="min-w-full text-sm border border-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    {['이름', '기본급', '국민연금', '건강보험', '장기요양', '고용보험', '계(근로자)', '계(사용자)'].map(h => (
                                        <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-gray-600 border-r border-gray-200">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {employees.filter(e => e.isActive).map(emp => {
                                    const ins = calcInsurance(emp.baseSalary);
                                    const worker = ins.national + ins.health + ins.longterm + ins.employment;
                                    const employer = Math.round(worker * 1.05);
                                    return (
                                        <tr key={emp.id} className="hover:bg-gray-50">
                                            <td className="px-3 py-2 font-medium border-r border-gray-200">{emp.name}</td>
                                            <td className="px-3 py-2 text-right border-r border-gray-200">{emp.baseSalary.toLocaleString()}</td>
                                            <td className="px-3 py-2 text-right border-r border-gray-200">{ins.national.toLocaleString()}</td>
                                            <td className="px-3 py-2 text-right border-r border-gray-200">{ins.health.toLocaleString()}</td>
                                            <td className="px-3 py-2 text-right border-r border-gray-200">{ins.longterm.toLocaleString()}</td>
                                            <td className="px-3 py-2 text-right border-r border-gray-200">{ins.employment.toLocaleString()}</td>
                                            <td className="px-3 py-2 text-right font-bold text-red-600 border-r border-gray-200">{worker.toLocaleString()}</td>
                                            <td className="px-3 py-2 text-right font-bold text-orange-600">{employer.toLocaleString()}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === '인사발령' && (
                    <div className="p-5">
                        <div className="text-sm text-gray-500 mb-4">2026년 인사발령 내역</div>
                        <div className="space-y-2">
                            {[
                                { date: '2026-01-01', name: '김선생', from: '교사', to: '주임교사', type: '승진' },
                                { date: '2026-02-01', name: '이민준', from: '보조교사', to: '교사', type: '승진' },
                                { date: '2026-02-15', name: '박지현', from: '행정원', to: '행정주임', type: '발령' },
                            ].map((evt, i) => (
                                <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <span className="text-xs text-gray-400 w-24">{evt.date}</span>
                                    <span className="font-medium">{evt.name}</span>
                                    <span className="text-gray-500 text-sm">{evt.from} → {evt.to}</span>
                                    <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-medium ${evt.type === '승진' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{evt.type}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {(showAdd || editTarget) && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-xl p-6 w-[420px] shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">{showAdd ? '직원 추가' : '직원 정보 수정'}</h3>
                            <button onClick={() => { setShowAdd(false); setEditTarget(null); }}><X className="w-5 h-5" /></button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-gray-700">이름 *</label>
                                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">직위 *</label>
                                    <select value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))} className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                                        <option value="">선택</option>
                                        <option value="원장">원장</option>
                                        <option value="주임교사">주임교사</option>
                                        <option value="교사">교사</option>
                                        <option value="보조교사">보조교사</option>
                                        <option value="영양사">영양사</option>
                                        <option value="조리사">조리사</option>
                                        <option value="행정원">행정원</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">부서</label>
                                    <select value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                                        <option value="">선택</option>
                                        <option value="교육">교육</option>
                                        <option value="행정">행정</option>
                                        <option value="조리">조리</option>
                                        <option value="기타">기타</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">기본급 (원)</label>
                                <input value={form.baseSalary} onChange={e => setForm(f => ({ ...f, baseSalary: e.target.value }))} placeholder="예: 2,500,000" className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                        </div>
                        <div className="flex gap-2 mt-5">
                            <button onClick={() => { setShowAdd(false); setEditTarget(null); }} className="flex-1 border border-gray-300 rounded-lg py-2 text-sm hover:bg-gray-50">취소</button>
                            <button onClick={showAdd ? handleAdd : handleEdit} className="flex-1 bg-indigo-600 text-white rounded-lg py-2 text-sm hover:bg-indigo-700">
                                {showAdd ? '추가' : '저장'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Payroll Modal */}
            {showPayrollModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-xl p-6 w-[500px] shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">급여 계산기</h3>
                            <button onClick={() => setShowPayrollModal(false)}><X className="w-5 h-5" /></button>
                        </div>
                        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-4">
                            <div className="text-sm font-medium text-indigo-700 mb-2">2026년 2월 전체 급여 요약</div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>전체 지급액: <strong>{totalSalary.toLocaleString()}원</strong></div>
                                <div>전체 공제액: <strong>{Math.round(totalSalary * 0.09).toLocaleString()}원</strong></div>
                                <div>실 지급액: <strong className="text-green-600">{Math.round(totalSalary * 0.91).toLocaleString()}원</strong></div>
                                <div>사용자 부담: <strong className="text-orange-600">{Math.round(totalSalary * 0.12).toLocaleString()}원</strong></div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setShowPayrollModal(false)} className="flex-1 border border-gray-300 rounded-lg py-2 text-sm hover:bg-gray-50">닫기</button>
                            <button onClick={() => { alert('✅ 급여 내역이 현금출납부에 반영되었습니다! (목업)'); setShowPayrollModal(false); }} className="flex-1 bg-indigo-600 text-white rounded-lg py-2 text-sm hover:bg-indigo-700">현금출납부 반영</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
