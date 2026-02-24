import { NextResponse } from 'next/server';

// 목업 API - 빌드용 (Vercel 배포)
export async function POST(request: Request) {
    const body = await request.json().catch(() => ({}));
    return NextResponse.json({
        success: true,
        message: 'EDI 스크래핑 완료 (목업)',
        data: [],
    });
}

export async function GET() {
    return NextResponse.json({ status: 'ok', mode: 'mock' });
}
