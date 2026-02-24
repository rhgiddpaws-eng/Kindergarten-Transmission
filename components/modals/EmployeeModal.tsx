import { useState } from 'react';
import { X, Save } from 'lucide-react';

type EmployeeModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSave: (employee: any) => void;
};

export default function EmployeeModal({ isOpen, onClose, onSave }: EmployeeModalProps) {
    const [name, setName] = useState('');
    const [position, setPosition] = useState('교사');
    const [joined, setJoined] = useState(new Date().toISOString().split('T')[0]);
    const [salary, setSalary] = useState('');

    if (!isOpen) return null;

    const handleSave = () => {
        if (!name || !salary) {
            alert('이름과 기본급을 입력해주세요.');
            return;
        }

        onSave({
            id: Math.random().toString(),
            name,
            position,
            joined,
            salary: Number(salary),
            isNew: true
        });

        setName('');
        setSalary('');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">사원 개별 등록</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 flex-1 bg-gray-50 flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">성명</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="사원명 (예: 홍길동)"
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">직책</label>
                        <select
                            value={position}
                            onChange={(e) => setPosition(e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                        >
                            <option value="원장">원장</option>
                            <option value="원감">원감</option>
                            <option value="교사">교사</option>
                            <option value="조리사">조리사</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">입사일</label>
                        <input
                            type="date"
                            value={joined}
                            onChange={(e) => setJoined(e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">계약 기본급</label>
                        <input
                            type="number"
                            value={salary}
                            onChange={(e) => setSalary(e.target.value)}
                            placeholder="0"
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                        />
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-200 bg-white flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                        취소
                    </button>
                    <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 transition shadow-sm">
                        <Save className="w-4 h-4" /> 저장
                    </button>
                </div>
            </div>
        </div>
    );
}
