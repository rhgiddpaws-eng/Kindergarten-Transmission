import { redirect } from 'next/navigation';

export default function Home() {
    // Redirect to dashboard (or login later if unauthenticated)
    redirect('/dashboard');
}
