function getFloorsPerPack(floorPacks) {
    const floorsPerPack = { normal: {}, hard: {} };
    Object.entries(floorPacks.normal).forEach(([floor, packs]) => packs.forEach(pack => {
        if (pack in floorsPerPack.normal) floorsPerPack.normal[pack].push(floor);
        else floorsPerPack.normal[pack] = [floor];
    }))
    Object.entries(floorPacks.hard).forEach(([floor, packs]) => packs.forEach(pack => {
        if (pack in floorsPerPack.hard) floorsPerPack.hard[pack].push(floor);
        else floorsPerPack.hard[pack] = [floor];
    }))

    return floorsPerPack;
}

function getFloorsForPack(packId, floorPacks) {
    return {
        normal: Object.entries(floorPacks.normal).filter(([_, packs]) => packs.includes(packId)).map(([floor, _]) => floor),
        hard: Object.entries(floorPacks.hard).filter(([_, packs]) => packs.includes(packId)).map(([floor, _]) => floor)
    };
}

export { getFloorsPerPack, getFloorsForPack };