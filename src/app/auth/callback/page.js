'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/database/authProvider';
import { achievementsStore, runPlansStore, checklistsStore, activeChecklistsStore } from '@/app/database/localDB';

export default function AuthCallback() {
    const router = useRouter();
    const { user, profile, loading, refreshProfile } = useAuth();

    useEffect(() => {
        // wait for AuthProvider to finish loading
        if (loading) return;

        // if still no user after loading, auth failed or expired
        if (!user) {
            router.replace('/login');
            return;
        }

        // If user has no profile, they’re new → setup flow
        if (!profile || !profile.username || profile.username.trim().length === 0) {
            (async () => {
                router.replace('/login/setup');
            })();
            return;
        }

        const checkLocal = async () => {
            const achievements = await achievementsStore.getAll();
            const runPlans = await runPlansStore.getAll();
            const checklists = await checklistsStore.getAll();
            const activeChecklists = await activeChecklistsStore.getAll();

            if (achievements.length !== 0 || runPlans.length !== 0 || checklists.length !== 0 || activeChecklists.length !== 0) {
                (async () => {
                    router.replace('/login/setup');
                })();
                return;
            }

            finishAuth();
        }

        const finishAuth = () => {
            // Otherwise, existing user → go home
            const searchParams = new URLSearchParams(window.location.search);
            const state = searchParams.get('state');
            router.replace(state || '/');
        }

        checkLocal();
    }, [loading, user, profile, router, refreshProfile]);

    return <p style={{ textAlign: 'center', marginTop: '2rem' }}>Authenticating...</p>;
}
