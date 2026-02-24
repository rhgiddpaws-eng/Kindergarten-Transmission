'use client';

import { useState } from 'react';
import { MOCK_KEYWORDS, MOCK_ACCOUNT_CODES } from '../lib/mockData';
import { Plus, Trash2, Save, CheckCircle2, X, Settings, Key, CreditCard } from 'lucide-react';

type SettingsTab = '키워드설정' | '기초자료설정' | '시스템설정';

type Keyword = { id: string; keyword: string; accountCode: string; accountCodeId: string };

export default function SettingsClient() {
    const [activeTab, setActiveTab] = useState<SettingsTab>('키워드설정');
    const [keywords, setKeywords] = useState<Keyword[]>(MOCK_KEYWORDS);
    const [newKeyword, setNewKeyword] = useState('');
    const [newKeywordAccountId, setNewKeywordAccountId] = useState('');
    const [notification, setNotification] = useState<string | null>(null);
    const [bankMappings, setBankMappings] = useState([
        { id: 'bm1', bankName: '농협중앙회', accountNumber: '352-0611-1234-56', accountCodeId: 'ac1', accountCodeName: '원비 수입' },
        { id: 'bm2', bankName: '국민은행', accountNumber: '123-456-789012', accountCodeId: 'ac2', accountCodeName: '보조금 수입' },
    ]);

    const showNotif = (msg: string) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 3000);
    };

    const handleAddKeyword = () => {
        if (!newKeyword || !newKeywordAccountId) { alert('키워드와 계정을 모두 선택하세요.'); return; }
        const ac = MOCK_ACCOUNT_CODES.find(a => a.id === newKeywordAccountId);
        if (!ac) return;
        setKeywords(prev => [...prev, {
            id: `kw${Date.now()}`, keyword: newKeyword, accountCode: ac.name, accountCodeId: ac.id
        }]);
        setNewKeyword('');
        setNewKeywordAccountId('');
        showNotif('✅ 키워드가 추가되었습니다!');
    };

    const handleDeleteKeyword = (id: string) => {
        setKeywords(prev => prev.filter(k => k.id !== id));
        showNotif('🗑️ 키워드가 삭제되었습니다.');
    };

    const tabs: SettingsTab[] = ['키워드설정', '기초자료설정', '시스템설정'];

    return (
        <div className="space-y-4">
            {notification && (
                <div className="fixed top-5 right-5 z-50 bg-green-600 text-white px-5 py-3 rounded-lg shadow-xl flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />{notification}
                </div>
            )}

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">설정</h1>
                    <p className="text-gray-500 mt-1 text-sm">시스템 설정 및 기초자료를 관리합니다.</p>
                </div>
                <button onClick={() => showNotif('✅ 모든 설정이 저장되었습니다!')} className="bg-indigo-600 flex items-center gap-2 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700">
                    <Save className="w-4 h-4" />설정 저장
                </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="flex border-b border-gray-200 bg-gray-50">
                    {tabs.map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === tab ? 'border-indigo-600 text-indigo-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                            {tab}
                        </button>
                    ))}
                </div>

                {/* === 키워드 설정 === */}
                {activeTab === '키워드설정' && (
                    <div className="p-6 space-y-5">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
                            💡 <strong>키워드 자동분개:</strong> 은행 거래내역에서 키워드가 포함된 경우 지정된 계정으로 자동 분개됩니다.
                        </div>

                        {/* Add keyword form */}
                        <div className="flex gap-2 items-end">
                            <div className="flex-1">
                                <label className="text-sm font-medium text-gray-700 mb-1 block">키워드 (거래 적요에 포함된 단어)</label>
                                <input
                                    value={newKeyword}
                                    onChange={e => setNewKeyword(e.target.value)}
                                    placeholder="예: 이마트, KT, 한국전력..."
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="text-sm font-medium text-gray-700 mb-1 block">자동 분개 계정</label>
                                <select
                                    value={newKeywordAccountId}
                                    onChange={e => setNewKeywordAccountId(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                >
                                    <option value="">계정 선택</option>
                                    {MOCK_ACCOUNT_CODES.map(ac => (
                                        <option key={ac.id} value={ac.id}>{ac.code} - {ac.name}</option>
                                    ))}
                                </select>
                            </div>
                            <button onClick={handleAddKeyword} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 flex items-center gap-1 flex-shrink-0">
                                <Plus className="w-4 h-4" />추가
                            </button>
                        </div>

                        {/* Keywords table */}
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">키워드</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">자동 분개 계정</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">삭제</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {keywords.map(kw => (
                                        <tr key={kw.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium text-gray-900">
                                                <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-xs font-mono">{kw.keyword}</span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-600">{kw.accountCode}</td>
                                            <td className="px-4 py-3">
                                                <button onClick={() => handleDeleteKeyword(kw.id)} className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* === 기초자료 설정 === */}
                {activeTab === '기초자료설정' && (
                    <div className="p-6 space-y-6">
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-indigo-500" />
                                계좌-계정 매핑 설정
                            </h3>
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700 mb-4">
                                💡 계좌별로 기본 계정을 매핑해두면 계좌에서 가져온 거래가 자동으로 해당 계정에 분류됩니다.
                            </div>
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <table className="min-w-full text-sm divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">은행명</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">계좌번호</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">기본 계정과목</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">관리</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 bg-white">
                                        {bankMappings.map(bm => (
                                            <tr key={bm.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 font-medium">{bm.bankName}</td>
                                                <td className="px-4 py-3 font-mono text-xs text-gray-600">{bm.accountNumber}</td>
                                                <td className="px-4 py-3">
                                                    <select
                                                        defaultValue={bm.accountCodeId}
                                                        onChange={e => {
                                                            const ac = MOCK_ACCOUNT_CODES.find(a => a.id === e.target.value);
                                                            setBankMappings(prev => prev.map(m => m.id === bm.id ? { ...m, accountCodeId: e.target.value, accountCodeName: ac?.name || '' } : m));
                                                        }}
                                                        className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                                    >
                                                        {MOCK_ACCOUNT_CODES.map(ac => (
                                                            <option key={ac.id} value={ac.id}>{ac.code} - {ac.name}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <button onClick={() => { setBankMappings(prev => prev.filter(m => m.id !== bm.id)); showNotif('🗑️ 삭제되었습니다.'); }} className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* 유치원 기본 정보 */}
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <Settings className="w-4 h-4 text-indigo-500" />
                                유치원 기본 정보
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { label: '유치원명', value: '햇살 유치원', type: 'text' },
                                    { label: '사업자번호', value: '123-45-67890', type: 'text' },
                                    { label: '에듀파인 기관코드', value: 'E12345', type: 'text' },
                                    { label: '회계연도', value: '2026', type: 'text' },
                                    { label: '원장명', value: '김지현', type: 'text' },
                                    { label: '전화번호', value: '031-123-4567', type: 'tel' },
                                ].map(field => (
                                    <div key={field.label}>
                                        <label className="text-sm font-medium text-gray-700 mb-1 block">{field.label}</label>
                                        <input type={field.type} defaultValue={field.value} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* === 시스템 설정 === */}
                {activeTab === '시스템설정' && (
                    <div className="p-6 space-y-5">
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <Key className="w-4 h-4 text-indigo-500" />
                                에듀파인 자동전송 설정
                            </h3>
                            <div className="space-y-3">
                                {[
                                    { label: '자동전송 스케줄', type: 'checkbox', checked: true, desc: '매일 오전 9시 자동전송 실행' },
                                    { label: '전송 실패 시 재시도', type: 'checkbox', checked: true, desc: '실패 후 30분 간격으로 3회 재시도' },
                                    { label: '전송 완료 이메일 알림', type: 'checkbox', checked: false, desc: '전송 완료 시 관리자 이메일 발송' },
                                ].map((opt, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <input type="checkbox" defaultChecked={opt.checked} className="mt-0.5 rounded border-gray-300 text-indigo-600" />
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{opt.label}</div>
                                            <div className="text-xs text-gray-500 mt-0.5">{opt.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-gray-900 mb-3">데이터 관리</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={() => alert('백업 파일이 다운로드됩니다. (목업)')} className="border border-gray-300 rounded-lg p-4 text-left hover:bg-gray-50 transition-colors">
                                    <div className="font-medium text-sm mb-1">📦 데이터 백업</div>
                                    <div className="text-xs text-gray-500">현재 데이터를 JSON 파일로 저장</div>
                                </button>
                                <button onClick={() => alert('데이터 초기화 기능은 실제 배포 환경에서만 동작합니다.')} className="border border-red-200 rounded-lg p-4 text-left hover:bg-red-50 transition-colors">
                                    <div className="font-medium text-sm mb-1 text-red-600">🗑️ 데이터 초기화</div>
                                    <div className="text-xs text-gray-500">모든 거래 데이터 삭제 (주의!)</div>
                                </button>
                            </div>
                        </div>

                        <div className="bg-gray-900 rounded-lg p-4 text-xs font-mono">
                            <div className="text-gray-400 mb-2">시스템 정보</div>
                            <div className="text-green-400">버전: 아이큐브 v2.0.0 (목업 모드)</div>
                            <div className="text-gray-400">환경: Vercel Edge Runtime</div>
                            <div className="text-gray-400">DB: 목업 데이터 (in-memory)</div>
                            <div className="text-gray-400">빌드: {new Date().toLocaleDateString('ko-KR')}</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
