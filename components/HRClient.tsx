'use client';

import { useState, Fragment } from 'react';
import { MOCK_EMPLOYEES, Employee } from '../lib/mockData';
import { Plus, Edit, Trash2, X, Download, CheckCircle2, Users, Calculator, FileText, Mail, Printer } from 'lucide-react';

type HrTab = '기초코드등록' | '사원등록' | '급여자료입력' | '급여대장출력' | '4대보험 고지내역';

export default function HrClient() {
    const [activeTab, setActiveTab] = useState<HrTab>('사원등록');
    const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
    const [showAdd, setShowAdd] = useState(false);
    const [editTarget, setEditTarget] = useState<Employee | null>(null);
    const [form, setForm] = useState({ name: '', position: '', department: '', baseSalary: '' });
    const [notification, setNotification] = useState('');

    // 기초코드 상태
    const [positionCodes, setPositionCodes] = useState([
        { code: '01', name: '원장' }, { code: '02', name: '원감' }, { code: '03', name: '수석교사' }, { code: '04', name: '주임교사' }, { code: '05', name: '정교사' }
    ]);
    const [newPosition, setNewPosition] = useState('');

    const [payItems, setPayItems] = useState([
        { type: '지급', name: '기본급', tax: '과세' }, { type: '지급', name: '직책수당', tax: '과세' }, { type: '지급', name: '식대', tax: '비과세' },
        { type: '공제', name: '국민연금', tax: '-' }, { type: '공제', name: '건강보험', tax: '-' }
    ]);
    const [newPayItem, setNewPayItem] = useState({ type: '지급', name: '', tax: '과세' });

    // EDI 연동 상태
    const [hasEdiData, setHasEdiData] = useState(false);
    const [showPayrollModal, setShowPayrollModal] = useState(false);
    const [showEdiModal, setShowEdiModal] = useState(false);
    const [selectedStub, setSelectedStub] = useState<Employee | null>(null);

    const showNotif = (msg: string) => {
        setNotification(msg);
        setTimeout(() => setNotification(''), 3000);
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

    const tabs: HrTab[] = ['기초코드등록', '사원등록', '급여자료입력', '급여대장출력', '4대보험 고지내역'];

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

                {activeTab === '기초코드등록' && (
                    <div className="p-5">
                        <div className="flex gap-6">
                            {/* 직책/직급 코드표 */}
                            <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden flex flex-col">
                                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 font-semibold text-gray-700 flex justify-between items-center">
                                    직책/직급 코드표
                                </div>
                                <div className="p-2 border-b bg-white flex gap-2">
                                    <input type="text" value={newPosition} onChange={e => setNewPosition(e.target.value)} placeholder="새 직책/직급 명칭 입력" className="flex-1 border px-2 py-1 text-sm rounded bg-gray-50 outline-none focus:bg-white" />
                                    <button onClick={() => {
                                        if (newPosition) {
                                            const nextCode = String(positionCodes.length + 1).padStart(2, '0');
                                            setPositionCodes([...positionCodes, { code: nextCode, name: newPosition }]);
                                            setNewPosition('');
                                            showNotif('직책 코드가 추가되었습니다.');
                                        }
                                    }} className="bg-indigo-600 text-white px-3 py-1 rounded text-sm whitespace-nowrap">+ 추가</button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="whitespace-nowrap min-min-w-full text-sm">
                                        <thead className="bg-gray-100">
                                            <tr><th className="px-4 py-2 border-b text-left">코드</th><th className="px-4 py-2 border-b text-left">명칭</th><th className="px-4 py-2 border-b text-center">관리</th></tr>
                                        </thead>
                                        <tbody className="bg-white">
                                            {positionCodes.map((pc, idx) => (
                                                <tr key={idx}>
                                                    <td className="px-4 py-2 border-b text-gray-500">{pc.code}</td>
                                                    <td className="px-4 py-2 border-b font-medium">{pc.name}</td>
                                                    <td className="px-4 py-2 border-b text-center">
                                                        <button onClick={() => setPositionCodes(positionCodes.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700 text-xs font-semibold">삭제</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            {/* 지급/공제 항목 */}
                            <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden flex flex-col">
                                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 font-semibold text-gray-700 flex justify-between items-center">
                                    지급/공제 항목 설정
                                </div>
                                <div className="p-2 border-b bg-white flex gap-2">
                                    <select value={newPayItem.type} onChange={e => setNewPayItem({ ...newPayItem, type: e.target.value })} className="border px-2 text-sm rounded bg-gray-50">
                                        <option value="지급">지급</option>
                                        <option value="공제">공제</option>
                                    </select>
                                    <input type="text" value={newPayItem.name} onChange={e => setNewPayItem({ ...newPayItem, name: e.target.value })} placeholder="명칭 입력" className="flex-1 border px-2 py-1 text-sm rounded bg-gray-50 outline-none focus:bg-white" />
                                    <select value={newPayItem.tax} onChange={e => setNewPayItem({ ...newPayItem, tax: e.target.value })} className="border px-2 text-sm rounded bg-gray-50 w-[70px]">
                                        <option value="과세">과세</option>
                                        <option value="비과세">비과세</option>
                                        <option value="-">-</option>
                                    </select>
                                    <button onClick={() => {
                                        if (newPayItem.name) {
                                            setPayItems([...payItems, { ...newPayItem }]);
                                            setNewPayItem({ type: '지급', name: '', tax: '과세' });
                                            showNotif('지급/공제 항목이 추가되었습니다.');
                                        }
                                    }} className="bg-indigo-600 text-white px-3 py-1 rounded text-sm whitespace-nowrap">+ 추가</button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="whitespace-nowrap min-min-w-full text-sm">
                                        <thead className="bg-gray-100">
                                            <tr><th className="px-4 py-2 border-b text-left w-[60px]">구분</th><th className="px-4 py-2 border-b text-left">명칭</th><th className="px-4 py-2 border-b text-center">과세구분</th><th className="px-4 py-2 border-b text-center">관리</th></tr>
                                        </thead>
                                        <tbody className="bg-white">
                                            {payItems.map((pi, idx) => (
                                                <tr key={idx}>
                                                    <td className="px-4 py-2 border-b">
                                                        <span className={`font-bold px-2 py-0.5 rounded text-xs ${pi.type === '지급' ? 'text-blue-600 bg-blue-50' : 'text-red-600 bg-red-50'}`}>{pi.type}</span>
                                                    </td>
                                                    <td className="px-4 py-2 border-b font-medium">{pi.name}</td>
                                                    <td className="px-4 py-2 border-b text-center text-gray-600">{pi.tax}</td>
                                                    <td className="px-4 py-2 border-b text-center">
                                                        <button onClick={() => setPayItems(payItems.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700 text-xs font-semibold">삭제</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === '사원등록' && (
                    <div className="overflow-x-auto">
                        <table className="whitespace-nowrap min-min-w-full divide-y divide-gray-200">
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
                    </div>
                )}

                {(activeTab === '급여자료입력' || activeTab === '급여대장출력') && (
                    <div className="p-5">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-gray-900">2026년 2월 급여 내역</h3>
                            <div className="flex gap-2">
                                {activeTab === '급여자료입력' && (
                                    <button onClick={() => showNotif('기본급 및 수당 정보를 일괄 적용합니다. (시뮬레이션)')} className="bg-white border border-gray-300 text-gray-700 text-sm px-4 py-2 rounded-lg hover:bg-gray-50">일괄입력</button>
                                )}
                                <button onClick={() => {
                                    // 모의 EDI 엑셀/CSV 파일 다운로드 로직
                                    const ediCsvData = "이름,기본급,국민연금,건강보험,고용보험,장기요양\n" +
                                        employees.map(e => {
                                            const ins = calcInsurance(e.baseSalary);
                                            return `${e.name},${e.baseSalary},${ins.national},${ins.health},${ins.employment},${ins.longterm}`;
                                        }).join("\n");
                                    const blob = new Blob(['\uFEFF' + ediCsvData], { type: 'text/csv;charset=utf-8;' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `EDI_신고파일_${Date.now()}.csv`;
                                    a.click();
                                    URL.revokeObjectURL(url);

                                    showNotif('EDI 파일이 생성되어 다운로드되었습니다.');
                                }} className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 shadow-sm transition-colors">
                                    EDI 파일 생성
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="whitespace-nowrap min-min-w-full text-sm border border-gray-200">
                                <thead className="bg-gray-100">
                                    <tr>
                                        {['이름', '직위', '기본급', '국민연금(-)', '건강보험(-)', '고용보험(-)', '실수령액'].map(h => (
                                            <th key={h} className="px-4 py-2 text-left text-xs font-semibold text-gray-600 border-r border-gray-200">{h}</th>
                                        ))}
                                        {activeTab === '급여대장출력' && (
                                            <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600 border-r border-gray-200">명세서 관리</th>
                                        )}
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
                                                <td className="px-4 py-3 text-right font-medium border-r border-gray-200">
                                                    {activeTab === '급여자료입력' ? (
                                                        <input
                                                            type="number"
                                                            value={emp.baseSalary}
                                                            onChange={(e) => {
                                                                const newSalary = parseInt(e.target.value) || 0;
                                                                setEmployees(prev => prev.map(p => p.id === emp.id ? { ...p, baseSalary: newSalary } : p));
                                                            }}
                                                            className="w-[100px] text-right border border-gray-300 rounded px-1 py-1 text-sm outline-none focus:border-indigo-500 bg-white"
                                                        />
                                                    ) : (
                                                        emp.baseSalary.toLocaleString()
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right text-red-500 border-r border-gray-200">{ins.national.toLocaleString()}</td>
                                                <td className="px-4 py-3 text-right text-red-500 border-r border-gray-200">{ins.health.toLocaleString()}</td>
                                                <td className="px-4 py-3 text-right text-red-500 border-r border-gray-200">{ins.employment.toLocaleString()}</td>
                                                <td className="px-4 py-3 text-right font-bold text-green-600">{(emp.baseSalary - total).toLocaleString()}</td>
                                                {activeTab === '급여대장출력' && (
                                                    <td className="px-4 py-3 text-center border-r border-gray-200">
                                                        <button
                                                            onClick={() => setSelectedStub(emp)}
                                                            className="inline-flex items-center gap-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-2 py-1 rounded text-xs transition-colors"
                                                        >
                                                            <FileText className="w-3 h-3 text-blue-600" />
                                                            명세서 보기
                                                        </button>
                                                    </td>
                                                )}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                                <tfoot className="bg-gray-100">
                                    <tr>
                                        <td colSpan={2} className="px-4 py-2 font-bold">합 계</td>
                                        <td className="px-4 py-2 text-right font-bold">{employees.reduce((a, e) => a + e.baseSalary, 0).toLocaleString()}</td>
                                        <td colSpan={4}></td>
                                        {activeTab === '급여대장출력' && <td></td>}
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === '4대보험 고지내역' && (
                    <div className="p-5">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-gray-900">4대보험 고지내역 대사 (계산액 vs 고지액)</h3>
                            <div className="flex gap-2">
                                <button onClick={() => setShowEdiModal(true)} className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2 font-medium shadow-sm transition-colors">
                                    <Download className="w-4 h-4" /> EDI 고지내역 가져오기
                                </button>
                                <button onClick={() => {
                                    // 4대보험 고지내역 관련 모의 EDI 데이터 파일 다운로드 로직
                                    const ediCsvData = "사원명,국민연금,건강보험,장기요양,고용보험\n" +
                                        employees.filter(e => e.isActive).map(e => {
                                            const ins = calcInsurance(e.baseSalary);
                                            return `${e.name},${ins.national},${ins.health},${ins.longterm},${ins.employment}`;
                                        }).join("\n");
                                    const blob = new Blob(['\uFEFF' + ediCsvData], { type: 'text/csv;charset=utf-8;' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `4대보험_EDI_${Date.now()}.csv`;
                                    a.click();
                                    URL.revokeObjectURL(url);
                                    showNotif('4대보험 EDI 신고 파일이 생성/다운로드되었습니다.');
                                }} className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 shadow-sm transition-colors">EDI 신고 파일</button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-min-w-full text-sm border border-gray-200 whitespace-nowrap">
                                <thead className="bg-gray-100">
                                    <tr>
                                        {['이름', '구분', '국민연금', '건강보험', '장기요양', '고용보험', '계(근로자)', '계(사용자)'].map(h => (
                                            <th key={h} className="px-3 py-2 text-center text-xs font-semibold text-gray-600 border-r border-gray-200">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {employees.filter(e => e.isActive).map((emp, index) => {
                                        const ins = calcInsurance(emp.baseSalary);
                                        const worker = ins.national + ins.health + ins.longterm + ins.employment;
                                        const employer = Math.round(worker * 1.05);

                                        // EDI 연동 결과 시뮬레이션: 일부 직원(짝수 인덱스 등)에게 모의 차액 10원~20원 발생
                                        const isDiff = hasEdiData && index % 2 === 0;
                                        const mockDiff = isDiff ? 10 : 0;
                                        const noticeHealth = ins.health + mockDiff;
                                        const noticeWorker = worker + mockDiff;
                                        const noticeEmployer = employer + mockDiff;

                                        return (
                                            <Fragment key={emp.id}>
                                                <tr key={emp.id + '_calc'} className="hover:bg-gray-50 border-b-0">
                                                    <td className="px-3 py-2 font-medium border-r border-gray-200 text-center" rowSpan={hasEdiData ? 3 : 1}>{emp.name}</td>
                                                    <td className="px-3 py-2 text-center border-r border-gray-200 bg-gray-50 text-gray-600 text-xs font-semibold">계산액</td>
                                                    <td className="px-3 py-2 text-right border-r border-gray-200 text-gray-700">{ins.national.toLocaleString()}</td>
                                                    <td className="px-3 py-2 text-right border-r border-gray-200 text-gray-700">{ins.health.toLocaleString()}</td>
                                                    <td className="px-3 py-2 text-right border-r border-gray-200 text-gray-700">{ins.longterm.toLocaleString()}</td>
                                                    <td className="px-3 py-2 text-right border-r border-gray-200 text-gray-700">{ins.employment.toLocaleString()}</td>
                                                    <td className="px-3 py-2 text-right font-bold text-red-600 border-r border-gray-200">{worker.toLocaleString()}</td>
                                                    <td className="px-3 py-2 text-right font-bold text-orange-600">{employer.toLocaleString()}</td>
                                                </tr>
                                                {hasEdiData && (
                                                    <tr key={emp.id + '_notice'} className="hover:bg-gray-50 border-b-0">
                                                        <td className="px-3 py-2 text-center border-r border-gray-200 bg-blue-50 text-blue-700 text-xs font-semibold">고지액</td>
                                                        <td className="px-3 py-2 text-right border-r border-gray-200 font-medium">{ins.national.toLocaleString()}</td>
                                                        <td className="px-3 py-2 text-right border-r border-gray-200 font-medium">{noticeHealth.toLocaleString()}</td>
                                                        <td className="px-3 py-2 text-right border-r border-gray-200 font-medium">{ins.longterm.toLocaleString()}</td>
                                                        <td className="px-3 py-2 text-right border-r border-gray-200 font-medium">{ins.employment.toLocaleString()}</td>
                                                        <td className="px-3 py-2 text-right font-bold text-blue-700 border-r border-gray-200">{noticeWorker.toLocaleString()}</td>
                                                        <td className="px-3 py-2 text-right font-bold text-blue-700">{noticeEmployer.toLocaleString()}</td>
                                                    </tr>
                                                )}
                                                {hasEdiData && (
                                                    <tr key={emp.id + '_diff'} className={isDiff ? 'bg-red-50/30' : ''}>
                                                        <td className={`px-3 py-2 text-center border-r border-gray-200 ${isDiff ? 'text-red-600' : 'text-gray-500'} text-xs font-semibold`}>차액</td>
                                                        <td className="px-3 py-2 text-right border-r border-gray-200 text-gray-500">0</td>
                                                        <td className={`px-3 py-2 text-right border-r border-gray-200 font-bold ${isDiff ? 'text-red-500' : 'text-gray-500'}`}>{mockDiff}</td>
                                                        <td className="px-3 py-2 text-right border-r border-gray-200 text-gray-500">0</td>
                                                        <td className="px-3 py-2 text-right border-r border-gray-200 text-gray-500">0</td>
                                                        <td className={`px-3 py-2 text-right font-bold ${isDiff ? 'text-red-500' : 'text-gray-500'} border-r border-gray-200`}>{mockDiff}</td>
                                                        <td className={`px-3 py-2 text-right font-bold ${isDiff ? 'text-red-500' : 'text-gray-500'}`}>{mockDiff}</td>
                                                    </tr>
                                                )}
                                            </Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
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
                            <button onClick={() => { alert('✅ 급여 내역이 현금출납부에 반영되었습니다! (시뮬레이션)'); setShowPayrollModal(false); }} className="flex-1 bg-indigo-600 text-white rounded-lg py-2 text-sm hover:bg-indigo-700">현금출납부 반영</button>
                        </div>
                    </div>
                </div>
            )}

            {/* EDI Import Modal */}
            {showEdiModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-xl p-6 w-[450px] shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">4대보험 고지내역 EDI 가져오기</h3>
                            <button onClick={() => setShowEdiModal(false)}><X className="w-5 h-5" /></button>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-[#eef4f9] p-3 rounded text-sm text-[#003366] mb-2 font-medium">
                                사회보험 EDI 사이트와 연동하여 당월 고지내역을 조회합니다.
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-semibold text-gray-700">고지월</label>
                                <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none">
                                    <option>2026년 2월</option>
                                    <option>2026년 1월</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-semibold text-gray-700">사업장 관리번호</label>
                                <input type="text" value="123-45-67890-0" readOnly className="border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm outline-none text-gray-500" />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-semibold text-gray-700">인증서 선택</label>
                                <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none">
                                    <option>사업장 공동인증서 (유치원_법인)</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2 mt-2">
                                <input type="password" placeholder="인증서 비밀번호 입력" className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none w-full" />
                            </div>
                        </div>
                        <div className="flex gap-2 pt-2">
                            <button onClick={() => setShowEdiModal(false)} className="flex-1 border border-gray-300 rounded-lg py-3 text-sm hover:bg-gray-50 font-medium text-gray-700">취소</button>
                            <button onClick={() => {
                                setHasEdiData(true);
                                setShowEdiModal(false);
                                showNotif('EDI 고지내역 연동 시뮬레이션이 완료되었습니다. (고지액 불일치 건 하이라이트 표시)');
                            }} className="flex-1 bg-indigo-600 text-white rounded-lg py-3 text-sm font-medium hover:bg-indigo-700 shadow-sm">
                                인증서 로그인 및 자료 가져오기
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* 개별 급여명세서 모달 */}
            {selectedStub && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-6 shadow-2xl w-full max-w-[500px] border border-gray-100 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900 border-b-2 border-indigo-600 pb-2 flex-1 mr-4">
                                급여명세서 (2026년 2월 귀속)
                            </h3>
                            <button onClick={() => setSelectedStub(null)} className="text-gray-400 hover:text-gray-600 bg-gray-100 p-2 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="bg-blue-50/50 rounded-xl p-4 mb-4 border border-blue-100">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-gray-600">성명</span>
                                <span className="font-bold text-gray-900 text-lg">{selectedStub.name} <span className="text-sm font-normal text-gray-500">[{selectedStub.position}]</span></span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">지급일자</span>
                                <span className="text-sm text-gray-800 font-medium">2026.02.25</span>
                            </div>
                        </div>

                        <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
                            <div className="overflow-x-auto">
                                <table className="whitespace-nowrap min-w-full text-sm">
                                    <thead>
                                        <tr>
                                            <th className="bg-gray-100 py-2 px-3 text-left border-b border-r border-gray-200 w-1/2 font-semibold">지급 내역</th>
                                            <th className="bg-gray-100 py-2 px-3 text-left border-b border-gray-200 w-1/2 font-semibold">공제 내역</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="p-3 border-r border-gray-200 align-top">
                                                <div className="flex justify-between mb-2">
                                                    <span className="text-gray-600">기본급</span>
                                                    <span className="font-medium">{selectedStub.baseSalary.toLocaleString()}원</span>
                                                </div>
                                                <div className="flex justify-between text-gray-400">
                                                    <span>직책수당</span>
                                                    <span>0원</span>
                                                </div>
                                                <div className="flex justify-between text-gray-400 mt-2">
                                                    <span>식대(비과세)</span>
                                                    <span>0원</span>
                                                </div>
                                            </td>
                                            <td className="p-3 align-top bg-red-50/20">
                                                <div className="flex justify-between mb-2">
                                                    <span className="text-gray-600">국민연금</span>
                                                    <span className="font-medium text-red-600">{calcInsurance(selectedStub.baseSalary).national.toLocaleString()}원</span>
                                                </div>
                                                <div className="flex justify-between mb-2">
                                                    <span className="text-gray-600">건강보험</span>
                                                    <span className="font-medium text-red-600">{calcInsurance(selectedStub.baseSalary).health.toLocaleString()}원</span>
                                                </div>
                                                <div className="flex justify-between mb-2">
                                                    <span className="text-gray-600">장기요양</span>
                                                    <span className="font-medium text-red-600">{calcInsurance(selectedStub.baseSalary).longterm.toLocaleString()}원</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">고용보험</span>
                                                    <span className="font-medium text-red-600">{calcInsurance(selectedStub.baseSalary).employment.toLocaleString()}원</span>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr className="bg-gray-50 border-t border-gray-200 font-bold">
                                            <td className="p-3 border-r border-gray-200 text-blue-800 flex justify-between">
                                                <span>지급합계</span>
                                                <span>{selectedStub.baseSalary.toLocaleString()}원</span>
                                            </td>
                                            <td className="p-3 text-red-700 flex justify-between">
                                                <span>공제합계</span>
                                                <span>{(
                                                    calcInsurance(selectedStub.baseSalary).national +
                                                    calcInsurance(selectedStub.baseSalary).health +
                                                    calcInsurance(selectedStub.baseSalary).longterm +
                                                    calcInsurance(selectedStub.baseSalary).employment
                                                ).toLocaleString()}원</span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="bg-green-50 rounded-xl p-5 mb-6 border border-green-100 flex justify-between items-center">
                            <span className="font-bold text-gray-700">차인지급액 (실수령액)</span>
                            <span className="text-2xl font-black text-green-700">
                                {(
                                    selectedStub.baseSalary - (
                                        calcInsurance(selectedStub.baseSalary).national +
                                        calcInsurance(selectedStub.baseSalary).health +
                                        calcInsurance(selectedStub.baseSalary).longterm +
                                        calcInsurance(selectedStub.baseSalary).employment
                                    )
                                ).toLocaleString()}
                                <span className="text-base font-bold ml-1">원</span>
                            </span>
                        </div>

                        <div className="flex justify-end pr-2 opacity-50 mb-6 relative">
                            <div className="text-sm font-bold text-gray-500 mr-2 mt-2">○○ 유치원장</div>
                            <div className="w-12 h-12 rounded-full border-2 border-red-500 text-red-500 flex justify-center items-center text-xs font-black absolute right-0 -top-2 transform rotate-[-15deg] opacity-70">
                                (인)
                            </div>
                        </div>

                        <div className="flex gap-2 pt-4 border-t border-gray-200">
                            <button onClick={() => {
                                showNotif(`${selectedStub.name} 선생님의 메일로 급여명세서 발송을 완료했습니다.`);
                                setSelectedStub(null);
                            }} className="flex-1 flex justify-center items-center gap-2 border border-blue-200 bg-blue-50 text-blue-700 rounded-lg py-3 text-sm hover:bg-blue-100 font-bold shadow-sm">
                                <Mail className="w-4 h-4" />
                                명세서 이메일 발송
                            </button>
                            <button onClick={() => {
                                window.print();
                            }} className="flex-1 flex justify-center items-center gap-2 bg-gray-800 text-white rounded-lg py-3 text-sm font-bold hover:bg-gray-900 shadow-sm">
                                <Printer className="w-4 h-4" />
                                인쇄하기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
