import './App.css';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import AchievementsTab from './AchievementsTab';
import FusionsTab from './FusionsTab';
import ThemePacksTab from './ThemePacksTab';

import data from './data/data.json';
import achievements from './data/achievements.json';
import identities from './data/identities.json';
import rewards from './data/rewards.json';
import { Footer } from '@eldritchtools/shared-components';

import { useEffect, useMemo, useState } from 'react';

function preprocessData(data) {
    // Add indices per category to achievements
    Object.entries(achievements).forEach(([_category, list]) => {
        list.forEach((achievement, index) => { achievement["index"] = index; });
    })

    // Add floors available to theme packs
    const floorsPerPack = { normal: {}, hard: {} };
    Object.entries(data.floors.normal).forEach(([floor, packs]) => packs.forEach(pack => {
        if (pack in floorsPerPack.normal) floorsPerPack.normal[pack].push(floor);
        else floorsPerPack.normal[pack] = [floor];
    }))
    Object.entries(data.floors.hard).forEach(([floor, packs]) => packs.forEach(pack => {
        if (pack in floorsPerPack.hard) floorsPerPack.hard[pack].push(floor);
        else floorsPerPack.hard[pack] = [floor];
    }))

    Object.entries(floorsPerPack.normal).forEach(([pack, floors]) => data["theme_packs"][pack]["normalFloors"] = floors);
    Object.entries(floorsPerPack.hard).forEach(([pack, floors]) => data["theme_packs"][pack]["hardFloors"] = floors);

    return { ...data, identities: identities, rewards: rewards };
}

function defaultTracking() {
    return Object.entries(achievements).reduce((acc, [key, achievements]) => {
        acc[key] = new Array(achievements.length).fill(0);
        return acc;
    }, {});
}

function getTracking() {
    let latestAccessedVersion = localStorage.getItem('latestVersion');
    if (!latestAccessedVersion) latestAccessedVersion = "6.2";
    localStorage.setItem('latestVersion', JSON.stringify("6.3"))

    let storedTracking = localStorage.getItem('tracking');
    if (storedTracking) storedTracking = JSON.parse(storedTracking);
    else return defaultTracking(achievements);

    if (latestAccessedVersion === "6.2") {
        storedTracking["Combat"] = defaultTracking()["Combat"]
        localStorage.setItem('tracking', JSON.stringify(storedTracking));
    }
    return storedTracking;

}

function App() {
    const [totalPoints, setTotalPoints] = useState(() => {
        const storedTotalPoints = localStorage.getItem('totalPoints');
        return storedTotalPoints ? JSON.parse(storedTotalPoints) : 0
    });
    useEffect(() => localStorage.setItem('totalPoints', JSON.stringify(totalPoints)), [totalPoints]);

    const [tracking, setTracking] = useState(getTracking);
    useEffect(() => localStorage.setItem('tracking', JSON.stringify(tracking)), [tracking]);

    const processedData = useMemo(() => preprocessData(data), []);

    return (
        <div className="App">
            <header className="App-header">
                <h1>Limbus Company Mirror Dungeon Resource & Achievements Tracker</h1>
                <Tabs className="tabs" selectedTabClassName="selected-tab" selectedTabPanelClassName="selected-tab-panel">
                    <TabList className="tab-list">
                        <Tab className="tab">Achievements</Tab>
                        <Tab className="tab">Fusions</Tab>
                        <Tab className="tab">Notable Theme Packs</Tab>
                    </TabList>

                    <TabPanel className="tab-panel">
                        <AchievementsTab data={processedData} achievements={achievements} tracking={tracking} setTracking={setTracking} totalPoints={totalPoints} setTotalPoints={setTotalPoints} />
                    </TabPanel>
                    <TabPanel className="tab-panel">
                        <FusionsTab data={processedData} />
                    </TabPanel>
                    <TabPanel className="tab-panel">
                        <ThemePacksTab data={processedData} />
                    </TabPanel>
                </Tabs>
            </header>
            <Footer
                description={"This site was created as a reference for Limbus Company Mirror Dungeon Achievements."}
                gameName={"Limbus Company"}
                developerName={"Project Moon"}
                githubLink={"https://github.com/eldritchtools/limbus-mirror-dungeon-resource"}
            />
        </div>
    );
}

export default App;