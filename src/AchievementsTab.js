import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import "./AchievementsTab.css"
import { useState } from 'react';
import AchievementTips from './AchievementsTips';

function Achievement({ data, achievement, tracking, setAchievementTracking }) {
    let subAchievements = null;
    let achievementText = achievement.text;

    if ("replace" in achievement) {
        Object.entries(achievement.replace).forEach(([key, values]) => achievementText = achievementText.replace(`[${key}]`, values[0] + "~" + values[values.length - 1]));

        subAchievements = [];
        for (let i = 0; i < achievement.points.length; i++) {
            let text = achievement.text;
            Object.entries(achievement.replace).forEach(([key, values]) => text = text.replace(`[${key}]`, values[i]));
            subAchievements.push(<div class="subitem">
                <div style={{ display: "flex", gap: "0.2rem", width: "85%", alignItems: "center" }}>
                    <label class="checkbox-container">
                        <input type="checkbox" onChange={() => {
                            if (tracking[achievement.index] > i) setAchievementTracking(i);
                            else setAchievementTracking(i + 1);
                        }} checked={tracking[achievement.index] > i} />
                        <span class="checkmark" />
                    </label>
                    <span class="points">+{achievement.points[i]}</span>
                    <span class="item-label">{text}</span>
                </div>
                {achievement.hardonly[i] ? <span style={{ color: "#f87171" }}>Hard only</span> : <span style={{ color: "#4ade80" }}>Normal or Hard</span>}
            </div>);
        }
    }

    const hardonly = Array.isArray(achievement.hardonly) ? !achievement.hardonly.some(x => x === false) : achievement.hardonly;
    const points = Array.isArray(achievement.points) ? achievement.points.reduce((acc, x) => acc + x, 0) : achievement.points;
    const len = Array.isArray(achievement.points) ? achievement.points.length : 1;

    return <details>
        <summary>
            <div style={{ display: "flex", gap: "0.2rem", width: "85%", alignItems: "center" }}>
                <label class="checkbox-container">
                    <input type="checkbox" onChange={() => {
                        if (tracking[achievement.index] > len - 1) setAchievementTracking(0);
                        else setAchievementTracking(len);
                    }} checked={tracking[achievement.index] > len - 1} />
                    <span class="checkmark" />
                </label>
                <span class="points">+{points}</span>
                <span class="item-label">{achievementText}</span>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", width: "15%", justifyContent: "end", alignItems: "center" }}>
                {hardonly ? <span style={{ color: "#f87171" }}>Hard only</span> : <span style={{ color: "#4ade80" }}>Normal or Hard</span>}
                <span className="arrow">▼</span>
            </div>
        </summary>
        <div style={{ padding: "0.5rem 1.5rem 0.1rem 1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {subAchievements ? <div>{subAchievements}</div> : null}
            <div style={{ width: "100%", textAlign: "start" }}> <AchievementTips data={data} achievement={achievement} /> </div>
        </div>
    </details>
}

function AchievementTab({ data, achievements, sortClearedToBottom, category, tracking, setAchievementTracking }) {
    if (sortClearedToBottom) {
        const [ticked, unticked] = achievements.reduce((acc, achievement) => {
            if (tracking[achievement.index] === (Array.isArray(achievement.points) ? achievement.points.length : 1)) acc[0].push(achievement);
            else acc[1].push(achievement);
            return acc;
        }, [[], []])

        return <div style={{ display: "flex", justifyContent: "center", width: "100vw", overflowY: "auto" }}>
            <div style={{ display: "flex", flexDirection: "column", width: "75%", maxHeight: "100%" }}>
                {unticked.map(achievement => <Achievement key={achievement.index} data={data} achievement={achievement} tracking={tracking} setAchievementTracking={(value) => setAchievementTracking(category, achievement, value)} />)}
                {ticked.map(achievement => <Achievement key={achievement.index} data={data} achievement={achievement} tracking={tracking} setAchievementTracking={(value) => setAchievementTracking(category, achievement, value)} />)}
            </div>
        </div>
    } else {
        return <div style={{ display: "flex", justifyContent: "center", width: "100vw", overflowY: "auto" }}>
            <div style={{ display: "flex", flexDirection: "column", width: "75%", maxHeight: "100%" }}>
                {achievements.map(achievement => <Achievement key={achievement.index} data={data} achievement={achievement} tracking={tracking} setAchievementTracking={(value) => setAchievementTracking(category, achievement, value)} />)}
            </div>
        </div>
    }
}

function RewardsTab({ data, totalPoints, columns = 2 }) {
    const currentLevel = Math.floor(totalPoints / 100);
    const [rewardsDone, rewardsTodo, levelComponents] = Object.entries(data.rewards).reduce((acc, [level, reward]) => {
        if (parseInt(level) <= currentLevel) {
            if (reward.item in acc[0]) acc[0][reward.item] += reward.count;
            else acc[0][reward.item] = reward.count;
            
            acc[2].push(<div style={{ display: "grid", gridTemplateColumns: "1fr 4fr", textAlign: "center" }}>
                <span style={{ textDecoration: "line-through", padding: "0.1rem", border: "1px #666 dotted" }}>{level}</span>
                <span style={{ textDecoration: "line-through", padding: "0.1rem", border: "1px #666 dotted" }}>{reward.count}x {reward.item}</span>
            </div>);
        } else {
            if (reward.item in acc[1]) acc[1][reward.item] += reward.count;
            else acc[1][reward.item] = reward.count;

            acc[2].push(<div style={{ display: "grid", gridTemplateColumns: "1fr 4fr", textAlign: "center" }}>
                <span style={{ padding: "0.1rem", border: "1px #666 dotted" }}>{level}</span>
                <span style={{ padding: "0.1rem", border: "1px #666 dotted" }}>{reward.count}x {reward.item}</span>
            </div>);
        }

        return acc;
    }, [{}, {}, []]);


    const colLengths = Array.from({ length: columns }, (_, i) => Math.floor(levelComponents.length / columns) + (i < levelComponents.length % columns ? 1 : 0));
    const colStarts = colLengths.reduce((acc, length) => { acc.push(acc[acc.length - 1] + length); return acc; }, [0]);

    const reorderedComponents = [];
    for (let i = 0; i < colLengths[0]; i++) {
        for (let j = 0; j < columns; j++) {
            if (i >= colLengths[j]) break;
            const num = colStarts[j] + i;
            if (num >= levelComponents.length) break;
            reorderedComponents.push(levelComponents[num]);
        }
    }

    const headers = [];
    for (let i = 0; i < columns; i++) {
        headers.push(<div style={{ display: "grid", gridTemplateColumns: "1fr 4fr", textAlign: "center" }}>
            <span style={{ fontWeight: "bold", padding: "0.1rem", border: "1px #666 dotted" }}>Level</span>
            <span style={{ fontWeight: "bold", padding: "0.1rem", border: "1px #666 dotted" }}>Reward</span>
        </div>);
    }

    return <div style={{ display: "flex", flexDirection: "column", gap: "0.5em", overflowY: "auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
            <div>
                <div style={{ fontWeight: "bold" }}>Rewards Obtained:</div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                    {Object.entries(rewardsDone).map(([item, count]) => <span>{count}x {item}</span>)}
                </div>
            </div>
            <div>
                <div style={{ fontWeight: "bold" }}>Rewards To Get:</div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                    {Object.entries(rewardsTodo).map(([item, count]) => <span>{count}x {item}</span>)}
                </div>
            </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`}}>
            {headers}
            {reorderedComponents}
        </div>
    </div>;
}

function AchievementsTab({ data, achievements, tracking, setTracking, totalPoints, setTotalPoints }) {
    const [sortClearedToBottom, setSortClearedToBottom] = useState(false);

    const setAchievementTracking = (category, achievement, value) => {
        if (Array.isArray(achievement.points)) {
            let v = tracking[category][achievement.index];
            let diff = 0;
            while (v < value) diff += achievement.points[v++];
            while (v > value) diff -= achievement.points[--v];

            setTotalPoints(totalPoints + diff);
        } else {
            if (value === 1) setTotalPoints(totalPoints + achievement.points);
            else setTotalPoints(totalPoints - achievement.points);
        }

        setTracking({
            ...tracking,
            [category]: tracking[category].map((x, i) => {
                if (achievement.index === i) return value;
                else return x;
            })
        })
    }

    const toggleSortClearedToBottom = () => {
        setSortClearedToBottom(!sortClearedToBottom);
    }

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
        <div style={{ display: "flex", flexDirection: "row", gap: "0.5rem", alignItems: "center" }}>
            <div>Level: {Math.floor(totalPoints / 100)}</div>
            <div style={{ width: "5rem", height: "20px", backgroundColor: "#333", borderRadius: "5px", overflow: "hidden", position: "relative" }}>
                <div style={{ width: `${totalPoints % 100}%`, height: "100%", backgroundColor: "#4caf50", transition: "width 0.3s ease" }} />
                <span style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontWeight: "bold", textShadow: "0 0 8px #000" }}> {totalPoints % 100}/100 </span>
            </div>
            <button class={`toggle-button ${sortClearedToBottom ? 'active' : ''}`} onClick={toggleSortClearedToBottom}>Sort Cleared to Bottom</button>
        </div>
        <Tabs className="tabs" selectedTabClassName="selected-tab" selectedTabPanelClassName="selected-tab-panel">
            <TabList className="tab-list">
                {Object.entries(achievements).map(([category, _list]) => <Tab className="tab">{category}</Tab>)}
                <Tab className="tab">Rewards</Tab>
            </TabList>

            {Object.entries(achievements).map(([category, list]) =>
                <TabPanel className="tab-panel" style={{ height: "85vh" }}>
                    <AchievementTab data={data} achievements={list} sortClearedToBottom={sortClearedToBottom} category={category} tracking={tracking[category]} setAchievementTracking={setAchievementTracking} />
                </TabPanel>)}
            <TabPanel className="tab-panel" style={{ height: "85vh" }}>
                <RewardsTab data={data} totalPoints={totalPoints} />
            </TabPanel>
        </Tabs>
    </div>
}

export default AchievementsTab;