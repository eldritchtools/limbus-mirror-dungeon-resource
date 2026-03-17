import { useState, useMemo } from "react";
import Select from "react-select";
import { selectStyleVariable } from "../styles";
import { Gift, giftTagColors, Icon, TierComponent, useData } from "@eldritchtools/limbus-shared-library";
import { Modal } from "../components/Modal";
import { useBreakpoint } from "@eldritchtools/shared-components";

function includesIgnoreCase(s1, s2) {
    return s1.toLowerCase().includes(s2.toLowerCase());
}

function checkSearchMatch(searchString, gift) {
    if (includesIgnoreCase(gift.names[0], searchString)) return true;
    if (includesIgnoreCase(gift.search_desc, searchString)) return true;
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

function GiftList({ searchString, selectedMainFilters, tagFilter, tagFilterExcluding, giftsData, onSelectGift, forcedFilter, isMobile }) {
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
        if (searchString !== "" && !checkSearchMatch(searchString, gift)) return false;
        if (forcedFilter && !forcedFilter(gift)) return false;

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
                } else if (tagFilter === "Ingredient") {
                    if (gift.ingredientOf) return false;
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
                } else if (tagFilter === "Ingredient") {
                    if (!gift.ingredientOf) return false;
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
    }), [searchString, filters, filtersExclude, tagFilter, tagFilterExcluding, giftsData, forcedFilter]);

    return <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? 60 : 80}px, 1fr))`, width: "100%", rowGap: "0.5rem" }}>
        {list.map(([id, gift]) =>
            <div key={id} onClick={() => onSelectGift(id)}>
                <Gift gift={gift} includeTooltip={true} expandable={false} scale={isMobile ? .6 : .8} />
            </div>
        )}
    </div>
}

function MainFilterSelector({ selectedMainFilters, setSelectedMainFilters }) {
    const clearAll = () => {
        setSelectedMainFilters([]);
    }

    const toggleComponents = useMemo(() => {
        const handleToggle = (filter, selected, excluded) => {
            if (selected)
                setSelectedMainFilters(p => p.map(x => x === filter ? `-${x}` : x));
            else if (excluded)
                setSelectedMainFilters(p => p.filter(x => `-${filter}` !== x));
            else
                setSelectedMainFilters(p => [...p, filter]);
        }

        const toggleComponent = (category, filter) => {
            const selected = selectedMainFilters.includes(filter);
            const excluded = !selected && selectedMainFilters.includes(`-${filter}`);

            let icon;
            switch (category) {
                case "tiers":
                    icon = <div style={{ width: "32px", textAlign: "center" }}><TierComponent tier={filter} /></div>;
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
                backgroundColor: selected ? "#3f3f3f" : (excluded ? "rgba(239,68,68, 0.8)" : "transparent"), height: "32px", display: "flex",
                alignItems: "center", justifyContent: "center", padding: "0.1rem 0.2rem", cursor: "pointer",
                borderBottom: selected ? "2px #4caf50 solid" : (excluded ? "2px #dc2626 solid" : "transparent"),
                transition: "all 0.2s"
            }}
                onClick={() => handleToggle(filter, selected, excluded)}
            >
                {icon}
            </div>
        }

        const result = [];
        Object.entries(mainFilters).forEach(([category, list]) =>
            list.forEach(filter => result.push(toggleComponent(category, filter)))
        );
        return result;
    }, [selectedMainFilters, setSelectedMainFilters]);

    return <div style={{ display: "flex", flexWrap: "wrap", border: "1px #777 dotted", borderRadius: "1rem", padding: "0.5rem" }}>
        {toggleComponents}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", paddingTop: "0.5rem", cursor: "pointer" }} onClick={clearAll}>
            Clear All
        </div>
    </div>
}

function TagFilterSelector({ tagFilter, setTagFilter }) {
    const options = [
        { value: "Enhanceable", label: <span style={{ color: giftTagColors.enhanceable }}>Enhanceable</span> },
        { value: "Ingredient", label: <span style={{ color: giftTagColors.ingredient }}>Ingredient</span> },
        { value: "Fusion Only", label: <span style={{ color: giftTagColors.fusion }}>Fusion Only</span> },
        { value: "Hard Only", label: <span style={{ color: giftTagColors.hardonly }}>Hard Only</span> },
        { value: "Cursed", label: <span style={{ color: giftTagColors.cursed }}>Cursed</span> },
        { value: "Blessed", label: <span style={{ color: giftTagColors.blessed }}>Blessed</span> },
    ]

    return <Select
        isClearable={true}
        options={options}
        value={tagFilter ? options.find(x => x.value === tagFilter) : null}
        onChange={x => setTagFilter(x ? x.value : null)}
        styles={selectStyleVariable}
    />
}


export default function SelectGiftModal({ isOpen, onClose, title, choiceList, showSearch = false, onSelectGift, forcedFilter }) {
    const [giftsData, giftsLoading] = useData("gifts");
    const [searchString, setSearchString] = useState("");
    const [selectedMainFilters, setSelectedMainFilters] = useState([]);
    const [tagFilter, setTagFilter] = useState(null);
    const [tagFilterExcluding, setTagFilterExcluding] = useState(false);
    const { isMobile } = useBreakpoint();

    const handleSearchChange = (e) => {
        setSearchString(e.target.value);
    }

    return <Modal isOpen={isOpen} onClose={onClose}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", padding: "1rem", maxHeight: "min(800px, 90vh)", overflowY: "auto", overflowX: "hidden", width: "980px", maxWidth: "80vw" }}>
            {title ? <h2>{title}</h2> : null}
            {choiceList && choiceList.length > 0 ?
                <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? 60 : 80}px, 1fr))`, width: "100%", rowGap: "0.5rem" }}>
                    {choiceList
                        .filter(id => {
                            if (forcedFilter) return forcedFilter(giftsData[id]);
                            return true;
                        })
                        .map(id =>
                            <div key={id} onClick={() => onSelectGift(id)}>
                                <Gift id={id} includeTooltip={true} expandable={false} scale={isMobile ? .6 : .8} />
                            </div>
                        )}
                </div> :
                null
            }
            {choiceList && choiceList.length > 0 && showSearch ?
                <div style={{ width: "100%", border: "1px #aaa solid" }} /> :
                null
            }
            {showSearch ?
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <div style={{ display: "flex", gap: "2rem", alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, auto)", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                            <span style={{ fontWeight: "bold", textAlign: "end" }}>Search</span>
                            <input value={searchString} onChange={handleSearchChange} placeholder="Search gifts..." />
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "end", textAlign: "end", gap: "0.15rem" }}>
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
                            giftsData={giftsData}
                            onSelectGift={onSelectGift}
                            forcedFilter={forcedFilter}
                            isMobile={isMobile}
                        />
                    }
                </div> :
                null
            }
        </div>
    </Modal>
}