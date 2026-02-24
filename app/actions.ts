'use server';
// 목업 액션 - DB 없이 동작 (Vercel 배포용)

export async function addUser(formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    if (!email || !name) return { error: '필수 항목을 입력해주세요.' };
    return { success: true };
}

export async function deleteUser(id: string) {
    return { success: true };
}

export async function addKindergarten(formData: FormData) {
    const name = formData.get('name') as string;
    const edufineId = formData.get('edufineId') as string;
    if (!name || !edufineId) return { error: '필수 항목을 입력해주세요.' };
    return { success: true };
}

export async function deleteKindergarten(id: string) {
    return { success: true };
}

export async function addTransaction(formData: FormData) {
    return { success: true };
}

export async function syncWithEdufine(kindergartenId: string, transactionIds: string[]) {
    if (!kindergartenId || transactionIds.length === 0) return { error: '유효하지 않은 요청입니다.' };
    // 목업: 1초 지연 후 성공 응답
    await new Promise(r => setTimeout(r, 1000));
    return { success: true, transmitted: transactionIds.length };
}
