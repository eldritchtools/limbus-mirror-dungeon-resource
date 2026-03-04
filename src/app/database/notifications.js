"use client";

import { getSupabase } from "./connection";

async function getNotifications(userId, limit = null) {
    let options = { p_user_id: userId };

    if (limit) options.p_limit = limit;

    const { data, error } = await getSupabase().rpc('get_user_md_notifications', options);

    if (error) throw error;
    return data;
}

async function setNotificationRead(id) {
    const { data, error } = await getSupabase()
        .from('md_notifications')
        .update({ is_read: true })
        .eq('id', id);

    if (error) throw error;
    return data;
}

async function getUnreadNotificationsCount(userId) {
    const { count, error } = await getSupabase()
        .from("md_notifications")
        .select("id", { count: "exact", head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

    if (error) throw error;
    return count ?? 0;
}

export { getNotifications, setNotificationRead, getUnreadNotificationsCount};
