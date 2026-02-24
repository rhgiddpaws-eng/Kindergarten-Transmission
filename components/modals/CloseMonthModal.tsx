import { X, Lock, AlertTriangle } from 'lucide-react';

type CloseMonthModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    month: string;
};

export default function CloseMonthModal({ isOpen, onClose, onConfirm, month }: CloseMonthModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col scale-in-center">
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2 text-red-600 font-bold">
                        <Lock className="w-5 h-5" />
                        <h2>입력 마감 (조정 마감)</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition rounded-full hover:bg-gray-100 p-1">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-5 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <div className="text-sm text-amber-800 leading-relaxed">
                            <span className="font-bold underline">{month}월분</span> 현금출납부를 최종 마감하시겠습니까?<br />
                            조정 마감 후에는 현금출납부의 데이터를 수정하거나 취소하실 수 없습니다.
                        </div>
                    </div>

                    <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5 mb-2">
                        <li>계좌의 실제 잔액과 장부 잔액 일치 여부 확인 완료</li>
                        <li>모든 에듀파인 전송 대상 전표 전송 완료</li>
                        <li>증빙 서류 편철 사항 검토 완료</li>
                    </ul>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition shadow-sm">
                        취소 (수정 진행)
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 transition shadow-sm flex items-center gap-2"
                    >
                        마감 확정
                    </button>
                </div>
            </div>
        </div>
    );
}
