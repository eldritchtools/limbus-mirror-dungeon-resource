// "use client";

// import { getSupabase } from "./connection";

// async function getSaves(user_id, page = 1, pageSize = 20) {
//     const { data, error } = await getSupabase().rpc("get_saved_builds_v2", {
//         p_user_id: user_id,
//         limit_count: pageSize,
//         offset_count: (page - 1) * pageSize
//     })

//     if (error) throw error;
//     return data;
// }

// export { getSaves };
