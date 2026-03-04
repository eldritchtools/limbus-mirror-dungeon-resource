import Dexie from "dexie";

export const db = new Dexie("limbus-mirror-dungeon-resource");

db.version(1).stores({
    achievements: "id",
    runplans: "++id",
    checklists: "++id",
    activechecklists: "id"
});

function makeStore(table) {
    return {
        save: obj => table.put(obj),
        get: key => table.get(key),
        getAll: () => table.toArray(),
        remove: key => table.delete(key),
        clear: () => table.clear()
    };
}

function isLocalId(id) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return !uuidRegex.test(id);
}

export const achievementsStore = makeStore(db.achievements);
export const runPlansStore = makeStore(db.runplans);
export const checklistsStore = makeStore(db.checklists);
export const activeChecklistsStore = makeStore(db.activechecklists);

export { isLocalId };