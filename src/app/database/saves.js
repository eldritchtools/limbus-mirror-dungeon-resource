"use client";

import { getSupabase } from "./connection";

async function getSavedMdPlans(user_id, page = 1, pageSize = 20) {
    const { data, error } = await getSupabase().rpc("get_saved_md_plans", {
        p_user_id: user_id,
        p_sort_by: null,
        p_limit: pageSize,
        p_offset: (page - 1) * pageSize
    })

    if (error) throw error;
    return data;
}

export { getSavedMdPlans };
