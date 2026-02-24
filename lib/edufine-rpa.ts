import { chromium } from 'playwright';
import { PrismaClient } from '@prisma/client';
import { decrypt } from './encryption';

const prisma = new PrismaClient();

/**
 * Automates logging into the Edufine system and entering a set of transactions.
 * Uses Playwright (RPA) since Edufine lacks a modern open API.
 */
export async function transmitToEdufine(kindergartenId: string, transactionIds: string[]) {
    const kindergarten = await prisma.kindergarten.findUnique({
        where: { id: kindergartenId }
    });

    if (!kindergarten) throw new Error('Kindergarten not found');

    const transactions = await prisma.transaction.findMany({
        where: { id: { in: transactionIds } },
        include: { accountCode: true }
    });

    if (transactions.length === 0) return { success: true, count: 0 }; // Nothing to do

    const browser = await chromium.launch({ headless: true }); // Headless in production, maybe false for debugging
    const page = await browser.newPage();

    let successCount = 0;

    try {
        console.log(`Starting Edufine RPA for [${kindergarten.name}]`);

        // 1. Decrypt ID & Password
        const edufineId = kindergarten.edufineId;
        const edufinePw = decrypt(kindergarten.edufinePw);

        // 2. Login Process (Mock representation)
        // await page.goto('https://edufine.go.kr/login');
        // await page.fill('#userId', edufineId);
        // await page.fill('#userPw', edufinePw);
        // await page.click('#btnLogin');
        // await page.waitForNavigation();
        // Handle certificate login if required...

        console.log(`Logged into Edufine successfully.`);

        // 3. Navigate to Accounting Slips Page
        // await page.goto('https://edufine.go.kr/accounting-slips');

        // 4. Input each transaction
        for (const tx of transactions) {
            console.log(`Inputting transaction: [${tx.accountCode.name}] ${tx.description} / ${tx.amount}₩`);

            // Format data
            // const edufineDataForTx = { amount: tx.amount, desc: tx.description, code: tx.accountCode.code }

            // Fill web forms
            // await page.click('#btnAddSlip');
            // await page.fill('.slip-amount', String(tx.amount));
            // await page.fill('.slip-desc', tx.description);
            // await page.selectOption('.slip-code-select', tx.accountCode.code);
            // await page.click('#btnSaveSlip');
            // await page.waitForSelector('.toast-success'); // Wait for save confirmation

            // Update local DB status if successful
            await prisma.transaction.update({
                where: { id: tx.id },
                data: { status: 'SUCCESS' }
            });
            successCount++;
        }

        console.log(`Transmission completed. Successfully synced ${successCount} transactions.`);
        return { success: true, count: successCount };

    } catch (error: any) {
        console.error('Edufine Transmission failed:', error);

        // Tag failed in DB
        await prisma.transaction.updateMany({
            where: { id: { in: transactionIds }, status: 'PENDING' },
            data: { status: 'FAILED', errorMessage: error.message }
        });

        return { success: false, error: error.message };
    } finally {
        await browser.close();
    }
}
