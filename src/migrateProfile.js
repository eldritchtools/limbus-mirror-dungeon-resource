import { db } from "@eldritchtools/shared-components";
import achievements from './data/achievements.json';

const DB_NAME = "limbus-mirror-dungeon-resource"
const LATEST_VERSION = "6.5";

function defaultTracking() {
    return Object.entries(achievements).reduce((acc, [key, achievements]) => {
        acc[key] = new Array(achievements.length).fill(0);
        return acc;
    }, {});
}

async function firstMigrate() {
    let profiles = await db.getItem(DB_NAME, "profiles");
    if (!profiles) {
        let latestVersion = localStorage.getItem("latestVersion");
        // User has never used the tool before
        if (!latestVersion) return;

        // User has used the tool before migration to IndexedDB
        latestVersion = JSON.parse(latestVersion);
        const totalPoints = JSON.parse(localStorage.getItem("totalPoints"));
        const tracking = JSON.parse(localStorage.getItem("tracking"));
        await db.setItem(DB_NAME, "profile-default", {
            latestVersion: latestVersion,
            totalPoints: totalPoints,
            tracking: tracking
        });
    }
}

function migrateProfile(profile = {}) {
    if (!("latestVersion" in profile)) {
        return {
            latestVersion: LATEST_VERSION,
            totalPoints: 0,
            tracking: defaultTracking()
        }
    }

    let migratedProfile = { ...profile };
    let def = defaultTracking();
    if (migratedProfile.latestVersion === "6.2") {
        migratedProfile.tracking["Combat"] = def["Combat"];
        migratedProfile.latestVersion = "6.3";
    }

    if (migratedProfile.latestVersion === "6.3") {
        migratedProfile.tracking["Adversity - EXTREME"] = def["Adversity - EXTREME"]
        migratedProfile.tracking["Completionist"] = def["Completionist"]
        migratedProfile.latestVersion = "6.4";
    }

    if (migratedProfile.latestVersion === "6.4") {
        migratedProfile.tracking["Hidden"] = def["Hidden"]
        migratedProfile.latestVersion = "6.5";
    }

    return migratedProfile;
}

export { firstMigrate };
export default migrateProfile;