import { useMemo, useState } from "react";
import { Gift, gifts as giftsData, KeywordSelector, replaceStatusVariables, ThemePackImg } from "@eldritchtools/limbus-shared-library";
import FusionRecipe from "./FusionRecipe";

const searchTerms = ["power", "coin power", "offense level", "damage", "HP", "SP", "heal", "speed"];
const buttonStyle = { border: "1px #aaa solid", padding: "4px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transiton: "background-color 0.2s, border-color 0.2s" };
const iconTextStyle = { fontFamily: "'Archivo Narrow', sans-serif", fontWeight: "bold", fontSize: "20px", color: "#ffd84d" };

function GiftDisplay({ id }) {
    const [enhanceLevel, setEnhanceLevel] = useState(0);

    if (!id) {
        return <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
            Select a gift to view all details
        </div>
    }

    const gift = giftsData[id];
    let level = Math.min(enhanceLevel, gift.descs.length - 1);

    return <div style={{ display: "flex", flexDirection: "column", width: "80%", gap: "0.5rem" }}>
        <div style={{ fontSize: "1.25rem", fontWeight: "bold", textAlign: "start" }}>{gift.names[level]}</div>
        <div style={{ display: "flex", flexDirection: "row", gap: "1rem" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
                <Gift gift={gift} includeTooltip={false} />
                {gift.enhanceable ? <div style={{ display: "grid", gridTemplateColumns: `repeat(${gift.names.length}, 1fr)` }}>
                    {Array.from({ length: gift.names.length }, (_, index) => <div style={{ ...buttonStyle, backgroundColor: enhanceLevel === index ? "#3f3f3f" : "#1f1f1f" }} onClick={() => setEnhanceLevel(index)}>
                        {index === 0 ? "-" : <span style={iconTextStyle}>{"+".repeat(index)}</span>}
                    </div>)}
                </div> : null
                }
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ display: "inline-block", fontSize: "1rem", lineHeight: "1.5", textWrap: "wrap", whiteSpace: "pre-wrap", textAlign: "start" }}>
                    <span>{replaceStatusVariables(gift.descs[level], true)}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "row", gap: "1rem" }}>
                    {
                        gift.exclusiveTo ?
                            <div style={{ display: "flex", flexDirection: "column" }}>
                                <span style={{ fontSize: "1.25rem", fontWeight: "bold", textAlign: "start" }}>Exclusive Theme Packs</span>
                                <div style={{ display: "flex", flexDirection: "row", gap: "0.5rem" }}>
                                    {gift.exclusiveTo.map(packId => <ThemePackImg id={packId} displayName={true} scale={0.5} />)}
                                </div>
                            </div> : null
                    }
                    {
                        gift.recipes ?
                            <div style={{ display: "flex", flexDirection: "column" }}>
                                <span style={{ fontSize: "1.25rem", fontWeight: "bold", textAlign: "start" }}>Fusion Recipes</span>
                                {gift.recipes.map(recipe => <FusionRecipe recipe={{ ingredients: recipe }} includeProduct={false} />)}
                            </div> : null
                    }
                </div>
            </div>
        </div>
    </div>
}

function GiftDesc({ gift }) {
    return <div style={{ display: "flex", flexDirection: "column", padding: "0.5rem", width: "100%", height: "fit-content", border: "1px #aaa solid", borderRadius: "1rem", boxSizing: "border-box" }}>
        <div style={{ marginBottom: "0.5rem", fontSize: "1.25rem", fontWeight: "bold", textAlign: "start" }}>{gift.names[0]}</div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
                <Gift gift={gift} includeTooltip={false} />
            </div>
            <div style={{ display: "inline-block", fontSize: "1rem", lineHeight: "1.5", textWrap: "wrap", whiteSpace: "pre-wrap", textAlign: "start" }}>
                <span>{replaceStatusVariables(gift.descs[0], true)}</span>
            </div>
        </div>
    </div>
}

function GiftCard({ gift }) {
    return <div style={{ display: "flex", flexDirection: "column", padding: "0.5rem", width: "400px", height: "250px", border: "1px #aaa solid", borderRadius: "1rem" }}>
        <div style={{ marginBottom: "0.5rem", fontSize: "1.25rem", fontWeight: "bold", textAlign: "center" }}>{gift.names[0]}</div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
                <Gift gift={gift} includeTooltip={false} />
            </div>
            <div style={{ display: "inline-block", fontSize: "1rem", lineHeight: "1.5", inlineSize: "50ch", textWrap: "wrap", whiteSpace: "pre-wrap", textAlign: "start", height: "200px", overflowY: "auto" }}>
                <span>{replaceStatusVariables(gift.descs[0], true)}</span>
            </div>
        </div>
    </div>
}

function includesIgnoreCase(s1, s2) {
    return s1.toLowerCase().includes(s2.toLowerCase());
}

function checkSearchMatch(searchString, searchType, gift) {
    if (includesIgnoreCase(gift.names[0], searchString)) return true;
    if (searchType === "1" && includesIgnoreCase(gift.search_desc, searchString)) return true;
    return false;
}

function GiftList({ searchString, selectedKeywords, selectedTiers, searchType, displayType, setSelectedGiftId }) {
    const list = useMemo(() => Object.entries(giftsData).filter(([_id, gift]) => {
        if (searchString !== "" && !checkSearchMatch(searchString, searchType, gift)) return false;
        if (selectedKeywords.length !== 0 && !selectedKeywords.includes(gift.keyword)) return false;
        if (selectedTiers.length !== 0 && !selectedTiers.includes(gift.tier)) return false;
        return true;
    }), [searchString, selectedKeywords, selectedTiers, searchType]);

    const listComponents = list.map(([id, gift]) => {
        switch (displayType) {
            case "icon": return [id, <Gift gift={gift} includeTooltip={true} />];
            case "card": return [id, <GiftCard gift={gift} />];
            case "desc": return [id, <GiftDesc gift={gift} />];
            default: return [id, null];
        }
    }).map(([id, component]) => <div onClick={() => setSelectedGiftId(id)} style={{ cursor: "pointer" }}>{component}</div>);

    const columns = displayType === "icon" ? "repeat(auto-fill, minmax(100px, 1fr))" : displayType === "card" ? "repeat(auto-fill, minmax(400px, 1fr))" : "1fr"

    return <div style={{ display: "grid", gridTemplateColumns: columns, width: "100%", overflowY: "auto", rowGap: "0.5rem" }}>
        {listComponents}
    </div>
}

function tierToString(tier) {
    switch (tier) {
        case "1": return "I";
        case "2": return "II";
        case "3": return "III";
        case "4": return "IV";
        case "5": return "V";
        case "EX": return "EX";
        default: return "";
    }
}

function TierSelector({ value, onChange }) {
    const handleTierToggle = (tier, selected) => {
        if (selected)
            onChange(value.filter(x => x !== tier));
        else
            onChange([...value, tier]);
    }

    const clearTiers = () => {
        onChange([]);
    }

    const toggleComponent = (tier, selected) => {
        return <div style={{ ...buttonStyle, backgroundColor: selected ? "#3f3f3f" : "#1f1f1f", height: "32px", width: "32px" }} onClick={() => handleTierToggle(tier, selected)}>
            <span style={{ ...iconTextStyle, transform: "scaleY(1.4)" }}>{tierToString(tier)}</span>
        </div>
    }

    return <div style={{ display: "flex" }}>
        {["1", "2", "3", "4", "5", "EX"].map(tier => toggleComponent(tier, value.includes(tier)))}
        {<div style={buttonStyle} onClick={clearTiers}>Clear All</div>}
    </div>
}

function GiftsTab() {
    const [searchString, setSearchString] = useState("");
    const [selectedKeywords, setSelectedKeywords] = useState([]);
    const [selectedTiers, setSelectedTiers] = useState([]);
    const [searchType, setSearchType] = useState("0");
    const [selectedGiftId, setSelectedGiftId] = useState(null);
    const [displayType, setDisplayType] = useState("icon");

    const handleSearchChange = (e) => {
        setSearchString(e.target.value);
    }

    return <div style={{ display: "flex", flexDirection: "column", maxHeight: "100%", width: "100%", gap: "1rem", alignItems: "center" }}>
        <details open>
            <summary><span style={{ fontSize: "1.25rem", fontWeight: "bold" }}>Filters</span></summary>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, auto)", gap: "0.5rem", alignItems: "center" }}>
                <span style={{ fontWeight: "bold", textAlign: "end" }}>Search</span>
                <div style={{ display: "flex", flexDirection: "row", gap: "0.5rem", alignItems: "center" }}>
                    <input value={searchString} onChange={handleSearchChange} />
                    <label>
                        <input type="radio" name="searchType" value={"0"} checked={searchType === "0"} onChange={e => setSearchType(e.target.value)} />
                        Name Only
                    </label>
                    <label>
                        <input type="radio" name="searchType" value={"1"} checked={searchType === "1"} onChange={e => setSearchType(e.target.value)} />
                        <span
                            data-tooltip-id="genericTooltip"
                            data-tooltip-content={"This will check the description for all enhancement levels of the gift."}
                            style={{ borderBottom: "1px #aaa dotted", cursor: "help" }}
                        >
                            Name and Description
                        </span>
                    </label>
                </div>
                <span style={{ fontWeight: "bold", textAlign: "end" }}>Filter Keywords</span>
                <KeywordSelector value={selectedKeywords} onChange={v => setSelectedKeywords(v)} />
                <span style={{ fontWeight: "bold", textAlign: "end" }}>Filter Tiers</span>
                <TierSelector value={selectedTiers} onChange={v => setSelectedTiers(v)} />
                <span style={{ fontWeight: "bold", textAlign: "end" }}>Common Search Terms</span>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                    {searchTerms.map(term => <span style={{ borderBottom: "1px #888 solid", cursor: "pointer" }} onClick={() => setSearchString(term)}>{term}</span>)}
                </div>
                <span style={{ fontWeight: "bold", textAlign: "end" }}>Display Type</span>
                <div style={{ display: "flex", flexDirection: "row", gap: "0.5rem", alignItems: "center" }}>
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
            </div>
        </details>
        <GiftDisplay id={selectedGiftId} />
        <GiftList searchString={searchString} selectedKeywords={selectedKeywords} selectedTiers={selectedTiers} searchType={searchType} displayType={displayType} setSelectedGiftId={setSelectedGiftId} />
    </div>;
}

export default GiftsTab;