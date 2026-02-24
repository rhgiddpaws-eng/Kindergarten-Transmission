'use client';

import { useState } from 'react';
import { MOCK_USERS, User } from '../../../lib/mockData';
import { Plus, Edit, Trash2, X, CheckCircle2, Users } from 'lucide-react';

export default function UsersClient() {
    const [users, setUsers] = useState<User[]>(MOCK_USERS);
    const [showAdd, setShowAdd] = useState(false);
    const [editTarget, setEditTarget] = useState<User | null>(null);
    const [form, setForm] = useState({ name: '', email: '', role: 'STAFF' as 'ADMIN' | 'STAFF' });
    const [notification, setNotification] = useState<string | null>(null);

    const showNotif = (msg: string) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 3000);
    };

    const handleAdd = () => {
        if (!form.name || !form.email) { alert('이름과 이메일을 입력하세요.'); return; }
        const newUser: User = {
            id: `u${Date.now()}`,
            name: form.name,
            email: form.email,
            role: form.role,
            createdAt: new Date().toISOString().split('T')[0],
        };
        setUsers(prev => [newUser, ...prev]);
        setShowAdd(false);
        setForm({ name: '', email: '', role: 'STAFF' });
        showNotif('✅ 사용자가 추가되었습니다!');
    };

    const handleEdit = () => {
        if (!editTarget) return;
        setUsers(prev => prev.map(u => u.id === editTarget.id ? { ...u, ...form } : u));
        setEditTarget(null);
        showNotif('✅ 정보가 수정되었습니다!');
    };

    const handleDelete = (id: string) => {
        if (!confirm('이 사용자를 삭제하시겠습니까?')) return;
        setUsers(prev => prev.filter(u => u.id !== id));
        showNotif('🗑️ 삭제되었습니다.');
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
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">사용자 관리</h1>
                    <p className="text-gray-500 mt-1 text-sm">시스템 관리자 및 직원 계정을 관리합니다.</p>
                </div>
                <button onClick={() => { setShowAdd(true); setForm({ name: '', email: '', role: 'STAFF' }); }} className="bg-indigo-600 flex items-center gap-2 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
                    <Plus className="w-4 h-4" />
                    사용자 추가
                </button>
            </div>

            {/* Modal */}
            {(showAdd || editTarget) && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-xl p-6 w-[400px] shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">{showAdd ? '사용자 추가' : '사용자 수정'}</h3>
                            <button onClick={() => { setShowAdd(false); setEditTarget(null); }}><X className="w-5 h-5" /></button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-gray-700">이름 *</label>
                                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">이메일 *</label>
                                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">권한</label>
                                <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as 'ADMIN' | 'STAFF' }))} className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                                    <option value="STAFF">일반 직원</option>
                                    <option value="ADMIN">관리자</option>
                                </select>
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

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {['이름', '이메일', '권한', '등록일', '관리'].map(h => (
                                <th key={h} scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                <Users className="w-12 h-12 text-gray-200 mx-auto mb-2" />
                                등록된 사용자가 없습니다.
                            </td></tr>
                        ) : users.map(user => (
                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                                            {user.name.charAt(0)}
                                        </div>
                                        <span className="text-sm font-medium text-gray-900">{user.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                                        {user.role === 'ADMIN' ? '관리자' : '직원'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{user.createdAt}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex gap-2">
                                        <button onClick={() => { setEditTarget(user); setForm({ name: user.name, email: user.email, role: user.role }); }} className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50 transition-colors">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
