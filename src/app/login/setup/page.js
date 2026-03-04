'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/database/authProvider';
import { achievementsStore, runPlansStore, checklistsStore, activeChecklistsStore } from '@/app/database/localDB';
import { updateAchievementsProgress } from '@/app/database/achievements';
// import { useRequestsCache } from '@/app/database/RequestsCacheProvider';
// import { insertBuild } from '@/app/database/builds';

export default function UsernameSetup() {
    const router = useRouter();
    const { user, profile, loading, updateUsername, refreshProfile } = useAuth();
    // const { toggleSave } = useRequestsCache();

    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const [localAchievements, setLocalAchievements] = useState([]);
    const [localRunPlans, setLocalRunPlans] = useState([]);
    const [localChecklists, setLocalChecklists] = useState([]);
    const [localActiveChecklists, setLocalActiveChecklists] = useState([]);
    const [achievementSync, setAchievementSync] = useState(true);
    const [runPlanSync, setRunPlanSync] = useState(false);
    const [checklistSync, setChecklistSync] = useState(false);
    const [activeChecklistSync, setActiveChecklistSync] = useState(false);
    const [syncDone, setSyncDone] = useState(false);
    const [localLoading, setLocalLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);

    const fetchLocal = async () => {
        setLocalAchievements(await achievementsStore.getAll());
        setLocalRunPlans(await runPlansStore.getAll());
        setLocalChecklists(await checklistsStore.getAll());
        setLocalActiveChecklists(await activeChecklistsStore.getAll());
        setLocalLoading(false);
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchLocal();
    }, []);

    if (loading) {
        return <p style={{ textAlign: 'center', marginTop: '2rem' }}>Loading user...</p>;
    }

    if (!user) {
        router.replace('/login');
        return null;
    }

    const handleSubmitUsername = async (e) => {
        e.preventDefault();
        setError('');

        if (!username.trim()) {
            setError('Username cannot be empty.');
            return;
        }

        setSubmitting(true);

        const { error } = await updateUsername(user.id, username);

        setSubmitting(false);

        if (error) {
            if (error.code === '23505') setError('That username is already taken.');
            else setError(error.message);
            return;
        }

        await refreshProfile();
    };

    if (!profile?.username) {
        return <main style={{ textAlign: 'center', marginTop: '3rem' }}>
            <h2>Set up your username</h2>
            <form onSubmit={handleSubmitUsername}>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Choose a username"
                    required
                />
                <button type="submit" disabled={submitting}>
                    {submitting ? 'Saving...' : 'Continue'}
                </button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </main>;
    }

    if (localLoading) {
        return <p style={{ textAlign: 'center', marginTop: '2rem' }}>Checking for local data...</p>;
    }

    if(!syncDone && (localAchievements.length !== 0 || localRunPlans.length !== 0 || localChecklists.length !== 0 || localActiveChecklists.length !== 0)) {
        const handleSync = async () => {
            setSyncing(true);
            setError("");

            if(achievementSync && localAchievements.length !== 0) {
                updateAchievementsProgress(user, localAchievements[0]);
                achievementsStore.remove("main");
            }

            if(runPlanSync && localRunPlans.length !== 0) {
                
            }

            if(checklistSync && localChecklists.length !== 0) {
                
            }

            if(activeChecklistSync && localActiveChecklists.length !== 0) {
                
            }

            // for (const build of localBuilds) {
            //     const { id, title, body, identity_ids, ego_ids, keyword_ids, deployment_order, active_sinners, team_code, youtube_video_id, tags, extra_opts } = build;
            //     try {
            //         const data = await insertBuild(user.id, title, body, identity_ids, ego_ids, keyword_ids, deployment_order, active_sinners, team_code, youtube_video_id, tags, extra_opts, false);
            //         if (data) await buildsStore.remove(id);
            //     } catch (err) {
            //         setError("Failed to sync a build, try again or cancel syncing.");
            //         setSyncing(false);
            //         break;
            //     }
            // }

            setSyncing(false);
            await fetchLocal();
        }

        return <main style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", textAlign: 'center', marginTop: '3rem' }}>
            <span style={{ fontSize: "1.2rem" }}>
                Local data was found on your device. Would you like to sync them to your account?
                <br />
                Unsynced data cannot be accessed while logged in.
                <br /><br />
                Choose what data to sync:
            </span>
            {
                localAchievements.length !== 0 ?
                <label>
                    <input type="checkbox" checked={achievementSync} onChange={e => setAchievementSync(e.target.checked)} />
                    Achievement Progress
                </label> :
                null
            }
            {
                localRunPlans.length !== 0 ?
                <label>
                    <input type="checkbox" checked={runPlanSync} onChange={e => setRunPlanSync(e.target.checked)} />
                    Run Plans
                </label> :
                null
            }
            {
                localChecklists.length !== 0 ?
                <label>
                    <input type="checkbox" checked={checklistSync} onChange={e => setChecklistSync(e.target.checked)} />
                    Checklists
                </label> :
                null
            }
            {
                localActiveChecklists.length !== 0 ?
                <label>
                    <input type="checkbox" checked={activeChecklistSync} onChange={e => setActiveChecklistSync(e.target.checked)} />
                    Active Checklists
                </label> :
                null
            }
            <div style={{ display: "flex", gap: "2rem", justifyContent: "center" }}>
                <button onClick={handleSync} disabled={syncing}>
                    Sync Data
                </button>
                <button onClick={() => setSyncDone(true)} disabled={syncing}>
                    Don&apos;t Sync
                </button>
            </div>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </main>;
    }

    router.replace("/");
    return null;
}
