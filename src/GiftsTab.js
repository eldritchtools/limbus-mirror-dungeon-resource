import { useEffect, useMemo, useState } from "react";
import { affinityColorMapping, Gift, Icon, ReplacedStatusesText, useData } from "@eldritchtools/limbus-shared-library";
import { useBreakpoint } from "@eldritchtools/shared-components";
import { TierComponent } from "@eldritchtools/limbus-shared-library";
import Select from "react-select";
import { selectStyleVariable } from "./styles";

function GiftDesc({ gift, tagStrips }) {
    const [expand, setExpand] = useState(false);

    return <div style={{ display: "flex", flexDirection: "column", padding: "0.5rem", width: "100%", height: "fit-content", border: "1px #aaa solid", borderRadius: "1rem", boxSizing: "border-box", cursor: "pointer" }} onClick={() => setExpand(!expand)}>
        <div style={{ marginBottom: "0.5rem", fontSize: "1.25rem", fontWeight: "bold", textAlign: "start", color: affinityColorMapping[gift.affinity] }}>
            {gift.names[0]}
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
                <Gift gift={gift} includeTooltip={false} expandOverride={expand} setExpandOverride={() => setExpand(false)} tagStrips={tagStrips} />
            </div>
            <div style={{ display: "inline-block", fontSize: "1rem", lineHeight: "1.5", textWrap: "wrap", whiteSpace: "pre-wrap", textAlign: "start" }}>
                <ReplacedStatusesText templateText={gift.descs[0]} />
            </div>
        </div>
    </div>
}

function GiftCard({ gift, isSmall, tagStrips }) {
    const [expand, setExpand] = useState(false);

    return <div style={{
        display: "flex", flexDirection: "column", padding: "0.5rem", width: "min(400px, 95%)", height: isSmall ? "175px" : "250px",
        border: "1px #aaa solid", borderRadius: "1rem", cursor: "pointer"
    }} onClick={() => setExpand(!expand)}>
        <div style={{ marginBottom: "0.5rem", fontSize: "1.25rem", fontWeight: "bold", textAlign: "center", color: affinityColorMapping[gift.affinity] }}>
            {gift.names[0]}
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
                <Gift gift={gift} includeTooltip={false} expandOverride={expand} setExpandOverride={() => setExpand(false)} scale={isSmall ? .6 : 1} tagStrips={tagStrips} />
            </div>
            <div style={{
                display: "inline-block", fontSize: "1rem", lineHeight: "1.5", inlineSize: "50ch", textWrap: "wrap",
                whiteSpace: "pre-wrap", textAlign: "start", height: isSmall ? "150px" : "200px", overflowY: "auto"
            }}>
                <ReplacedStatusesText templateText={gift.descs[0]} />
            </div>
        </div>
    </div>
}

function includesIgnoreCase(s1, s2) {
    return s1.toLowerCase().includes(s2.toLowerCase());
}

function checkSearchMatch(searchString, includeDescription, gift) {
    if (includesIgnoreCase(gift.names[0], searchString)) return true;
    if (includeDescription && includesIgnoreCase(gift.search_desc, searchString)) return true;
    return false;
}

const mainFilters = {
    "tiers": ["1", "2", "3", "4", "5", "EX"],
    "keyword": ["Burn", "Bleed", "Tremor", "Rupture", "Sinking", "Poise", "Charge"],
    "keyword2": ["Slash", "Pierce", "Blunt", "Keywordless"],
    "affinity": ["wrath", "lust", "sloth", "gluttony", "gloom", "pride", "envy"]
}

const mainFiltersMapping = Object.entries(mainFilters).reduce((acc, [type, list]) => {
    let usedType = type;
    if (usedType === "keyword2") usedType = "keyword"
    return list.reduce((acc2, filter) => { acc2[filter] = usedType; return acc2; }, acc)
}, {});

function GiftList({ searchString, selectedMainFilters, tagFilter, tagFilterExcluding, includeDescription, displayType, showTagStrips, giftsData, isSmall }) {
    const [filters, filtersExclude] = useMemo(() => selectedMainFilters.reduce(([f, fe], filter) => {
        const exc = filter[0] === "-";
        let realFilter = exc ? filter.slice(1) : filter;

        if (exc) {
            if (mainFiltersMapping[realFilter] in fe) fe[mainFiltersMapping[realFilter]].push(realFilter);
            else fe[mainFiltersMapping[realFilter]] = [realFilter];
        } else {
            if (mainFiltersMapping[realFilter] in f) f[mainFiltersMapping[realFilter]].push(realFilter);
            else f[mainFiltersMapping[realFilter]] = [realFilter];
        }

        return [f, fe];
    }, [{}, {}]), [selectedMainFilters]);

    const list = useMemo(() => Object.entries(giftsData).filter(([_id, gift]) => {
        if (searchString !== "" && !checkSearchMatch(searchString, includeDescription, gift)) return false;

        for (const type in filters) {
            if (type === "tiers") {
                if (!filters[type].includes(gift.tier)) return false;
            } else if (type === "keyword") {
                if (!filters[type].includes(gift.keyword)) return false;
            } else if (type === "affinity") {
                if (!filters[type].includes(gift.affinity)) return false;
            }
        }

        for (const type in filtersExclude) {
            if (type === "tiers") {
                if (filtersExclude[type].includes(gift.tier)) return false;
            } else if (type === "keyword") {
                if (filtersExclude[type].includes(gift.keyword)) return false;
            } else if (type === "affinity") {
                if (filtersExclude[type].includes(gift.affinity)) return false;
            }
        }

        if (tagFilter) {
            if (tagFilterExcluding) {
                if (tagFilter === "Enhanceable") {
                    if (gift.enhanceable) return false;
                } else if (tagFilter === "Fusion Only") {
                    if (gift.fusion) return false;
                } else if (tagFilter === "Hard Only") {
                    if (gift.hardonly) return false;
                } else if (tagFilter === "Cursed") {
                    if (gift.cursedPair) return false;
                } else if (tagFilter === "Blessed") {
                    if (gift.blessedPair) return false;
                }
            } else {
                if (tagFilter === "Enhanceable") {
                    if (!gift.enhanceable) return false;
                } else if (tagFilter === "Fusion Only") {
                    if (!gift.fusion) return false;
                } else if (tagFilter === "Hard Only") {
                    if (!gift.hardonly) return false;
                } else if (tagFilter === "Cursed") {
                    if (!gift.cursedPair) return false;
                } else if (tagFilter === "Blessed") {
                    if (!gift.blessedPair) return false;
                }
            }
        }

        return true;
    }), [searchString, filters, filtersExclude, tagFilter, tagFilterExcluding, includeDescription, giftsData]);

    const listComponents = list.map(([id, gift]) => {
        switch (displayType) {
            case "icon": return <Gift key={id} gift={gift} includeTooltip={true} scale={isSmall ? .6 : 1} tagStrips={showTagStrips} />;
            case "card": return <GiftCard key={id} gift={gift} isSmall={isSmall} tagStrips={showTagStrips} />;
            case "desc": return <GiftDesc key={id} gift={gift} tagStrips={showTagStrips} />;
            default: return null;
        }
    });

    const columns = displayType === "icon" ?
        `repeat(auto-fill, minmax(${isSmall ? 60 : 100}px, 1fr))` :
        displayType === "card" ?
            `repeat(auto-fill, minmax(${isSmall ? "100%" : "400px"}, 1fr))` :
            "1fr"

    return <div style={{ display: "grid", gridTemplateColumns: columns, width: "100%", rowGap: "0.5rem" }}>
        {listComponents}
    </div>
}

function MainFilterSelector({ selectedMainFilters, setSelectedMainFilters }) {
    const handleToggle = (filter, selected, excluded) => {
        if (selected)
            setSelectedMainFilters(p => p.map(x => x === filter ? `-${x}` : x));
        else if (excluded)
            setSelectedMainFilters(p => p.filter(x => `-${filter}` !== x));
        else
            setSelectedMainFilters(p => [...p, filter]);
    }

    const clearAll = () => {
        setSelectedMainFilters([]);
    }

    const toggleComponent = (category, filter) => {
        const selected = selectedMainFilters.includes(filter);
        const excluded = !selected && selectedMainFilters.includes(`-${filter}`);

        let icon;
        switch (category) {
            case "tiers":
                icon = <div style={{ width: "32px" }}><TierComponent tier={filter} /></div>;
                break;
            case "keyword":
                icon = <Icon path={filter} style={{ height: "32px" }} />
                break;
            case "keyword2":
                if (filter === "Keywordless") icon = <span>Keywordless</span>
                else icon = <Icon path={filter} style={{ height: "32px" }} />
                break;
            case "affinity":
                icon = <Icon path={filter} style={{ height: "32px" }} />
                break;
            default:
                break;
        }

        return <div key={filter} style={{
            backgroundColor: selected ? "#3f3f3f" : (excluded ? "rgba(239,68,68, 0.8)" : "#1f1f1f"), height: "32px", display: "flex",
            alignItems: "center", justifyContent: "center", padding: "0.1rem 0.2rem", cursor: "pointer",
            borderBottom: selected ? "2px #4caf50 solid" : (excluded ? "2px #dc2626 solid" : "transparent"),
            transition: "all 0.2s"
        }}
            onClick={() => handleToggle(filter, selected, excluded)}
        >
            {icon}
        </div>
    }

    return <div style={{ display: "flex", flexDirection: "column", border: "1px #777 dotted", borderRadius: "1rem", minWidth: "200px", padding: "0.5rem" }}>
        {
            Object.entries(mainFilters).map(([category, list]) => {
                return <div key={category} style={{ display: "flex", justifyContent: "center", padding: "0.2rem", borderBottom: "1px #777 dotted" }}>
                    {list.map(filter => toggleComponent(category, filter))}
                </div>
            })
        }
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", paddingTop: "0.5rem", cursor: "pointer" }} onClick={clearAll}>
            Clear All
        </div>
    </div>
}

function TagFilterSelector({ tagFilter, setTagFilter }) {
    const options = [
        { value: "Enhanceable", label: <span style={{ color: "#4ade80" }}>Enhanceable</span> },
        { value: "Fusion Only", label: <span style={{ color: "#facc15" }}>Fusion Only</span> },
        { value: "Hard Only", label: <span style={{ color: "#f87171" }}>Hard Only</span> },
        { value: "Cursed", label: <span style={{ color: "#facc15" }}>Cursed</span> },
        { value: "Blessed", label: <span style={{ color: "#38bdf8" }}>Blessed</span> },
    ]

    return <Select
        isClearable={true}
        options={options}
        value={tagFilter ? options.find(x => x.value === tagFilter) : null}
        onChange={x => setTagFilter(x ? x.value : null)}
        styles={selectStyleVariable}
    />
}

function GiftsTab() {
    const [giftsData, giftsLoading] = useData("gifts");
    const [searchString, setSearchString] = useState("");
    const [selectedMainFilters, setSelectedMainFilters] = useState([]);
    const [includeDescription, setIncludeDescription] = useState(false);
    const [displayType, setDisplayType] = useState(null);
    const [tagFilter, setTagFilter] = useState(null);
    const [tagFilterExcluding, setTagFilterExcluding] = useState(false);
    const [showTagStrips, setShowTagStrips] = useState(false);
    const { isDesktop } = useBreakpoint();

    useEffect(() => {
        const savedIncludeDescription = localStorage.getItem("includeDescription");
        setIncludeDescription(savedIncludeDescription ? JSON.parse(savedIncludeDescription) : false);
        const savedDisplayType = localStorage.getItem("giftDisplayType");
        setDisplayType(savedDisplayType ?? "icon");
    }, []);

    const handleDescriptionToggle = (checked) => {
        localStorage.setItem("includeDescription", JSON.stringify(checked));
        setIncludeDescription(checked);
    }

    useEffect(() => {
        if (displayType) localStorage.setItem("giftDisplayType", displayType);
    }, [displayType]);

    const handleSearchChange = (e) => {
        setSearchString(e.target.value);
    }

    return <div style={{ display: "flex", flexDirection: "column", width: "100%", gap: "1rem", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "2rem", alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, auto)", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                <span style={{ fontWeight: "bold", textAlign: "end" }}>Search</span>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "start" }}>
                    <input value={searchString} onChange={handleSearchChange} />
                    <label>
                        <input type="checkbox" checked={includeDescription} onChange={e => handleDescriptionToggle(e.target.checked)} />
                        <span
                            data-tooltip-id="genericTooltip"
                            data-tooltip-content={"This will check the description for all enhancement levels of the gift."}
                            style={{ borderBottom: "1px #aaa dotted", cursor: "help" }}
                        >
                            Include Description
                        </span>
                    </label>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "end", textAlign: "end", gap: "0.2rem" }}>
                    <span style={{ fontWeight: "bold", textAlign: "end" }}>Tag Filter</span>
                    <div
                        className="toggle-text"
                        onClick={() => setTagFilterExcluding(p => !p)}
                        style={{ color: tagFilterExcluding ? "#f87171" : "#4ade80" }}
                    >
                        {tagFilterExcluding ? "Exclude" : "Include"}
                    </div>
                </div>
                <div style={{ textAlign: "start" }}>
                    <TagFilterSelector tagFilter={tagFilter} setTagFilter={setTagFilter} />
                </div>
                <span style={{ fontWeight: "bold", textAlign: "end" }}>Display Type</span>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem", alignItems: "start" }}>
                    <label>
                        <input type="radio" name="displayType" value={"icon"} checked={displayType === "icon"} onChange={e => setDisplayType(e.target.value)} />
                        Icons Only
                    </label>
                    <label>
                        <input type="radio" name="displayType" value={"card"} checked={displayType === "card"} onChange={e => setDisplayType(e.target.value)} />
                        Cards
                    </label>
                    <label>
                        <input type="radio" name="displayType" value={"desc"} checked={displayType === "desc"} onChange={e => setDisplayType(e.target.value)} />
                        Full Description
                    </label>
                </div>
                <div />
                <div style={{display: "flex"}}>
                    <label>
                        <input type="checkbox" checked={showTagStrips} onChange={e => setShowTagStrips(e.target.checked)} />
                        <span
                            data-tooltip-id="genericTooltip"
                            data-tooltip-content={"Display colored strips on gifts to quickly see their tags. (Experimental Feature)"}
                            style={{ borderBottom: "1px #aaa dotted", cursor: "help" }}
                        >
                            Show Tag Strips
                        </span>
                    </label>
                </div>
            </div>
            <MainFilterSelector selectedMainFilters={selectedMainFilters} setSelectedMainFilters={setSelectedMainFilters} />
        </div>
        <div style={{ border: "1px #777 solid", width: "100%" }} />
        {giftsLoading ?
            <div style={{ textAlign: "center", fontSize: "1.5rem" }}>Loading Gifts...</div> :
            <GiftList
                searchString={searchString}
                selectedMainFilters={selectedMainFilters}
                tagFilter={tagFilter}
                tagFilterExcluding={tagFilterExcluding}
                includeDescription={includeDescription}
                displayType={displayType}
                showTagStrips={showTagStrips}
                giftsData={giftsData}
                isSmall={!isDesktop}
            />
        }
    </div>;
}

export default GiftsTab;
