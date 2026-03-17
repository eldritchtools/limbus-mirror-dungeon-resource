"use client";

import { getSupabase } from "./connection";

async function getComments(type, id, page = 1) {
    const { data, error } = await getSupabase().rpc("get_target_comments_v1", {
        p_target_id: id,
        p_target_type: type,
        p_limit: 20,
        p_offset: (page - 1) * 20
    })

    if (error) throw error;
    return data;
}

async function addComment(type, id, body, parentId = null) {
    const { data, error } = await getSupabase()
        .from("comments")
        .insert([{ target_type: type, target_id: id, body, parent_id: parentId }])
        .select()
        .single();

    if (error) throw error;
    return data;
}

async function updateComment(type, id, body) {
    const { data, error } = await getSupabase()
        .from("comments")
        .update({ body })
        .eq("target_type", type)
        .eq("id", id)

    if (error) throw error;
    return data;
}

async function deleteComment(type, id) {
    console.log(type, id);
    const { error } = await getSupabase()
        .from("comments")
        .update({ body: "", deleted: true })
        .eq("target_type", type)
        .eq("id", id);

    if (error) throw error;
}

export { getComments, addComment, updateComment, deleteComment };