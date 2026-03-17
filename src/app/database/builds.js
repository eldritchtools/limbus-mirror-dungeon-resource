import { getSupabase } from "./connection";

async function getFilteredBuilds(filters, isPublished = true, sortBy = "score", strictFiltering = false, page = 1, pageSize = 20) {
    const start = (page - 1) * pageSize;

    const options = {};
    if ("title" in filters) options["title_filter"] = filters["title"];
    if ("build_ids" in filters) options["build_id_filter"] = filters["build_ids"];
    if ("user_id" in filters) options["user_id_filter"] = filters["user_id"];
    if ("username" in filters) options["username_filter"] = filters["username"];
    if ("username_exact" in filters) options["username_exact_filter"] = filters["username_exact"];
    if ("tags" in filters) options["tag_filter"] = filters["tags"];
    if ("identities" in filters) options["identity_filter"] = filters["identities"];
    if ("identities_exclude" in filters) options["identity_exclude"] = filters["identities_exclude"];
    if ("egos" in filters) options["ego_filter"] = filters["egos"];
    if ("egos_exclude" in filters) options["ego_exclude"] = filters["egos_exclude"];
    if ("keywords" in filters) options["keyword_filter"] = filters["keywords"];
    if ("keywords_exclude" in filters) options["keyword_exclude"] = filters["keywords_exclude"];
    if ("ignore_block_discovery" in filters) options["ignore_block_discovery"] = filters["ignore_block_discovery"];
    options.p_published = isPublished;
    options.sort_by = sortBy;
    options.strict_filter = strictFiltering;
    options.limit_count = pageSize;
    options.offset_count = start;
    options.include_egos = true;

    const { data, error } = await getSupabase().rpc('get_filtered_builds_v8', options);

    if (error) throw (error);
    return data;
}

async function getBuild(id, min_details = true) {
    const { data, error } = await getSupabase().rpc("get_build_details_v5", {
        p_build_id: id,
        p_min_details: min_details,
    });

    if (error) throw error;
    return data;
}

export { getFilteredBuilds, getBuild };
