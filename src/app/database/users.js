"use client";

import { getSupabase } from "./connection";

async function getUserDataFromUsername(username, field="*") {
    const { data: user } = await getSupabase()
        .from("users")
        .select(field)
        .eq("username", username)
        .maybeSingle();

    if (user) return user;
    else return null;
}

async function updateUser(userId, flair, description, socials) {
    const update = {
        flair: flair.trim(),
        description: description.trim(),
        socials: socials
    };

    const { data, error } = await getSupabase()
        .from("users")
        .update(update)
        .eq("id", userId)

    if (error) throw error;
    return data;
}

export { getUserDataFromUsername, updateUser };
