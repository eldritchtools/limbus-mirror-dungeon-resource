import { useEffect, useMemo, useState } from "react";
import { useRequestsCache } from "../database/RequestsCacheProvider";
import { useAuth } from "../database/authProvider";
import { savedMdPlansStore } from "../database/localDB";
import { SaveOutline, SaveSolid } from "./Symbols";

function NormalSaveButton({ targetType, targetId, user, buildEntryVersion, iconSize, shortText }) {
    const { checkSaved, toggleSave, fetchUserData } = useRequestsCache();
    const [loading, setLoading] = useState(false);

    useEffect(() => { if (user) fetchUserData(targetType, [targetId]) }, [fetchUserData, targetType, targetId, user]);
    const saved = useMemo(() => checkSaved(targetType, targetId), [checkSaved, targetType, targetId]);

    if (saved === undefined || saved === null) return null;
    const text = shortText ? "" : (saved ? "Saved" : "Save");

    const handleClick = async () => {
        setLoading(true);
        await toggleSave(targetType, targetId);
        setLoading(false);
    };

    if (buildEntryVersion) {
        return <div
            style={{ display: "flex", alignItems: "center", justifyContent: "center", color: loading ? "#aaa" : "#ddd", borderBottomRightRadius: "12px" }}
            onClick={loading ? null : handleClick}
        >
            {saved ? <SaveSolid text={text} size={iconSize} /> : <SaveOutline text={text} size={iconSize} />}
        </div>
    } else {
        return <button onClick={handleClick} className={saved ? "toggle-button-active" : "toggle-button"} disabled={loading}>
            {saved ? <SaveSolid text={text} size={iconSize} /> : <SaveOutline text={text} size={iconSize} />}
        </button>
    }
}

function isLocalId(id) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return !uuidRegex.test(id);
}

function LocalSaveButton({ targetType, targetId, buildEntryVersion, iconSize, shortText }) {
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(false);
    const text = shortText ? "" : (saved ? "Saved" : "Save");

    const store = useMemo(() => {
        switch (targetType) {
            case "md_plan": return savedMdPlansStore;
            default: return null;
        }
    }, [targetType])

    useEffect(() => {
        const fetchSaved = async () => {
            setSaved(await store.get(targetId) !== undefined);
        }
        fetchSaved();
    }, [store, targetId]);

    if (isLocalId(targetId)) return null;

    const handleClick = async () => {
        setLoading(true);
        if (saved) {
            await store.remove(targetId);
            setSaved(false);
        } else {
            await store.save({ id: targetId });
            setSaved(true);
        }
        setLoading(false);
    };

    if (buildEntryVersion) {
        return <div
            style={{ display: "flex", alignItems: "center", justifyContent: "center", color: loading ? "#aaa" : "#ddd", borderBottomRightRadius: "12px" }}
            onClick={loading ? null : handleClick}
        >
            {saved ? <SaveSolid text={text} size={iconSize} /> : <SaveOutline text={text} size={iconSize} />}
        </div>
    } else {
        return <button onClick={handleClick} className={saved ? "toggle-button-active" : "toggle-button"} disabled={loading}>
            {saved ? <SaveSolid text={text} size={iconSize} /> : <SaveOutline text={text} size={iconSize} />}
        </button>
    }
}

export default function SaveButton({ targetType, targetId, buildEntryVersion = false, iconSize, shortText = false }) {
    const { user } = useAuth();
    if (!user) return <LocalSaveButton targetType={targetType} targetId={targetId} buildEntryVersion={buildEntryVersion} iconSize={iconSize} shortText={shortText} />;
    else return <NormalSaveButton targetType={targetType} targetId={targetId} user={user} buildEntryVersion={buildEntryVersion} iconSize={iconSize} shortText={shortText} />;

}
