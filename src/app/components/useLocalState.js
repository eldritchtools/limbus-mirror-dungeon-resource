"use client";

import { useState, useEffect, useCallback } from "react";

export default function useLocalState(key, defaultValue) {
    // Initialize with a safe placeholder
    const [state, setState] = useState(defaultValue);

    // Load from localStorage after mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(key);
            if (stored !== null) {
                setState(JSON.parse(stored));
            }
        } catch (error) {
            // console.error("Error reading localStorage key:", key, error);
            setState(defaultValue);
        }
    }, [key, defaultValue]);

    // Wrapped setter: updates state and persists to localStorage
    const setLocalState = useCallback(
        (value) => {
            setState((prev) => {
                const nextValue = typeof value === "function" ? value(prev) : value;

                try {
                    localStorage.setItem(key, JSON.stringify(nextValue));
                } catch (error) {
                    console.error("Error writing localStorage key:", key, error);
                }

                return nextValue;
            });
        },
        [key]
    );

    return [state, setLocalState];
}
