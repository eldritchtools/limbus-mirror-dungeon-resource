"use client";

import { Icon } from "@eldritchtools/limbus-shared-library";
import { selectStyleVariable } from "../styles";
import TagSelector, { tagToTagSelectorOption } from "../components/TagSelector";
import { useState } from "react";
import { keywordIconConvert, keywordToIdMapping } from "../keywordIds";
import { EgoSelector, IdentitySelector } from "../components/SelectorsDropdown";
import "./BuildsSearchComponent.css";
import { generalTooltipProps } from "../components/GeneralTooltip";

function KeywordSelector({ selectedKeywords, setSelectedKeywords }) {
    const handleToggle = (filter, selected, excluded) => {
        if (selected)
            setSelectedKeywords(p => p.map(x => x === filter ? `-${x}` : x));
        else if (excluded)
            setSelectedKeywords(p => p.filter(x => `-${filter}` !== x));
        else
            setSelectedKeywords(p => [...p, filter]);
    }

    const clearAll = () => {
        setSelectedKeywords([]);
    }

    const toggleComponent = (filter) => {
        const selected = selectedKeywords.includes(filter);
        const excluded = !selected && selectedKeywords.includes(`-${filter}`);

        return <div key={filter} style={{
            backgroundColor: selected ? "#3f3f3f" : (excluded ? "rgba(239,68,68, 0.8)" : "transparent"), height: "32px", display: "flex",
            alignItems: "center", justifyContent: "center", padding: "0.1rem 0.2rem", cursor: "pointer",
            borderBottom: selected ? "2px #4caf50 solid" : (excluded ? "2px #dc2626 solid" : "transparent"),
            transition: "all 0.2s"
        }}
            onClick={() => handleToggle(filter, selected, excluded)}
        >
            <Icon path={keywordIconConvert(filter)} style={{ height: "32px" }} />
        </div>
    }

    return <div style={{ display: "flex", flexWrap: "wrap", border: "1px #777 dotted", borderRadius: "1rem", minWidth: "100px", padding: "0.5rem", justifyContent: "center" }}>
        {Object.keys(keywordToIdMapping).reduce((acc, kw) => [...acc, toggleComponent(kw)], [])}
        {<div style={{ display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} onClick={clearAll}>Clear All</div>}
    </div>
}

export default function BuildsSearchComponent({ options = {}, setFilters }) {
    const [title, setTitle] = useState(options.title || "");
    const [username, setUsername] = useState(options.username || "");
    const [tags, setTags] = useState((options.tags || []).map(t => tagToTagSelectorOption(t)));
    const [identities, setIdentities] = useState(options.identities || []);
    const [egos, setEgos] = useState(options.egos || []);
    const [keywords, setKeywords] = useState(options.keywords || []);
    const [sortBy, setSortBy] = useState(options.sortBy || "score");
    const [strictFiltering, setStrictFiltering] = useState(options.strictFiltering || false);
    const [identitiesExclude, setIdentitiesExclude] = useState(false);
    const [egosExclude, setEgosExclude] = useState(false);

    const applyFilters = () => {
        const searchFilters = {};
        if (title !== "") searchFilters.title = title;
        if (username !== "") searchFilters.username = username;
        if (tags.length > 0) searchFilters.tags = tags.map(t => t.value);
        if (identities.length > 0) searchFilters.identities = identities;
        if (egos.length > 0) searchFilters.egos = egos;
        if (keywords.length > 0) searchFilters.keywords = keywords;
        if (sortBy !== "score") searchFilters.sortBy = sortBy;
        if (strictFiltering) searchFilters.strictFiltering = true;

        setFilters(searchFilters);
    };

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "0.5rem", maxWidth: "940px" }}>
            <span style={{ display: "flex", alignItems: "center", justifyContent: "end" }}>Title</span>
            <div style={{ display: "flex" }}><input value={title} onChange={e => setTitle(e.target.value)} style={{ minWidth: "clamp(15rem, 90%, 25rem)", maxWidth: "100%" }} /></div>
            <span style={{ display: "flex", alignItems: "center", justifyContent: "end" }}>User</span>
            <div style={{ display: "flex" }}><input value={username} onChange={e => setUsername(e.target.value)} style={{ minWidth: "clamp(15rem, 90%, 25rem)", maxWidth: "100%" }} /></div>
            <span style={{ display: "flex", alignItems: "center", justifyContent: "end" }}>Tags</span>
            <TagSelector selected={tags} onChange={setTags} creatable={false} styles={selectStyleVariable} />
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", textAlign: "end", gap: "0.2rem" }}>
                <div {...generalTooltipProps("includeExclude")} style={{ borderBottom: "1px #777 dotted" }}>Identities</div>
                <div
                    className="toggle-text"
                    onClick={() => setIdentitiesExclude(p => !p)}
                    style={{ color: identitiesExclude ? "#f87171" : "#4ade80" }}
                >
                    {identitiesExclude ? "Exclude" : "Include"}
                </div>
            </div>
            <IdentitySelector selected={identities} setSelected={setIdentities} isMulti={true} styles={selectStyleVariable} excludeMode={identitiesExclude} />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "end", textAlign: "end", gap: "0.2rem" }}>
                <div {...generalTooltipProps("includeExclude")} style={{ borderBottom: "1px #777 dotted" }}>EGOs</div>
                <div
                    className="toggle-text"
                    onClick={() => setEgosExclude(p => !p)}
                    style={{ color: egosExclude ? "#f87171" : "#4ade80" }}
                >
                    {egosExclude ? "Exclude" : "Include"}
                </div>
            </div>
            <EgoSelector selected={egos} setSelected={setEgos} isMulti={true} styles={selectStyleVariable} excludeMode={egosExclude} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "end" }}>
                <span {...generalTooltipProps("twiceToExclude")} style={{ borderBottom: "1px #777 dotted" }}>Keywords</span>
            </div>
            <KeywordSelector selectedKeywords={keywords} setSelectedKeywords={setKeywords} />
            <span style={{ display: "flex", alignItems: "center", justifyContent: "end" }}>Sort By</span>
            <div style={{ display: "flex", flexDirection: "row", gap: "0.5rem", alignItems: "center" }}>
                <label>
                    <input type="radio" name="sortBy" value={"score"} checked={sortBy === "score"} onChange={e => setSortBy(e.target.value)} />
                    Score
                </label>
                <label>
                    <input type="radio" name="sortBy" value={"recency"} checked={sortBy === "recency"} onChange={e => setSortBy(e.target.value)} />
                    Newest
                </label>
            </div>
            <div />
            <div style={{ display: "flex", flexDirection: "row", gap: "0.5rem", alignItems: "center" }}>
                <label>
                    <input type="checkbox" checked={strictFiltering} onChange={e => setStrictFiltering(e.target.checked)} />
                    Strict Filtering (require all selected filters)
                </label>
            </div>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginTop: "0.2rem" }}>
            <button style={{ fontSize: "1.2rem", cursor: "pointer" }} onClick={applyFilters}>Search Builds</button>
        </div>
    </div>
}
