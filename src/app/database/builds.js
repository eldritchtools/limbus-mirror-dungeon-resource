// import { getSupabase } from "./connection";

// async function getPopularBuilds(page = 1, pageSize = 20) {
//     const start = (page - 1) * pageSize;

//     const { data, error } = await getSupabase().rpc('get_popular_builds_v4', { offset_count: start, limit_count: pageSize });

//     if (error) throw error;
//     return data.map(x => { return { ...x, id: x.build_id } });
// }

// async function getFilteredBuilds(filters, isPublished = true, sortBy = "score", strictFiltering = false, page = 1, pageSize = 20) {
//     const start = (page - 1) * pageSize;

//     const options = {};
//     if ("title" in filters) options["title_filter"] = filters["title"];
//     if ("build_ids" in filters) options["build_id_filter"] = filters["build_ids"];
//     if ("user_id" in filters) options["user_id_filter"] = filters["user_id"];
//     if ("username" in filters) options["username_filter"] = filters["username"];
//     if ("username_exact" in filters) options["username_exact_filter"] = filters["username_exact"];
//     if ("tags" in filters) options["tag_filter"] = filters["tags"];
//     if ("identities" in filters) options["identity_filter"] = filters["identities"];
//     if ("identities_exclude" in filters) options["identity_exclude"] = filters["identities_exclude"];
//     if ("egos" in filters) options["ego_filter"] = filters["egos"];
//     if ("egos_exclude" in filters) options["ego_exclude"] = filters["egos_exclude"];
//     if ("keywords" in filters) options["keyword_filter"] = filters["keywords"];
//     if ("keywords_exclude" in filters) options["keyword_exclude"] = filters["keywords_exclude"];
//     options.p_published = isPublished;
//     options.sort_by = sortBy;
//     options.strict_filter = strictFiltering;
//     options.limit_count = pageSize;
//     options.offset_count = start;

//     const { data, error } = await getSupabase().rpc('get_filtered_builds_v6', options);

//     if (error) throw (error);
//     return data;
// }

// async function getBuild(id, forEdit = false) {
//     const { data, error } = await getSupabase().rpc("get_build_details_v3", {
//         p_build_id: id,
//         p_for_edit: forEdit,
//     });

//     if (error) throw error;
//     return data;
// }

// async function insertBuild(user_id, title, body, identity_ids, ego_ids, keyword_ids, deployment_order, active_sinners, team_code, youtube_video_id, tags, extra_opts, is_published) {
//     const { data, error } = await getSupabase().rpc('create_build_with_tags_v2', {
//         p_user_id: user_id,
//         p_title: title,
//         p_body: body,
//         p_identity_ids: identity_ids,
//         p_ego_ids: ego_ids,
//         p_keyword_ids: keyword_ids,
//         p_deployment_order: deployment_order,
//         p_active_sinners: active_sinners,
//         p_team_code: team_code,
//         p_youtube_video_id: youtube_video_id,
//         p_tags: tags,
//         p_extra_opts: extra_opts,
//         p_published: is_published
//     });

//     if (error) throw (error);
//     return data;
// }

// async function updateBuild(build_id, user_id, title, body, identity_ids, ego_ids, keyword_ids, deployment_order, active_sinners, team_code, youtube_video_id, tags, extra_opts, is_published) {
//     const { error } = await getSupabase().rpc('update_build_with_tags_v2', {
//         p_build_id: build_id,
//         p_user_id: user_id,
//         p_title: title,
//         p_body: body,
//         p_identity_ids: identity_ids,
//         p_ego_ids: ego_ids,
//         p_keyword_ids: keyword_ids,
//         p_deployment_order: deployment_order,
//         p_active_sinners: active_sinners,
//         p_team_code: team_code,
//         p_youtube_video_id: youtube_video_id,
//         p_tags: tags,
//         p_extra_opts: extra_opts,
//         p_published: is_published
//     });

//     if (error) throw (error);
//     return build_id;
// }

// async function deleteBuild(build_id) {
//     const { error } = await getSupabase().from("builds").delete().eq("id", build_id);

//     if (error) throw error;
//     return { deleted: true };
// }

// async function pinComment(buildId, commentId) {
//     const { error } = await getSupabase().from('builds').update({ pinned_comment_id: commentId }).eq('id', buildId);

//     if (error) {
//         console.error('Error pinning comment:', error);
//         return null;
//     }

//     return true;
// }

// async function unpinComment(buildId) {
//     const { error } = await getSupabase().from('builds').update({ pinned_comment_id: null }).eq('id', buildId)

//     if (error) {
//         console.error('Error unpinning comment:', error);
//         return null;
//     }

//     return true;
// }

// async function getBuildsForSitemap(page, count) {
//     const offset = (page - 1) * count;
//     const { data, error } = await getSupabase()
//         .from('builds')
//         .select('id, created_at, updated_at')
//         .eq('is_published', true)
//         .order('created_at', { ascending: true })
//         .range(offset, offset + count - 1);

//     if (error) throw (error);
//     return data;
// }

// async function getBuildsCountForSitemap() {
//     const { count, error } = await getSupabase()
//         .from('builds')
//         .select('*', { count: 'exact', head: true })
//         .eq('is_published', true);

//     if (error) throw (error);
//     return count;
// }


// export { getPopularBuilds, getFilteredBuilds, getBuild, insertBuild, updateBuild, deleteBuild, pinComment, unpinComment, getBuildsForSitemap, getBuildsCountForSitemap };
