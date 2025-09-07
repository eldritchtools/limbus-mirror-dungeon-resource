import { db } from "@eldritchtools/shared-components";
import achievements from './data/achievements.json';

const DB_NAME = "limbus-mirror-dungeon-resource"
const LATEST_VERSION = "6.4";

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
    let latestVersion = "latestVersion" in profile ? profile.latestVersion : 0;
    if (latestVersion === 0) {
        return {
            latestVersion: LATEST_VERSION,
            totalPoints: 0,
            tracking: defaultTracking()
        }
    }

    let migratedProfile = { ...profile };
    let def = defaultTracking();
    if (latestVersion === "6.2") {
        migratedProfile.tracking["Combat"] = def["Combat"]
        latestVersion = "6.3";
    }

    if (latestVersion === "6.3") {
        migratedProfile.tracking["Adversity - EXTREME"] = def["Adversity - EXTREME"]
        migratedProfile.tracking["Completionist"] = def["Completionist"]
        latestVersion = "6.4";
    }

    return migratedProfile;
}

export { firstMigrate };
export default migrateProfile;