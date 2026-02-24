import TransactionsClient from '../../../components/TransactionsClient';
import { MOCK_TRANSACTIONS, MOCK_KINDERGARTENS, MOCK_ACCOUNT_CODES } from '../../../lib/mockData';

export default function TransactionsPage() {
    return (
        <TransactionsClient
            initialTransactions={MOCK_TRANSACTIONS}
            kindergartens={MOCK_KINDERGARTENS}
            accountCodes={MOCK_ACCOUNT_CODES}
        />
    );
}
