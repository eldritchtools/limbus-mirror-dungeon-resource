import { ReplacedStatusesText } from "@eldritchtools/limbus-shared-library";

const romanMapping = { 1: "I", 2: "II", 3: "III", 4: "IV", 5: "V", 6: "VI", 7: "VII", 8: "VIII", 9: "IX", 10: "X" };

const sinnerMapping = {
    1: "Yi Sang",
    2: "Faust",
    3: "Don Quixote",
    4: "Ryōshū",
    5: "Meursault",
    6: "Hong Lu",
    7: "Heathcliff",
    8: "Ishmael",
    9: "Rodion",
    10: "Sinclair",
    11: "Outis",
    12: "Gregor"
}

const seasonMapping = {
    0: "Standard Fare",
    1: "1 - Orientation",
    2: "2 - Reminiscence",
    3: "3 - Bon Voyage",
    4: "4 - Clear All Cathy",
    5: "5 - Oblivion",
    6: "6 - Zàng Huā Yín",
    7: "7 - Kumo no ito • oti on akA",
    8000: "Pilgrimage of Compassion"
}

const LEVEL_CAP = 60;

function getSeasonString(season) {
    if (season > 9100) return `Walpurgisnacht ${season - 9100}`;
    else return seasonMapping[season];
}

function capitalizeFirstLetter(str) {
    if (typeof str !== 'string' || str.length === 0) {
        return str; // Handle empty strings or non-string inputs
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function ProcessedText({ text, enableTooltips = true, iconStyleOverride = {}, nameStyleOverride = {} }) {
    let str = text.replaceAll("<style=\"highlight\">", "").replaceAll("</style>", "");

    return <ReplacedStatusesText 
        templateText={str} 
        includeTooltips={enableTooltips}
        iconStyleOverride={iconStyleOverride}
        nameStyleOverride={nameStyleOverride}
    />
}

function ColorResist({ resist }) {
    if (resist < 1) {
        return <span style={{ color: "#888", fontWeight: "bold" }}>x{resist}</span>
    } else if (resist > 1) {
        return <span style={{ color: "#fe0000", fontWeight: "bold" }}>x{resist}</span>
    } else {
        return <span style={{ color: "#c8aa80", fontWeight: "bold" }}>x{resist}</span>
    }
}

function fuzzyScore(query, target) {
    query = query.toLowerCase();
    target = target.toLowerCase();

    let qi = 0;
    let score = 0;

    for (let ti = 0; ti < target.length && qi < query.length; ti++) {
        if (target[ti] === query[qi]) {
            score += 2;
            if (ti === qi) score += 1;
            qi++;
        } else {
            score -= 1;
        }
    }

    return qi === query.length ? score : -Infinity;
}

function paragraphScore(query, text) {
    const queryTokens = query.toLowerCase().trim().split(/\s+/);
    const textTokens = text.toLowerCase().trim().split(/\s+/);

    let matches = 0;
    for (const token of queryTokens) {
        matches += textTokens.filter(t => t === token).length;
    }

    let adjacencyBonus = 0;
    for (let i = 0; i < queryTokens.length - 1; i++) {
        for (let j = 0; j < textTokens.length - 1; j++) {
            if (textTokens[j] === queryTokens[i] && textTokens[j + 1] === queryTokens[i + 1]) {
                adjacencyBonus += 0.5; // small boost
            }
        }
    }

    const baseScore = matches / textTokens.length;
    return baseScore + adjacencyBonus;
}

function isLocalId(id) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return !uuidRegex.test(id);
}

export { romanMapping, sinnerMapping, LEVEL_CAP, getSeasonString, capitalizeFirstLetter, ProcessedText, ColorResist, fuzzyScore, paragraphScore, isLocalId };
