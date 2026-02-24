'use client';

import { useState } from 'react';
import { MOCK_KINDERGARTENS, Kindergarten } from '../../../lib/mockData';
import { Plus, Edit, Trash2, Key, Shield, X, CheckCircle2, Building2 } from 'lucide-react';

export default function KindergartensClient() {
    const [kindergartens, setKindergartens] = useState<Kindergarten[]>(MOCK_KINDERGARTENS);
    const [showAdd, setShowAdd] = useState(false);
    const [editTarget, setEditTarget] = useState<Kindergarten | null>(null);
    const [form, setForm] = useState({ name: '', edufineId: '', edufinePw: '' });
    const [notification, setNotification] = useState<string | null>(null);

    const showNotif = (msg: string) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 3000);
    };

    const handleAdd = () => {
        if (!form.name || !form.edufineId) { alert('유치원명과 에듀파인 ID를 입력하세요.'); return; }
        const newKg: Kindergarten = {
            id: `kg${Date.now()}`,
            name: form.name,
            edufineId: form.edufineId,
            isActive: true,
            createdAt: new Date().toISOString().split('T')[0],
            bankAccounts: [],
        };
        setKindergartens(prev => [newKg, ...prev]);
        setShowAdd(false);
        setForm({ name: '', edufineId: '', edufinePw: '' });
        showNotif('✅ 유치원이 등록되었습니다!');
    };

    const handleEdit = () => {
        if (!editTarget) return;
        setKindergartens(prev => prev.map(kg => kg.id === editTarget.id ? { ...kg, ...form, isActive: kg.isActive } : kg));
        setEditTarget(null);
        showNotif('✅ 정보가 수정되었습니다!');
    };

    const handleDelete = (id: string) => {
        if (!confirm('정말 삭제하시겠습니까?')) return;
        setKindergartens(prev => prev.filter(kg => kg.id !== id));
        showNotif('🗑️ 삭제되었습니다.');
    };

    const handleToggleActive = (id: string) => {
        setKindergartens(prev => prev.map(kg => kg.id === id ? { ...kg, isActive: !kg.isActive } : kg));
    };

    return (
        <div className="space-y-5">
            {notification && (
                <div className="fixed top-5 right-5 z-50 bg-green-600 text-white px-5 py-3 rounded-lg shadow-xl flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />{notification}
                </div>
            )}

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">유치원 관리</h1>
                    <p className="text-gray-500 mt-1 text-sm">유치원 정보 및 에듀파인 접속 정보를 관리합니다.</p>
                </div>
                <button onClick={() => { setShowAdd(true); setForm({ name: '', edufineId: '', edufinePw: '' }); }} className="bg-indigo-600 flex items-center gap-2 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
                    <Plus className="w-4 h-4" />
                    유치원 등록
                </button>
            </div>

            {/* Modal */}
            {(showAdd || editTarget) && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-xl p-6 w-[420px] shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">{showAdd ? '유치원 등록' : '유치원 정보 수정'}</h3>
                            <button onClick={() => { setShowAdd(false); setEditTarget(null); }}><X className="w-5 h-5" /></button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-gray-700">유치원명 *</label>
                                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="예: 햇살 유치원" className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">에듀파인 ID *</label>
                                <input value={form.edufineId} onChange={e => setForm(f => ({ ...f, edufineId: e.target.value }))} placeholder="에듀파인 로그인 ID" className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">에듀파인 비밀번호 (암호화 저장)</label>
                                <input type="password" value={form.edufinePw} onChange={e => setForm(f => ({ ...f, edufinePw: e.target.value }))} placeholder="비밀번호" className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                        </div>
                        <div className="flex gap-2 mt-5">
                            <button onClick={() => { setShowAdd(false); setEditTarget(null); }} className="flex-1 border border-gray-300 rounded-lg py-2 text-sm hover:bg-gray-50">취소</button>
                            <button onClick={showAdd ? handleAdd : handleEdit} className="flex-1 bg-indigo-600 text-white rounded-lg py-2 text-sm hover:bg-indigo-700">
                                {showAdd ? '등록' : '저장'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {kindergartens.map(kg => (
                    <div key={kg.id} className={`bg-white rounded-xl border shadow-sm p-5 hover:shadow-md transition-shadow ${kg.isActive ? 'border-gray-200' : 'border-gray-100 opacity-70'}`}>
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${kg.isActive ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
                                    <Building2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{kg.name}</h3>
                                    <p className="text-xs text-gray-400">등록일: {kg.createdAt}</p>
                                </div>
                            </div>
                            <button onClick={() => handleToggleActive(kg.id)}>
                                <span className={`px-2 py-0.5 text-xs rounded-full font-medium cursor-pointer ${kg.isActive ? 'bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-700' : 'bg-gray-100 text-gray-500 hover:bg-green-100 hover:text-green-700'}`}>
                                    {kg.isActive ? '활성' : '비활성'}
                                </span>
                            </button>
                        </div>

                        <div className="space-y-2 text-sm border-t border-gray-100 pt-3">
                            <div className="flex items-center gap-2 text-gray-600">
                                <Key className="w-4 h-4 text-green-500 flex-shrink-0" />
                                <span>에듀파인 ID: <strong>{kg.edufineId}</strong></span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <Shield className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                <span>비밀번호: <span className="font-mono">●●●●●●</span> (암호화)</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <span className="text-gray-400">계좌:</span>
                                <span>{kg.bankAccounts.length}개 연결</span>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={() => { setEditTarget(kg); setForm({ name: kg.name, edufineId: kg.edufineId, edufinePw: '' }); }}
                                className="flex-1 flex items-center justify-center gap-1 text-sm border border-gray-300 rounded-lg py-1.5 hover:bg-gray-50 text-gray-700 transition-colors"
                            >
                                <Edit className="w-3.5 h-3.5" /> 수정
                            </button>
                            <button
                                onClick={() => handleDelete(kg.id)}
                                className="flex items-center justify-center gap-1 text-sm border border-red-200 text-red-600 rounded-lg px-3 py-1.5 hover:bg-red-50 transition-colors"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
