import { useState } from 'react';
import { X, FileText, CheckCircle2 } from 'lucide-react';

type InsuranceEDIModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

export default function InsuranceEDIModal({ isOpen, onClose }: InsuranceEDIModalProps) {
    const [activeTab, setActiveTab] = useState('health');
    const [isLoading, setIsLoading] = useState(false);
    const [isSynced, setIsSynced] = useState(false);

    if (!isOpen) return null;

    const handleSync = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setIsSynced(true);
        }, 2000);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">4대보험 고지내역 연동 (EDI 통합방식)</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('health')}
                        className={`px-6 py-3 text-sm font-medium ${activeTab === 'health' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        건강보험 EDI
                    </button>
                    <button
                        onClick={() => setActiveTab('pension')}
                        className={`px-6 py-3 text-sm font-medium ${activeTab === 'pension' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        국민연금 EDI
                    </button>
                    <button
                        onClick={() => setActiveTab('employment')}
                        className={`px-6 py-3 text-sm font-medium ${activeTab === 'employment' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        고용/산재 EDI
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 bg-gray-50 min-h-[300px] flex flex-col items-center justify-center">

                    {activeTab === 'health' && (
                        <div className="w-full max-w-md bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">건강보험 EDI 인증서 로그인</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">사업장 관리번호 (교원: 끝자리 2, 직원: 0)</label>
                                    <input type="text" placeholder="11자리 숫자 기입" className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-indigo-500 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">EDI 아이디</label>
                                    <input type="text" placeholder="아이디 입력" className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-indigo-500 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">비밀번호</label>
                                    <input type="password" placeholder="비밀번호 입력" className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-indigo-500 text-sm" />
                                </div>
                            </div>

                            <div className="mt-6 flex justify-center">
                                {!isSynced ? (
                                    <button
                                        onClick={handleSync}
                                        disabled={isLoading}
                                        className="w-full bg-indigo-600 text-white font-medium py-2 rounded hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent flex items-center justify-center rounded-full animate-spin"></div>
                                                인증 및 고지내역 스크래핑 중...
                                            </>
                                        ) : (
                                            <>
                                                인증서 등록 및 고지내역 가져오기
                                            </>
                                        )}
                                    </button>
                                ) : (
                                    <div className="w-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium py-2 rounded flex items-center justify-center gap-2">
                                        <CheckCircle2 className="w-5 h-5" /> 연동 및 4월분 고지내역 반영 완료
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab !== 'health' && (
                        <div className="text-center text-gray-500">
                            <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                            <p>건강보험 EDI와 유사한 인증 프로세스를 따릅니다.</p>
                            <p className="text-xs mt-1">(데모 환경에서는 건강보험 탭에서 스크래핑 프로세스를 확인해주세요)</p>
                        </div>
                    )}

                </div>

                <div className="px-6 py-4 border-t border-gray-200 bg-white flex justify-end gap-2">
                    <button onClick={onClose} className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
}
