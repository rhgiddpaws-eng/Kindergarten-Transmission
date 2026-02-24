import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

type BasicCodeModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

export default function BasicCodeModal({ isOpen, onClose }: BasicCodeModalProps) {
    const [activeTab, setActiveTab] = useState('positions');

    const [positions, setPositions] = useState([
        { id: 1, name: '원장' }, { id: 2, name: '원감' }, { id: 3, name: '교사' }, { id: 4, name: '조리사' }
    ]);
    const [allowances, setAllowances] = useState([
        { id: 1, name: '기본급' }, { id: 2, name: '직책수당' }, { id: 3, name: '가족수당' }
    ]);
    const [deductions, setDeductions] = useState([
        { id: 1, name: '소득세' }, { id: 2, name: '지방소득세' }, { id: 3, name: '건강보험' }, { id: 4, name: '국민연금' }, { id: 5, name: '고용보험' }
    ]);

    const [newItemName, setNewItemName] = useState('');

    if (!isOpen) return null;

    const handleAdd = () => {
        if (!newItemName.trim()) return;

        if (activeTab === 'positions') {
            setPositions([...positions, { id: Date.now(), name: newItemName }]);
        } else if (activeTab === 'allowances') {
            setAllowances([...allowances, { id: Date.now(), name: newItemName }]);
        } else {
            setDeductions([...deductions, { id: Date.now(), name: newItemName }]);
        }
        setNewItemName('');
    };

    const handleRemove = (id: number) => {
        if (activeTab === 'positions') setPositions(positions.filter(p => p.id !== id));
        else if (activeTab === 'allowances') setAllowances(allowances.filter(a => a.id !== id));
        else setDeductions(deductions.filter(d => d.id !== id));
    };

    const currentList = activeTab === 'positions' ? positions : activeTab === 'allowances' ? allowances : deductions;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">기초코드 등록</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('positions')}
                        className={`px-6 py-3 text-sm font-medium ${activeTab === 'positions' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        직책 등록
                    </button>
                    <button
                        onClick={() => setActiveTab('allowances')}
                        className={`px-6 py-3 text-sm font-medium ${activeTab === 'allowances' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        지급항목 등록
                    </button>
                    <button
                        onClick={() => setActiveTab('deductions')}
                        className={`px-6 py-3 text-sm font-medium ${activeTab === 'deductions' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        공제항목 등록
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                        <div className="p-4 border-b border-gray-200 flex gap-2">
                            <input
                                type="text"
                                value={newItemName}
                                onChange={(e) => setNewItemName(e.target.value)}
                                placeholder="새 항목 이름 입력"
                                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                            />
                            <button
                                onClick={handleAdd}
                                className="bg-indigo-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-indigo-700 transition font-medium text-sm"
                            >
                                <Plus className="w-4 h-4" /> 추가
                            </button>
                        </div>
                        <ul className="divide-y divide-gray-100">
                            {currentList.map(item => (
                                <li key={item.id} className="flex justify-between items-center p-4 hover:bg-gray-50 transition">
                                    <span className="text-sm font-medium text-gray-800">{item.name}</span>
                                    <button
                                        onClick={() => handleRemove(item.id)}
                                        className="text-gray-400 hover:text-red-500 transition p-1"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-200 bg-white flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 transition shadow-sm">
                        확인 및 닫기
                    </button>
                </div>
            </div>
        </div>
    );
}
