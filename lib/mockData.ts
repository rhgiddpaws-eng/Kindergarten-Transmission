// ============================================================
// 목업 데이터 - Vercel 배포용 (DB 없이 동작)
// ============================================================

export type TransactionType = 'INCOME' | 'EXPENSE';
export type TransactionStatus = 'PENDING' | 'TRANSMITTED' | 'FAILED';

export interface AccountCode {
    id: string;
    code: string;
    name: string;
    type: TransactionType;
}

export interface Kindergarten {
    id: string;
    name: string;
    edufineId: string;
    isActive: boolean;
    createdAt: string;
    bankAccounts: BankAccount[];
}

export interface BankAccount {
    id: string;
    bankName: string;
    accountNumber: string;
    ownerName: string;
    kindergartenId: string;
    lastSynced?: string;
}

export interface Transaction {
    id: string;
    type: TransactionType;
    date: string;
    amount: number;
    description: string;
    status: TransactionStatus;
    kindergartenId: string;
    accountCodeId: string;
    accountCode: AccountCode;
    kindergarten: { id: string; name: string };
    clientName?: string;
    bankName?: string;
    balance?: number;
    journaled?: boolean;
}

export interface Employee {
    id: string;
    name: string;
    position: string;
    department: string;
    hireDate: string;
    baseSalary: number;
    isActive: boolean;
}

export interface BudgetItem {
    id: string;
    code: string;
    category: string;
    name: string;
    budgetAmount: number;
    executedAmount: number;
    remainingAmount: number;
    type: TransactionType;
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'STAFF';
    createdAt: string;
}

// ============================================================
// 계정과목 (계좌 코드)
// ============================================================
export const MOCK_ACCOUNT_CODES: AccountCode[] = [
    { id: 'ac1', code: '111', name: '원비 수입', type: 'INCOME' },
    { id: 'ac2', code: '112', name: '보조금 수입', type: 'INCOME' },
    { id: 'ac3', code: '113', name: '급식비 수입', type: 'INCOME' },
    { id: 'ac4', code: '114', name: '특별활동비 수입', type: 'INCOME' },
    { id: 'ac5', code: '115', name: 'CMS 수입', type: 'INCOME' },
    { id: 'ac6', code: '411', name: '인건비', type: 'EXPENSE' },
    { id: 'ac7', code: '412', name: '급식비 지출', type: 'EXPENSE' },
    { id: 'ac8', code: '413', name: '운영비', type: 'EXPENSE' },
    { id: 'ac9', code: '414', name: '교육활동비', type: 'EXPENSE' },
    { id: 'ac10', code: '415', name: '시설비', type: 'EXPENSE' },
    { id: 'ac11', code: '416', name: '4대보험', type: 'EXPENSE' },
    { id: 'ac12', code: '417', name: '통신비', type: 'EXPENSE' },
];

// ============================================================
// 유치원 목록
// ============================================================
export const MOCK_KINDERGARTENS: Kindergarten[] = [
    {
        id: 'kg1',
        name: '햇살 유치원',
        edufineId: 'haesal001',
        isActive: true,
        createdAt: '2024-03-01',
        bankAccounts: [
            { id: 'ba1', bankName: '농협중앙회', accountNumber: '352-0611-1234-56', ownerName: '햇살유치원', kindergartenId: 'kg1', lastSynced: '2026-02-24' },
            { id: 'ba2', bankName: '국민은행', accountNumber: '123-456-789012', ownerName: '햇살유치원', kindergartenId: 'kg1', lastSynced: '2026-02-23' },
        ],
    },
    {
        id: 'kg2',
        name: '무지개 유치원',
        edufineId: 'rainbow002',
        isActive: true,
        createdAt: '2024-04-15',
        bankAccounts: [
            { id: 'ba3', bankName: '신한은행', accountNumber: '110-456-789012', ownerName: '무지개유치원', kindergartenId: 'kg2', lastSynced: '2026-02-22' },
        ],
    },
    {
        id: 'kg3',
        name: '꽃동네 유치원',
        edufineId: 'flowertown003',
        isActive: false,
        createdAt: '2023-09-01',
        bankAccounts: [],
    },
];

// ============================================================
// 현금출납부 거래 내역
// ============================================================
export const MOCK_TRANSACTIONS: Transaction[] = [
    // 2026-02 수입
    { id: 't1', type: 'INCOME', date: '2026-02-03', amount: 850000, description: '2월 원비 (김철수 학부모)', status: 'TRANSMITTED', kindergartenId: 'kg1', accountCodeId: 'ac1', accountCode: { id: 'ac1', code: '111', name: '원비 수입', type: 'INCOME' }, kindergarten: { id: 'kg1', name: '햇살 유치원' }, clientName: '김철수', bankName: '농협중앙회', balance: 12850000, journaled: true },
    { id: 't2', type: 'INCOME', date: '2026-02-03', amount: 850000, description: '2월 원비 (이영희 학부모)', status: 'TRANSMITTED', kindergartenId: 'kg1', accountCodeId: 'ac1', accountCode: { id: 'ac1', code: '111', name: '원비 수입', type: 'INCOME' }, kindergarten: { id: 'kg1', name: '햇살 유치원' }, clientName: '이영희', bankName: '농협중앙회', balance: 13700000, journaled: true },
    { id: 't3', type: 'INCOME', date: '2026-02-05', amount: 2500000, description: '국고보조금 (교육부)', status: 'TRANSMITTED', kindergartenId: 'kg1', accountCodeId: 'ac2', accountCode: { id: 'ac2', code: '112', name: '보조금 수입', type: 'INCOME' }, kindergarten: { id: 'kg1', name: '햇살 유치원' }, clientName: '교육부', bankName: '농협중앙회', balance: 16200000, journaled: true },
    { id: 't4', type: 'INCOME', date: '2026-02-07', amount: 320000, description: 'CMS 급식비 자동이체 (박지수)', status: 'PENDING', kindergartenId: 'kg1', accountCodeId: 'ac3', accountCode: { id: 'ac3', code: '113', name: '급식비 수입', type: 'INCOME' }, kindergarten: { id: 'kg1', name: '햇살 유치원' }, clientName: '박지수', bankName: '농협중앙회', balance: 16520000, journaled: false },
    { id: 't5', type: 'INCOME', date: '2026-02-10', amount: 150000, description: '특별활동비 (최민준)', status: 'PENDING', kindergartenId: 'kg1', accountCodeId: 'ac4', accountCode: { id: 'ac4', code: '114', name: '특별활동비 수입', type: 'INCOME' }, kindergarten: { id: 'kg1', name: '햇살 유치원' }, clientName: '최민준', bankName: '국민은행', balance: 16670000, journaled: false },
    // 2026-02 지출
    { id: 't6', type: 'EXPENSE', date: '2026-02-10', amount: 3500000, description: '담임교사 2월 급여 (김선생)', status: 'TRANSMITTED', kindergartenId: 'kg1', accountCodeId: 'ac6', accountCode: { id: 'ac6', code: '411', name: '인건비', type: 'EXPENSE' }, kindergarten: { id: 'kg1', name: '햇살 유치원' }, clientName: '김선생', bankName: '농협중앙회', balance: 13170000, journaled: true },
    { id: 't7', type: 'EXPENSE', date: '2026-02-10', amount: 2800000, description: '보조교사 2월 급여 (박선생)', status: 'TRANSMITTED', kindergartenId: 'kg1', accountCodeId: 'ac6', accountCode: { id: 'ac6', code: '411', name: '인건비', type: 'EXPENSE' }, kindergarten: { id: 'kg1', name: '햇살 유치원' }, clientName: '박선생', bankName: '농협중앙회', balance: 10370000, journaled: true },
    { id: 't8', type: 'EXPENSE', date: '2026-02-14', amount: 780000, description: '2월 급식 재료비 (이마트)', status: 'TRANSMITTED', kindergartenId: 'kg1', accountCodeId: 'ac7', accountCode: { id: 'ac7', code: '412', name: '급식비 지출', type: 'EXPENSE' }, kindergarten: { id: 'kg1', name: '햇살 유치원' }, clientName: '이마트', bankName: '농협중앙회', balance: 9590000, journaled: true },
    { id: 't9', type: 'EXPENSE', date: '2026-02-17', amount: 47090, description: '전기요금 (한국전력)', status: 'PENDING', kindergartenId: 'kg1', accountCodeId: 'ac8', accountCode: { id: 'ac8', code: '413', name: '운영비', type: 'EXPENSE' }, kindergarten: { id: 'kg1', name: '햇살 유치원' }, clientName: '한국전력', bankName: '농협중앙회', balance: 9542910, journaled: false },
    { id: 't10', type: 'EXPENSE', date: '2026-02-17', amount: 25400, description: '정수기 대여료 (청호나이스)', status: 'PENDING', kindergartenId: 'kg1', accountCodeId: 'ac8', accountCode: { id: 'ac8', code: '413', name: '운영비', type: 'EXPENSE' }, kindergarten: { id: 'kg1', name: '햇살 유치원' }, clientName: '청호나이스', bankName: '농협중앙회', balance: 9517510, journaled: false },
    { id: 't11', type: 'EXPENSE', date: '2026-02-19', amount: 525000, description: '교구 구매 (학지사)', status: 'PENDING', kindergartenId: 'kg1', accountCodeId: 'ac9', accountCode: { id: 'ac9', code: '414', name: '교육활동비', type: 'EXPENSE' }, kindergarten: { id: 'kg1', name: '햇살 유치원' }, clientName: '학지사', bankName: '국민은행', balance: 8992510, journaled: false },
    { id: 't12', type: 'EXPENSE', date: '2026-02-19', amount: 855000, description: '4대보험 납부 (국민건강보험공단)', status: 'PENDING', kindergartenId: 'kg1', accountCodeId: 'ac11', accountCode: { id: 'ac11', code: '416', name: '4대보험', type: 'EXPENSE' }, kindergarten: { id: 'kg1', name: '햇살 유치원' }, clientName: '건강보험공단', bankName: '농협중앙회', balance: 8137510, journaled: false },
    { id: 't13', type: 'EXPENSE', date: '2026-02-21', amount: 33000, description: '인터넷 통신비 (KT)', status: 'PENDING', kindergartenId: 'kg1', accountCodeId: 'ac12', accountCode: { id: 'ac12', code: '417', name: '통신비', type: 'EXPENSE' }, kindergarten: { id: 'kg1', name: '햇살 유치원' }, clientName: 'KT', bankName: '농협중앙회', balance: 8104510, journaled: false },
    // 2026-01 데이터
    { id: 't14', type: 'INCOME', date: '2026-01-03', amount: 850000, description: '1월 원비 (김철수 학부모)', status: 'TRANSMITTED', kindergartenId: 'kg1', accountCodeId: 'ac1', accountCode: { id: 'ac1', code: '111', name: '원비 수입', type: 'INCOME' }, kindergarten: { id: 'kg1', name: '햇살 유치원' }, clientName: '김철수', bankName: '농협중앙회', balance: 850000, journaled: true },
    { id: 't15', type: 'EXPENSE', date: '2026-01-10', amount: 3500000, description: '담임교사 1월 급여', status: 'TRANSMITTED', kindergartenId: 'kg1', accountCodeId: 'ac6', accountCode: { id: 'ac6', code: '411', name: '인건비', type: 'EXPENSE' }, kindergarten: { id: 'kg1', name: '햇살 유치원' }, clientName: '김선생', bankName: '농협중앙회', balance: 500000, journaled: true },
];

// ============================================================
// 인사/급여 직원 데이터
// ============================================================
export const MOCK_EMPLOYEES: Employee[] = [
    { id: 'e1', name: '김지현', position: '원장', department: '원운영', hireDate: '2018-03-01', baseSalary: 4500000, isActive: true },
    { id: 'e2', name: '박수진', position: '담임교사', department: '교육', hireDate: '2020-09-01', baseSalary: 3500000, isActive: true },
    { id: 'e3', name: '이미라', position: '담임교사', department: '교육', hireDate: '2021-03-01', baseSalary: 3200000, isActive: true },
    { id: 'e4', name: '최영훈', position: '보조교사', department: '교육', hireDate: '2022-09-01', baseSalary: 2800000, isActive: true },
    { id: 'e5', name: '정혜원', position: '영양사', department: '급식', hireDate: '2019-04-01', baseSalary: 3100000, isActive: true },
    { id: 'e6', name: '강민정', position: '보조교사', department: '교육', hireDate: '2023-03-01', baseSalary: 2600000, isActive: false },
    { id: 'e7', name: '윤성호', position: '기사', department: '운영지원', hireDate: '2020-01-01', baseSalary: 2400000, isActive: true },
];

// ============================================================
// 예산/결산 데이터
// ============================================================
export const MOCK_BUDGET_ITEMS: BudgetItem[] = [
    // 수입
    { id: 'b1', code: '111', category: '수입', name: '원비 수입', budgetAmount: 60000000, executedAmount: 51000000, remainingAmount: 9000000, type: 'INCOME' },
    { id: 'b2', code: '112', category: '수입', name: '국고보조금', budgetAmount: 30000000, executedAmount: 28000000, remainingAmount: 2000000, type: 'INCOME' },
    { id: 'b3', code: '113', category: '수입', name: '급식비 수입', budgetAmount: 8000000, executedAmount: 7200000, remainingAmount: 800000, type: 'INCOME' },
    { id: 'b4', code: '114', category: '수입', name: '특별활동비', budgetAmount: 5000000, executedAmount: 3900000, remainingAmount: 1100000, type: 'INCOME' },
    // 지출
    { id: 'b5', code: '411', category: '지출', name: '인건비', budgetAmount: 50000000, executedAmount: 47500000, remainingAmount: 2500000, type: 'EXPENSE' },
    { id: 'b6', code: '412', category: '지출', name: '급식비', budgetAmount: 10000000, executedAmount: 9100000, remainingAmount: 900000, type: 'EXPENSE' },
    { id: 'b7', code: '413', category: '지출', name: '운영비', budgetAmount: 8000000, executedAmount: 6200000, remainingAmount: 1800000, type: 'EXPENSE' },
    { id: 'b8', code: '414', category: '지출', name: '교육활동비', budgetAmount: 5000000, executedAmount: 3750000, remainingAmount: 1250000, type: 'EXPENSE' },
    { id: 'b9', code: '415', category: '지출', name: '시설비', budgetAmount: 3000000, executedAmount: 1800000, remainingAmount: 1200000, type: 'EXPENSE' },
    { id: 'b10', code: '416', category: '지출', name: '4대보험', budgetAmount: 6000000, executedAmount: 5600000, remainingAmount: 400000, type: 'EXPENSE' },
    { id: 'b11', code: '417', category: '지출', name: '통신비', budgetAmount: 500000, executedAmount: 435000, remainingAmount: 65000, type: 'EXPENSE' },
];

// ============================================================
// 사용자 목록
// ============================================================
export const MOCK_USERS: User[] = [
    { id: 'u1', name: '관리자', email: 'admin@haesal.edu', role: 'ADMIN', createdAt: '2024-01-01' },
    { id: 'u2', name: '김지현', email: 'kim@haesal.edu', role: 'STAFF', createdAt: '2024-03-01' },
    { id: 'u3', name: '박수진', email: 'park@haesal.edu', role: 'STAFF', createdAt: '2024-04-01' },
];

// ============================================================
// 키워드 설정 (자동분개 규칙)
// ============================================================
export const MOCK_KEYWORDS = [
    { id: 'kw1', keyword: '이마트', accountCode: '급식비 지출', accountCodeId: 'ac7' },
    { id: 'kw2', keyword: '한국전력', accountCode: '운영비', accountCodeId: 'ac8' },
    { id: 'kw3', keyword: '청호나이스', accountCode: '운영비', accountCodeId: 'ac8' },
    { id: 'kw4', keyword: '건강보험', accountCode: '4대보험', accountCodeId: 'ac11' },
    { id: 'kw5', keyword: 'KT', accountCode: '통신비', accountCodeId: 'ac12' },
    { id: 'kw6', keyword: '학지사', accountCode: '교육활동비', accountCodeId: 'ac9' },
];

// ============================================================
// 계좌연결 상태 목업 (bank-scraping)
// ============================================================
export const MOCK_BANK_TRANSACTIONS = [
    { id: 'bt1', seq: 25, date: '2026-02-17', bankName: '농협중앙회(0611)', description: '한국전력 자동이체', income: 0, expense: 47090, balance: 9542910, imported: true },
    { id: 'bt2', seq: 26, date: '2026-02-17', bankName: '농협중앙회(0611)', description: '청호나이스 대여료', income: 0, expense: 25400, balance: 9517510, imported: true },
    { id: 'bt3', seq: 27, date: '2026-02-19', bankName: '농협중앙회(0611)', description: '교구구매 학지사', income: 0, expense: 525000, balance: 8992510, imported: false },
    { id: 'bt4', seq: 28, date: '2026-02-19', bankName: '농협중앙회(0611)', description: '4대보험 건강보험공단', income: 0, expense: 855000, balance: 8137510, imported: false },
    { id: 'bt5', seq: 29, date: '2026-02-21', bankName: '농협중앙회(0611)', description: 'KT 인터넷요금', income: 0, expense: 33000, balance: 8104510, imported: false },
    { id: 'bt6', seq: 30, date: '2026-02-24', bankName: '농협중앙회(0611)', description: '원비입금 김철수', income: 850000, expense: 0, balance: 8954510, imported: false },
];
