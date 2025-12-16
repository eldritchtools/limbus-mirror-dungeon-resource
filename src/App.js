import './App.css';
import { useEffect, useState } from 'react';
import AchievementsTab from './AchievementsTab';
import GiftsTab from './GiftsTab';
import FusionsTab from './FusionsTab';
import UniversalGiftsTab from './UniversalGiftsTab';
import ThemePacksTab from './ThemePacksTab';
import FloorPlannerTab from './FloorPlannerTab';

import { ProfileProvider, Layout } from '@eldritchtools/shared-components';
import migrateProfile, { firstMigrate } from './migrateProfile';
import { DataProvider, getMeta, GiftTooltip, StatusTooltip } from '@eldritchtools/limbus-shared-library';
import { ThemePackNameTooltip } from './ThemePackNameWithTooltip';
import { Tooltip } from 'react-tooltip';
import { tooltipStyle } from './constants';

import { HashRouter, Link, Routes, Route } from 'react-router-dom';

const description = <span>
    Limbus Company Mirror Dungeon Resource and Achievements Tracker is a free fan-made tool to help players plan dungeon runs and track achievement progress.
    <br /><br />
    Get tips and details for each achievement, plus references for fusion recipes, theme packs, and other info related to Mirror Dungeons.
</span>;

function SidebarLink({ href, className, style, onClick, children }) {
    return <Link className={className} style={{ ...style, textAlign: "start" }} to={href} onClick={onClick}>{children}</Link>;
}

const paths = [
    { path: "/achievements", title: "Achievements" },
    { path: "/gifts", title: "Gifts" },
    { path: "/fusions", title: "Fusion Recipes" },
    { path: "/universal", title: "Universal Gifts/Gift Combos" },
    { path: "/themepacks", title: "Notable Theme Packs" },
    { path: "/floorplanner", title: "Floor Planner" },
]

function App() {
    const [migrated, setMigrated] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(process.env.REACT_APP_LAST_UPDATED);

    useEffect(() => {
        if (!migrated) {
            firstMigrate().then(() => {
                setMigrated(true);
            }).catch(err => {
                console.error(err.message);
            });
        }
    }, [migrated]);

    useEffect(() => {
        getMeta().then(meta => setLastUpdated(p => p > meta.datetime ? p : meta.datetime));
    }, [])

    return (migrated ?
        <ProfileProvider dbName={"limbus-mirror-dungeon-resource"} migrateProfile={migrateProfile}>
            <DataProvider>
                <div className="App">
                    <HashRouter>
                        <Layout
                            title={"Limbus Company Mirror Dungeon Resource & Achievements Tracker"}
                            lastUpdated={lastUpdated}
                            linkSet={"limbus"}
                            description={description}
                            gameName={"Limbus Company"}
                            developerName={"Project Moon"}
                            githubLink={"https://github.com/eldritchtools/limbus-mirror-dungeon-resource"}
                            paths={paths}
                            LinkComponent={SidebarLink}
                        >
                            <div className="App-content">
                                <div style={{ width: "95%" }}>
                                    <Routes>
                                        <Route path="/" element={<AchievementsTab />} />
                                        <Route path="/achievements" element={<AchievementsTab />} />
                                        <Route path="/gifts" element={<GiftsTab />} />
                                        <Route path="/fusions" element={<FusionsTab />} />
                                        <Route path="/universal" element={<UniversalGiftsTab />} />
                                        <Route path="/themepacks" element={<ThemePacksTab />} />
                                        <Route path="/floorplanner" element={<FloorPlannerTab />} />
                                    </Routes>
                                </div>
                            </div>

                            <GiftTooltip />
                            <StatusTooltip />
                            <ThemePackNameTooltip />
                            <Tooltip id={"genericTooltip"} render={({ content }) => <div style={{ whiteSpace: "pre-wrap" }}>{content}</div>} style={tooltipStyle} />
                        </Layout>
                    </HashRouter>
                </div>
            </DataProvider>
        </ProfileProvider> :
        null
    );
}

export default App;