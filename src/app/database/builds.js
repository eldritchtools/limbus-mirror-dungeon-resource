import { getSupabase } from "./connection";

async function getFilteredBuilds(filters, isPublished = true, sortBy = "score", strictFiltering = false, page = 1, pageSize = 20) {
    const start = (page - 1) * pageSize;

    const convertSortBy = () => {
        if(["recency", "recent"].includes(sortBy)) return "new";
        return sortBy;
    }

    const options = {};
    if ("query" in filters) options["p_query"] = filters["query"];
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
    if ("ignore_block_discovery" in filters) options["p_ignore_block_discovery"] = filters["ignore_block_discovery"];
    if ("include_egos" in filters) options["p_include_egos"] = filters["include_egos"];
    options.p_published = isPublished;
    options.p_sort_by = convertSortBy(sortBy);
    options.p_strict_filter = strictFiltering;
    options.p_limit = pageSize;
    options.p_offset = start;

    const { data, error } = await getSupabase().rpc('search_builds_v9', options);

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
