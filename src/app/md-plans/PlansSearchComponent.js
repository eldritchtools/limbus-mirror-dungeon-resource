"use client";

import { selectStyleVariable } from "../styles";
import TagSelector, { tagToTagSelectorOption } from "../components/TagSelector";
import { useState } from "react";
import "./PlansSearchComponent.css";
import NoPrefetchLink from "../NoPrefetchLink";

export default function PlansSearchComponent({ options = {} }) {
    const [searchString, setSearchString] = useState(options.search || "");
    const [tags, setTags] = useState((options.tags || []).map(t => tagToTagSelectorOption(t)));

    const applyFilters = () => {
        const searchFilters = {};
        if (searchString !== "") searchFilters.search = searchString;
        if (tags.length > 0) searchFilters.tags = tags.map(t => t.value);

        const params = new URLSearchParams(searchFilters);
        window.location.href = `/md-plans/search?${params.toString()}`;
    };

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "0.5rem", maxWidth: "940px" }}>
            <span style={{ display: "flex", alignItems: "center", justifyContent: "end" }}>Search</span>
            <div style={{ display: "flex" }}><input value={searchString} onChange={e => setSearchString(e.target.value)} style={{ minWidth: "clamp(15rem, 90%, 25rem)", maxWidth: "100%" }} /></div>
            <span style={{ display: "flex", alignItems: "center", justifyContent: "end" }}>Tags</span>
            <TagSelector selected={tags} onChange={setTags} creatable={false} styles={selectStyleVariable} />
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginTop: "0.2rem" }}>
            <button style={{ fontSize: "1.2rem", cursor: "pointer" }} onClick={applyFilters}>Search MD Plans</button>
            or <NoPrefetchLink className="text-link" href={"/md-plans/new"}>create an md plan</NoPrefetchLink>
        </div>
    </div>
}
