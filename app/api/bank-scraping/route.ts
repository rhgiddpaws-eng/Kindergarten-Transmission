import { NextResponse } from 'next/server';

// 목업 API - 빌드용 (Vercel 배포)
export async function POST(request: Request) {
    const body = await request.json().catch(() => ({}));
    return NextResponse.json({
        success: true,
        message: '계좌 스크래핑 완료 (시뮬레이션)',
        transactions: [
            { date: '2026-02-24', description: '원비입금', income: 850000, expense: 0, balance: 9500000 },
        ],
    });
}

export async function GET() {
    return NextResponse.json({ status: 'ok', mode: 'mock' });
}
