'use client';

import { useState } from 'react';
import { MOCK_TRANSACTIONS } from '../../../lib/mockData';
import { Send, AlertCircle, CheckCircle2, XCircle, Clock, Play, RotateCcw } from 'lucide-react';

export default function TransmissionClient() {
    const [allTx, setAllTx] = useState(MOCK_TRANSACTIONS);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [transmitting, setTransmitting] = useState(false);
    const [log, setLog] = useState<Array<{ time: string; msg: string; type: 'info' | 'success' | 'error' }>>([]);
    const [progress, setProgress] = useState(0);

    const pendingTx = allTx.filter(t => t.status === 'PENDING');
    const transmittedTx = allTx.filter(t => t.status === 'TRANSMITTED');
    const failedTx = allTx.filter(t => t.status === 'FAILED');

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedIds(e.target.checked ? pendingTx.map(t => t.id) : []);
    };

    const addLog = (msg: string, type: 'info' | 'success' | 'error' = 'info') => {
        const time = new Date().toLocaleTimeString('ko-KR');
        setLog(prev => [...prev, { time, msg, type }]);
    };

    const handleTransmit = async () => {
        const targets = selectedIds.length > 0 ? selectedIds : pendingTx.map(t => t.id);
        if (targets.length === 0) {
            alert('전송할 항목이 없습니다.');
            return;
        }

        setTransmitting(true);
        setLog([]);
        setProgress(0);

        addLog('🤖 RPA 로봇 초기화 중...');
        await sleep(800);
        addLog('🌐 에듀파인 사이트 접속 중...');
        await sleep(700);
        setProgress(10);
        addLog('🔑 로그인 처리 중...');
        await sleep(600);
        setProgress(25);
        addLog('📂 장부 메뉴로 이동...');
        await sleep(500);
        setProgress(40);

        for (let i = 0; i < targets.length; i++) {
            const tx = allTx.find(t => t.id === targets[i]);
            addLog(`📝 [${i + 1}/${targets.length}] ${tx?.description || ''} 입력 중...`);
            await sleep(400);
            const success = Math.random() > 0.1; // 90% 성공률
            if (success) {
                addLog(`  ✅ 전송 성공: ${tx?.amount.toLocaleString()}원`, 'success');
            } else {
                addLog(`  ❌ 전송 실패: 계정코드 오류`, 'error');
            }
            setProgress(40 + Math.round((i + 1) / targets.length * 55));
            setAllTx(prev => prev.map(t =>
                t.id === targets[i] ? { ...t, status: success ? 'TRANSMITTED' : 'FAILED' } : t
            ));
        }

        setProgress(100);
        addLog(`🎉 전송 완료! 총 ${targets.length}건 처리`, 'success');
        setTransmitting(false);
        setSelectedIds([]);
    };

    const handleReset = () => {
        setAllTx(MOCK_TRANSACTIONS.map(t => ({ ...t, status: 'PENDING' as const })));
        setLog([]);
        setProgress(0);
        setSelectedIds([]);
    };

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-gray-900">K-에듀파인 자동전송</h1>
                    <p className="text-sm text-gray-500 mt-1">분개 완료된 거래를 선택하여 에듀파인에 자동으로 전송합니다.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleReset} className="border border-gray-300 flex items-center gap-2 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-all">
                        <RotateCcw className="w-4 h-4" />
                        초기화
                    </button>
                    <button
                        onClick={handleTransmit}
                        disabled={transmitting}
                        className="bg-indigo-600 flex items-center gap-2 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm hover:bg-indigo-700 transition-all disabled:opacity-60"
                    >
                        <Play className={`w-4 h-4 ${transmitting ? 'animate-pulse' : ''}`} />
                        {transmitting ? 'RPA 전송 중...' : '에듀파인 자동전송 시작'}
                    </button>
                </div>
            </div>

            {/* Progress Bar (전송 중에만 표시) */}
            {transmitting && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                    <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">전송 진행률</span>
                        <span className="text-sm font-medium text-indigo-600">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                            className="bg-indigo-600 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Status Sidebar */}
                <div className="col-span-1 space-y-4">
                    {/* Status Cards */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-indigo-500" />
                            전송 현황
                        </h3>
                        <ul className="space-y-3 text-sm">
                            <li className="flex justify-between items-center">
                                <span className="flex items-center gap-2 text-amber-600"><Clock className="w-4 h-4" /> 대기 중</span>
                                <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">{allTx.filter(t => t.status === 'PENDING').length}건</span>
                            </li>
                            <li className="flex justify-between items-center">
                                <span className="flex items-center gap-2 text-green-600"><CheckCircle2 className="w-4 h-4" /> 전송 완료</span>
                                <span className="font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">{allTx.filter(t => t.status === 'TRANSMITTED').length}건</span>
                            </li>
                            <li className="flex justify-between items-center">
                                <span className="flex items-center gap-2 text-red-600"><XCircle className="w-4 h-4" /> 실패</span>
                                <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">{allTx.filter(t => t.status === 'FAILED').length}건</span>
                            </li>
                        </ul>
                    </div>

                    {/* RPA Log */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                        <h3 className="font-semibold text-gray-900 mb-3">🤖 RPA 전송 로그</h3>
                        <div className="bg-gray-900 rounded-lg p-3 h-[200px] overflow-y-auto font-mono text-xs">
                            {log.length === 0 ? (
                                <p className="text-gray-500">전송 시작 전...</p>
                            ) : (
                                log.map((l, i) => (
                                    <div key={i} className={`mb-1 ${l.type === 'success' ? 'text-green-400' : l.type === 'error' ? 'text-red-400' : 'text-gray-300'}`}>
                                        <span className="text-gray-500">[{l.time}] </span>{l.msg}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Pending Slips List */}
                <div className="col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                        <h3 className="font-semibold text-gray-900">
                            전송 대기 목록 ({allTx.filter(t => t.status === 'PENDING').length}건)
                        </h3>
                        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                            <input
                                type="checkbox"
                                onChange={handleSelectAll}
                                checked={selectedIds.length === pendingTx.length && pendingTx.length > 0}
                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            전체 선택
                        </label>
                    </div>

                    <div className="overflow-auto flex-1 divide-y divide-gray-100">
                        {allTx.filter(t => t.status === 'PENDING').length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-40 text-gray-500 space-y-3">
                                <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                                <p className="font-medium">모든 전표가 에듀파인으로 전송되었습니다!</p>
                            </div>
                        ) : (
                            allTx.filter(t => t.status === 'PENDING').map(t => (
                                <div key={t.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => toggleSelect(t.id)}>
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(t.id)}
                                        onChange={() => toggleSelect(t.id)}
                                        onClick={e => e.stopPropagation()}
                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <div className="flex-1">
                                        <div className="flex justify-between">
                                            <span className="font-medium text-sm text-gray-900">{t.description}</span>
                                            <span className={`font-bold text-sm ${t.type === 'INCOME' ? 'text-blue-600' : 'text-red-600'}`}>
                                                {t.type === 'INCOME' ? '+' : '-'}{t.amount.toLocaleString()}원
                                            </span>
                                        </div>
                                        <div className="flex justify-between mt-1">
                                            <span className="text-xs text-gray-500">{t.date} · {t.accountCode.name}</span>
                                            <span className="text-xs text-gray-500 font-mono">{t.accountCode.code} ({t.type === 'INCOME' ? '수입' : '지출'})</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Transmitted section */}
                    {allTx.filter(t => t.status === 'TRANSMITTED').length > 0 && (
                        <>
                            <div className="px-5 py-3 border-t-2 border-green-200 bg-green-50">
                                <h4 className="text-sm font-semibold text-green-700">✅ 전송 완료 ({allTx.filter(t => t.status === 'TRANSMITTED').length}건)</h4>
                            </div>
                            <div className="divide-y divide-gray-100 max-h-[200px] overflow-y-auto">
                                {allTx.filter(t => t.status === 'TRANSMITTED').slice(0, 5).map(t => (
                                    <div key={t.id} className="flex items-center gap-4 px-5 py-3 bg-green-50/50">
                                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                        <div className="flex-1">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600 line-through">{t.description}</span>
                                                <span className="text-sm text-green-600 font-medium">{t.amount.toLocaleString()}원</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }
