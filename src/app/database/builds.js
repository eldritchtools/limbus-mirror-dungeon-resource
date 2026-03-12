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
    if ("ignore_block_discovery" in filters) options["ignore_block_discovery"] = filters["ignore_block_discovery"];
    options.p_published = isPublished;
    options.sort_by = sortBy;
    options.limit_count = pageSize;
    options.offset_count = start;

    const { data, error } = await getSupabase().rpc('get_filtered_builds_v7', options);

    if (error) throw (error);
    return data;
}

export { getFilteredBuilds };
