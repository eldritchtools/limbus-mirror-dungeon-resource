import './App.css';
import { useEffect, useState } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import AchievementsTab from './AchievementsTab';
import FusionsTab from './FusionsTab';
import ThemePacksTab from './ThemePacksTab';

import { Header, Footer, ProfileProvider } from '@eldritchtools/shared-components';
import migrateProfile, { firstMigrate } from './migrateProfile';

const description = <span>
    Limbus Company Mirror Dungeon Resource and Achievements Tracker is a free fan-made tool to help players plan dungeon runs and track achievement progress.
    <br /><br />
    Get tips and details for each achievement, plus references for fusion recipes, theme packs, and other info related to Mirror Dungeons.
</span>;

function App() {
    const [migrated, setMigrated] = useState(false);

    useEffect(() => {
        if (!migrated) {
            firstMigrate().then(() => {
                setMigrated(true);
            }).catch(err => {
                console.error(err.message);
            });
        }
    }, [migrated]);

    return (migrated ?
        <ProfileProvider dbName={"limbus-mirror-dungeon-resource"} migrateProfile={migrateProfile}>
            <div className="App">
                <div style={{ height: "100vh" }} >
                    <Header title={"Limbus Company Mirror Dungeon Resource & Achievements Tracker"} lastUpdated={process.env.REACT_APP_LAST_UPDATED} />
                    <div className="App-content">
                        <Tabs className="tabs" selectedTabClassName="selected-tab" selectedTabPanelClassName="selected-tab-panel">
                            <TabList className="tab-list">
                                <Tab className="tab">Achievements</Tab>
                                <Tab className="tab">Fusions</Tab>
                                <Tab className="tab">Notable Theme Packs</Tab>
                            </TabList>

                            <TabPanel className="tab-panel">
                                <AchievementsTab />
                            </TabPanel>
                            <TabPanel className="tab-panel">
                                <FusionsTab />
                            </TabPanel>
                            <TabPanel className="tab-panel">
                                <ThemePacksTab />
                            </TabPanel>
                        </Tabs>
                    </div>
                </div>
                <Footer
                    description={description}
                    gameName={"Limbus Company"}
                    developerName={"Project Moon"}
                    githubLink={"https://github.com/eldritchtools/limbus-mirror-dungeon-resource"}
                />
            </div>
        </ProfileProvider> :
        null
    );
}

export default App;