import achievements from './data/achievements.json';
import rewards from './data/rewards.json';

// Add indices per category to achievements
Object.entries(achievements).forEach(([_category, list]) => {
    list.forEach((achievement, index) => { achievement["index"] = index; });
})

const updatedData = {
    achievements,
    rewards
}

export default updatedData;