
const keywordToIdMapping = {
    "Burn": 1,
    "Bleed": 2,
    "Tremor": 3,
    "Rupture": 4,
    "Sinking": 5,
    "Poise": 6,
    "Charge": 7,
    "wrath": 8,
    "lust": 9,
    "sloth": 10,
    "gluttony": 11,
    "gloom": 12,
    "pride": 13,
    "envy": 14,
    "slash": 15,
    "pierce": 16,
    "blunt": 17,
    "guard": 18,
    "evade": 19,
    "counter": 20
}

const keywordIdMapping = Object.fromEntries(
    Object.entries(keywordToIdMapping).map(([key, value]) => [value, key])
);

function keywordIconConvert(str) {
    const lower = str.toLowerCase();
    if (["wrath", "lust", "sloth", "gluttony", "gloom", "pride", "envy"].includes(lower)) {
        return lower;
    } else if (["burn", "bleed", "tremor", "rupture", "sinking", "poise", "charge"].includes(lower)) {
        return str.charAt(0).toUpperCase() + lower.slice(1);
    } else if (["slash", "pierce", "blunt", "guard", "evade", "counter"].includes(lower)) {
        return str.charAt(0).toUpperCase() + lower.slice(1);
    } else {
        return null;
    }
}

export { keywordToIdMapping, keywordIdMapping, keywordIconConvert };
