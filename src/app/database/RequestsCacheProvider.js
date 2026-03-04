"use client";

import { createContext, useContext, useState, useCallback, useRef } from "react";
import { getSupabase } from './connection';
import { useAuth } from "./authProvider";

const RequestsCacheContext = createContext(null);

export function RequestsCacheProvider({ children }) {
    const { user } = useAuth();
    const [likedMap, setLikedMap] = useState({});
    const [savedMap, setSavedMap] = useState({});
    const loadedIds = useRef(new Set());
    const queuedIds = useRef(new Set());
    const flushTimeout = useRef(null);

    const fetchUserData = useCallback(async (buildIds) => {
        if (!user) return;

        const newIds = buildIds.filter(id => !loadedIds.current.has(id));
        if (newIds.length === 0) return;

        newIds.forEach(id => loadedIds.current.add(id));
        newIds.forEach(id => queuedIds.current.add(id));

        const fetchLikes = async (ids) => {
            const { data, error } = await getSupabase()
                .from("likes")
                .select("build_id")
                .in("build_id", ids)
                .eq("user_id", user.id);

            if (error) {
                console.error("Error loading likes", error);
                return {};
            }

            const result = new Set(data.map(r => r.build_id));
            const update = {};
            for (const id of ids) update[id] = result.has(id);
            setLikedMap(prev => ({ ...prev, ...update }));
        }

        const fetchSaves = async (ids) => {
            const { data, error } = await getSupabase()
                .from("saves")
                .select("build_id")
                .in("build_id", ids)
                .eq("user_id", user.id);

            if (error) {
                console.error("Error loading saves", error);
                return {};
            }

            const result = new Set(data.map(r => r.build_id));
            const update = {};
            for (const id of ids) update[id] = result.has(id);
            setSavedMap(prev => ({ ...prev, ...update }));
        }

        async function flushUserData(ids) {
            if (!ids.length) return;

            const init = Object.fromEntries(ids.map(id => [id, null]));
            setLikedMap(prev => ({ ...prev, ...init }));
            setSavedMap(prev => ({ ...prev, ...init }));

            await Promise.all([fetchLikes(ids), fetchSaves(ids)]);
        }

        if (!flushTimeout.current) {
            flushTimeout.current = setTimeout(() => {
                const idsToFetch = Array.from(queuedIds.current);
                queuedIds.current.clear();
                flushTimeout.current = null;

                flushUserData(idsToFetch);
            }, 0);
        }
    }, [user]);

    const toggleLike = async (buildId) => {
        if (!user) return;
        const current = likedMap[buildId];

        if (current) {
            await getSupabase().from("likes").delete().eq("build_id", buildId);
        } else {
            await getSupabase().from("likes").insert({ build_id: buildId });
        }

        setLikedMap((prev) => ({ ...prev, [buildId]: !current }));
    };

    const toggleSave = async (buildId) => {
        if (!user) return;
        const current = savedMap[buildId];

        if (current) {
            await getSupabase().from("saves").delete().eq("build_id", buildId);
        } else {
            await getSupabase().from("saves").insert({ build_id: buildId });
        }

        setSavedMap((prev) => ({ ...prev, [buildId]: !current }));
    };

    return (
        <RequestsCacheContext.Provider
            value={{
                likedMap,
                savedMap,
                fetchUserData,
                toggleLike,
                toggleSave
            }}
        >
            {children}
        </RequestsCacheContext.Provider>
    );
}

export function useRequestsCache() {
    const ctx = useContext(RequestsCacheContext);
    if (!ctx) throw new Error("useRequestsCache must be used within provider");
    return ctx;
}
