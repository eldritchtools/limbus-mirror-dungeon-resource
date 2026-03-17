import { getSupabase } from "./connection";

async function searchMdPlans({
    query = null,
    planIds = null,
    username = null,
    userId = null,
    tags = null,
    sortBy = null,
    limit = 20,
    offset = 0,
    published = true,
    ignoreBlockDiscovery = false
} = {}) {

    const { data, error } = await getSupabase().rpc('search_md_plans_v1', {
        p_query: query,
        plan_id_filter: planIds,
        username_exact_filter: username,
        user_id_filter: userId,
        tag_filter: tags,
        p_sort_by: sortBy,
        p_limit: limit,
        p_offset: offset,
        p_published: published,
        p_ignore_block_discovery: ignoreBlockDiscovery
    });

    if (error) throw error;
    return data;
}

async function getMdPlan(planId) {

    const { data, error } = await getSupabase().rpc('get_md_plan_v1', {
        p_plan_id: planId
    });

    if (error) throw error;
    return data;
}

async function createMdPlan(plan) {
    const { data, error } = await getSupabase().rpc('create_md_plan_v1', {
        p_title: plan.title,
        p_body: plan.body,
        p_recommendation_mode: plan.recommendation_mode,
        p_difficulty: plan.difficulty,
        p_identity_ids: plan.identity_ids,
        p_ego_ids: plan.ego_ids,
        p_grace_levels: plan.grace_levels,
        p_cost: plan.cost,
        p_keyword_id: plan.keyword_id,
        p_start_gift_ids: plan.start_gift_ids,
        p_observe_gift_ids: plan.observe_gift_ids,
        p_target_gift_ids: plan.target_gift_ids,
        p_floors: plan.floors,
        p_youtube_video_id: plan.youtube_video_id,
        p_is_published: plan.is_published,
        p_block_discovery: plan.block_discovery,
        p_build_ids: plan.build_ids,
        p_tags: plan.tags
    });

    if (error) throw error;
    return data; // plan id
}

async function updateMdPlan(planId, plan) {
    const { error } = await getSupabase().rpc('update_md_plan_v1', {
        p_plan_id: planId,
        p_title: plan.title,
        p_body: plan.body,
        p_recommendation_mode: plan.recommendation_mode,
        p_difficulty: plan.difficulty,
        p_identity_ids: plan.identity_ids,
        p_ego_ids: plan.ego_ids,
        p_grace_levels: plan.grace_levels,
        p_cost: plan.cost,
        p_keyword_id: plan.keyword_id,
        p_start_gift_ids: plan.start_gift_ids,
        p_observe_gift_ids: plan.observe_gift_ids,
        p_target_gift_ids: plan.target_gift_ids,
        p_floors: plan.floors,
        p_youtube_video_id: plan.youtube_video_id,
        p_is_published: plan.is_published,
        p_block_discovery: plan.block_discovery,
        p_build_ids: plan.build_ids,
        p_tags: plan.tags
    });

    if (error) throw error;
    return planId;
}

async function deleteMdPlan(plan_id) {
    const { error } = await getSupabase().from("md_plans").delete().eq("id", plan_id);

    if (error) throw error;
    return { deleted: true };
}


async function pinMdPlanComment(planId, commentId) {
    const { error } = await getSupabase().from('md_plans').update({ pinned_comment_id: commentId }).eq('id', planId);

    if (error) {
        console.error('Error pinning comment:', error);
        return null;
    }

    return true;
}

async function unpinMdPlanComment(planId) {
    const { error } = await getSupabase().from('md_plans').update({ pinned_comment_id: null }).eq('id', planId);

    if (error) {
        console.error('Error unpinning comment:', error);
        return null;
    }

    return true;
}


export { searchMdPlans, getMdPlan, createMdPlan, updateMdPlan, deleteMdPlan, pinMdPlanComment, unpinMdPlanComment };