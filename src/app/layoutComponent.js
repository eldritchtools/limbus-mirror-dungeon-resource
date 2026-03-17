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
