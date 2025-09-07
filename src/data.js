import data from './data/data.json';
import achievements from './data/achievements.json';
import identities from './data/identities.json';
import rewards from './data/rewards.json';

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

const updatedData = {
    gifts: data.gifts,
    themePacks: data["theme_packs"],
    floors: data.floors,
    achievements,
    identities,
    rewards
}

export default updatedData;