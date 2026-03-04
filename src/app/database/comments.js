// "use client";

// import { getSupabase } from "./connection";

// async function getComments(id, page = 1) {
//     const { data, error } = await getSupabase().rpc("get_build_comments_v2", {
//         p_build_id: id,
//         p_limit: 20,
//         p_offset: (page - 1) * 20
//     })

//     if (error) throw error;
//     return data;
// }

// async function addComment(buildId, body, parentId = null) {
//     const { data, error } = await getSupabase()
//         .from("comments")
//         .insert([{ build_id: buildId, body, parent_id: parentId }])
//         .select()
//         .single();

//     if (error) throw error;
//     return data;
// }

// async function updateComment(buildId, body) {
//     const { data, error } = await getSupabase()
//         .from("comments")
//         .update({ body })
//         .eq("id", buildId)

//     if (error) throw error;
//     return data;
// }

// async function deleteComment(commentId) {
//     const { error } = await getSupabase()
//         .from("comments")
//         .update({ body: "", deleted: true })
//         .eq("id", commentId);

//     if (error) throw error;
// }

// export { getComments, addComment, updateComment, deleteComment };