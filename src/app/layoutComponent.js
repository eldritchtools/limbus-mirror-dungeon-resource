"use client";

import { DataProvider, getMeta, GiftTooltip, StatusTooltip } from "@eldritchtools/limbus-shared-library";
import { Layout } from "@eldritchtools/shared-components";
import UserStatus from "./components/UserStatus";
import { AuthProvider } from "./database/authProvider";
import { useEffect, useState } from "react";
import { RequestsCacheProvider } from "./database/RequestsCacheProvider";

import TimeAgo from "javascript-time-ago"
import en from "javascript-time-ago/locale/en"
import { ThemePackNameTooltip } from './components/ThemePackNameWithTooltip';
import { Tooltip } from 'react-tooltip';
import { tooltipStyle } from "./styles";
import { IdentityTooltip } from "./components/IdentityTooltip";
import { EgoTooltip } from "./components/EgoTooltip";
import NoPrefetchLink from "./NoPrefetchLink";
import { GeneralTooltip } from "./components/GeneralTooltip";

TimeAgo.addDefaultLocale(en)

const paths = [
    { path: "/achievements", title: "Achievements" },
    { path: "/gifts", title: "Gifts" },
    { path: "/fusions", title: "Fusion Recipes" },
    { path: "/universal", title: "Universal Gifts/Gift Combos" },
    { path: "/themepacks", title: "Theme Packs" },
    { path: "/md-plans", title: "MD Plans" },
    { path: "/my-profile", title: "My Profile" }
]

const description = <span>
    Limbus Company Mirror Dungeon Resource and Achievements Tracker is a free fan-made tool to help players plan dungeon runs and track achievement progress.
    <br /><br />
    Get tips and details for each achievement, plus references for fusion recipes, theme packs, and other info related to Mirror Dungeons.
</span>;

function MigrationNotice() {
    const [hidden, setHidden] = useState(false);

    if (hidden) return null;

    return <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "1rem" }}>
        <div style={{ backgroundColor: "#262626", borderRadius: "1rem", border: "1px solid #333", maxWidth: "1200px", boxShadow: "0 4px 16px rgba(0,0,0,0.4)" }}>
            <div style={{ padding: "8px 16px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", color: "#d1d1d1" }}>
                    <span style={{ lineHeight: "1.3" }}>
                        Hi! This site has been combined with the Team Building Hub to make a more convenient and easier to maintain site over at <NoPrefetchLink className="text-link" href="https://limbus.eldritchtools.com">https://limbus.eldritchtools.com</NoPrefetchLink>.
                        <br /> <br />
                        All data synced to accounts is automatically carried over, you only need to login again in the new site. If you&apos;re not using an account, it&apos;s recommended to sync your data to an account or to transfer them to the other site when possible. Sorry for the inconvenience!
                        <br /> <br />
                        This site will continue running for some time, but will only receive updates for compatibility with new data. Only the new site will receive new features moving forward. 
                    </span>
                    <NoPrefetchLink className="text-link" href="https://limbus.eldritchtools.com" style={{ alignSelf: "center" }}>
                        ➔ Go to the new site <span style={{display: "inline-block", verticalAlign: "middle", transform: "rotate(180deg)"}}>➔</span>
                    </NoPrefetchLink>
                </div>

                <button 
                    style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer", fontSize: "1.2rem", fontWeight: "bold" }} 
                    onClick={() => setHidden(true)}
                >
                    ✕
                </button>
            </div>
        </div>
    </div>;
}

export default function LayoutComponent({ children }) {
    const [lastUpdated, setLastUpdated] = useState(process.env.NEXT_PUBLIC_LAST_UPDATED);

    useEffect(() => {
        getMeta().then(meta => setLastUpdated(p => p > meta.datetime ? p : meta.datetime));
    }, []);

    return <AuthProvider>
        <RequestsCacheProvider>
            <Layout
                title={"Mirror Dungeon Resource & Achievements Tracker"}
                lastUpdated={lastUpdated}
                linkSet={"limbus"}
                description={description}
                gameName={"Limbus Company"}
                developerName={"Project Moon"}
                githubLink={"https://github.com/eldritchtools/limbus-mirror-dungeon-resource"}
                paths={paths}
                LinkComponent={NoPrefetchLink}
                topComponent={<UserStatus />}
            >
                <DataProvider>
                    <MigrationNotice />
                    {children}
                    <IdentityTooltip />
                    <EgoTooltip />
                    <GiftTooltip />
                    <StatusTooltip />
                    <ThemePackNameTooltip />
                    <GeneralTooltip />
                    <Tooltip id={"genericTooltip"} render={({ content }) => <div style={{ whiteSpace: "pre-wrap" }}>{content}</div>} style={tooltipStyle} />
                </DataProvider>
            </Layout>
        </RequestsCacheProvider>
    </AuthProvider>
}
