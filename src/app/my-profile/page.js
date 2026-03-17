"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../database/authProvider";
import { tabStyle } from "../styles";
import { useSearchParams } from "next/navigation";
import { mdPlansStore, savedMdPlansStore } from "../database/localDB";
import NoPrefetchLink from "../NoPrefetchLink";
import { searchMdPlans } from "../database/mdPlans";
import MdPlan from "../components/MdPlan";
import { useBreakpoint } from "@eldritchtools/shared-components";
import { getSavedMdPlans } from "../database/saves";

export default function ProfilePage() {
    const { user, profile, loading, updateUsername, refreshProfile } = useAuth();
    const [username, setUsername] = useState("");
    const [usernameError, setUsernameError] = useState(null);
    const [plans, setPlans] = useState([]);
    const [plansLoading, setPlansLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [profileLoading, setProfileLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const searchParams = useSearchParams();
    const { isMobile } = useBreakpoint();
    const size = isMobile ? 175 : 250;

    useEffect(() => {
        if (profile) {
            setUsername(profile.username);
            setProfileLoading(false);
        }
    }, [profile]);

    const searchTab = searchParams.get('tab') ?? "published";
    const [activeTab, setActiveTab] = useState(searchTab);

    useEffect(() => {
        setActiveTab(searchTab);
    }, [searchTab]);

    useEffect(() => {
        switch (activeTab) {
            case "published":
                if (user) {
                    setPlansLoading(true);
                    searchMdPlans({ userId: user.id, ignoreBlockDiscovery: true, sortBy: "new", published: true, limit: 20, offset: (page - 1) * 20 })
                        .then(p => { setPlans(p); setPlansLoading(false); })
                } else {
                    setPlans([]);
                }
                break;
            case "drafts":
                if (user) {
                    setPlansLoading(true);
                    searchMdPlans({ userId: user.id, ignoreBlockDiscovery: true, sortBy: "new", published: false, limit: 20, offset: (page - 1) * 20 })
                        .then(p => { setPlans(p); setPlansLoading(false); })
                } else {
                    const fetchPlans = async () => {
                        const plans = await mdPlansStore.getAll();
                        setPlans(plans);
                    }
                    fetchPlans();
                }
                break;
            case "saved":
                if (user) {
                    setPlansLoading(true);
                    getSavedMdPlans(user.id, page, 24).then(p => { setPlans(p); setPlansLoading(false); })
                } else {
                    setPlansLoading(true);
                    const fetchSaves = async () => {
                        const saves = await savedMdPlansStore.getAll();
                        searchMdPlans({ "md_plan_ids": saves.map(x => x.id) }, true, "recency", false, page, 24)
                            .then(b => { setBuilds(b); setPlansLoading(false); })
                    }
                    fetchSaves();
                }
                break;
            default:
                break;
        }

    }, [user, activeTab, page]);

    if (loading)
        return <div>
            <h2>Loading Profile...</h2>
        </div>;

    const handleUpdateUsername = async () => {
        setUsernameError('');

        if (!username.trim()) {
            setUsernameError('Username cannot be empty.');
            return;
        }

        setUpdating(true);
        const { error: insertError } = await updateUsername(user.id, username);

        if (insertError) {
            setUpdating(false);
            if (insertError.code === '23505') {
                // unique constraint violation
                setUsernameError('That username is already taken.');
            } else {
                setUsernameError(insertError.message);
            }
            return;
        }

        refreshProfile();
        window.location.reload();
    };

    const headerStyle = { marginTop: "1rem", marginBottom: "0" };
    const subHeaderStyle = { fontSize: "0.8rem", color: "#aaa" };

    const contentDisplay = () => {
        if (plansLoading) return <p style={{ color: "#aaa", fontweight: "bold", textAlign: "center" }}>Loading...</p>;
        const components = [];
        if (!user) {
            if (activeTab === "drafts") {
                components.push(<div key={"draft-warn"} style={{ color: "rgba(255, 99, 71, 0.85)", paddingBottom: "0.5rem" }}>
                    When not logged in, md plans are saved locally on this device. After logging in, you can sync them to your account. MD plans that are not synced cannot be accessed while logged in.
                </div>)
            } else if (activeTab === "saved") {
                components.push(<div key={"draft-warn"} style={{ color: "rgba(255, 99, 71, 0.85)", paddingBottom: "0.5rem" }}>
                    When not logged in, saved md plans are stored locally on this device. After logging in, you can sync them to your account. Saved md plans that are not synced cannot be accessed while logged in. Local drafts cannot be saved.
                </div>)
            }
        }
        if (plans.length === 0) {
            if (page === 1) {
                let str;
                switch (activeTab) {
                    case "published":
                        str = user ? "No published md plans yet" : "";
                        break;
                    case "drafts":
                        str = "No drafts yet";
                        break;
                    case "saved":
                        str = "No saved md plans yet";
                        break;
                    default:
                        break;
                }
                if (str) {
                    components.push(<p key={"no-plans"} style={{ color: "#aaa", fontweight: "bold", textAlign: "center" }}>
                        {str}
                    </p>)
                }
            } else {
                components.push(<p key={"no-plans"} style={{ color: "#aaa", fontweight: "bold", textAlign: "center" }}>
                    No more md plans.
                </p>)
            }
        } else {
            components.push(
                <div key={"content"} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, ${size}px)`, gap: isMobile ? "0.2rem" : "0.5rem", justifyContent: "center" }}>
                        {plans.map(plan => <MdPlan key={plan.id} plan={plan} />)}
                    </div>

                    <div style={{ display: "flex", gap: "0.5rem", alignSelf: "end" }}>
                        <button className="page-button" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
                        <button className="page-button" disabled={plans.length < 24} onClick={() => setPage(p => p + 1)}>Next</button>
                    </div>
                </div>
            );
        }
        return components;
    }

    return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {user ?
            (!profileLoading ?
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: "1600px" }}>
                    <h2 style={headerStyle}>Details</h2>
                    <h4 style={headerStyle}>Username</h4>
                    <span style={subHeaderStyle}>Name to display across the site. This must be updated separately from the rest of the profile.</span>
                    <div><input value={username} onChange={e => setUsername(e.target.value)} /></div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <button onClick={handleUpdateUsername} disabled={updating}>Update Username</button>
                        {usernameError}
                    </div>
                </div> :
                <h2>Profile Loading...</h2>
            ) :
            <h2>Login to edit profile</h2>
        }

        <div style={{ border: "1px #777 solid" }} />

        <div style={{ display: "flex", marginBottom: "1rem", gap: "1rem" }}>
            <NoPrefetchLink href="/md-plans/new" style={{ textDecoration: "none" }}>
                <div style={{ fontSize: "1.2rem", fontWeight: "bold", cursor: "pointer", color: "#777" }}>+New MD Plan</div>
            </NoPrefetchLink>
            {user ?
                <div style={{ ...tabStyle, color: activeTab === "published" ? "#ddd" : "#777" }} onClick={() => { setActiveTab("published"); setPage(1); }}>Published</div> :
                null}
            <div style={{ ...tabStyle, color: activeTab === "drafts" ? "#ddd" : "#777" }} onClick={() => { setActiveTab("drafts"); setPage(1); }}>Drafts</div>
            <div style={{ ...tabStyle, color: activeTab === "saved" ? "#ddd" : "#777" }} onClick={() => { setActiveTab("saved"); setPage(1); }}>Saved</div>
        </div>

        {contentDisplay()}
    </div>
}
