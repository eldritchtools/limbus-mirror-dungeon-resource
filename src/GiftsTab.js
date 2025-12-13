import { useEffect, useMemo, useState } from "react";
import { Gift, replaceStatusVariables, useData } from "@eldritchtools/limbus-shared-library";
import { KeywordSelector, GiftTierSelector } from "./Selectors";

const searchTerms = ["power", "coin power", "offense level", "damage", "HP", "SP", "heal", "speed"];

function GiftDesc({ gift }) {
    const [expand, setExpand] = useState(false);

    return <div style={{ display: "flex", flexDirection: "column", padding: "0.5rem", width: "100%", height: "fit-content", border: "1px #aaa solid", borderRadius: "1rem", boxSizing: "border-box", cursor: "pointer" }} onClick={() => setExpand(!expand)}>
        <div style={{ marginBottom: "0.5rem", fontSize: "1.25rem", fontWeight: "bold", textAlign: "start" }}>{gift.names[0]}</div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
                <Gift gift={gift} includeTooltip={false} expandOverride={expand} setExpandOverride={() => setExpand(false)} />
            </div>
            <div style={{ display: "inline-block", fontSize: "1rem", lineHeight: "1.5", textWrap: "wrap", whiteSpace: "pre-wrap", textAlign: "start" }}>
                <span>{replaceStatusVariables(gift.descs[0], true)}</span>
            </div>
        </div>
    </div>
}

function GiftCard({ gift }) {
    const [expand, setExpand] = useState(false);

    return <div style={{ display: "flex", flexDirection: "column", padding: "0.5rem", width: "400px", height: "250px", border: "1px #aaa solid", borderRadius: "1rem", cursor: "pointer" }} onClick={() => setExpand(!expand)}>
        <div style={{ marginBottom: "0.5rem", fontSize: "1.25rem", fontWeight: "bold", textAlign: "center" }}>{gift.names[0]}</div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
                <Gift gift={gift} includeTooltip={false} expandOverride={expand} setExpandOverride={() => setExpand(false)} />
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

function checkSearchMatch(searchString, includeDescription, gift) {
    if (includesIgnoreCase(gift.names[0], searchString)) return true;
    if (includeDescription && includesIgnoreCase(gift.search_desc, searchString)) return true;
    return false;
}

function GiftList({ searchString, selectedKeywords, selectedTiers, includeDescription, displayType, giftsData }) {
    const list = useMemo(() => Object.entries(giftsData).filter(([_id, gift]) => {
        if (searchString !== "" && !checkSearchMatch(searchString, includeDescription, gift)) return false;
        if (selectedKeywords.length !== 0 && !selectedKeywords.includes(gift.keyword)) return false;
        if (selectedTiers.length !== 0 && !selectedTiers.includes(gift.tier)) return false;
        return true;
    }), [searchString, selectedKeywords, selectedTiers, includeDescription, giftsData]);

    const listComponents = list.map(([_, gift]) => {
        switch (displayType) {
            case "icon": return <Gift gift={gift} includeTooltip={true} />;
            case "card": return <GiftCard gift={gift} />;
            case "desc": return <GiftDesc gift={gift} />;
            default: return null;
        }
    });

    const columns = displayType === "icon" ? "repeat(auto-fill, minmax(100px, 1fr))" : displayType === "card" ? "repeat(auto-fill, minmax(400px, 1fr))" : "1fr"

    return <div style={{ display: "grid", gridTemplateColumns: columns, width: "100%", overflowY: "auto", rowGap: "0.5rem" }}>
        {listComponents}
    </div>
}

function GiftsTab() {
    const [searchString, setSearchString] = useState("");
    const [selectedKeywords, setSelectedKeywords] = useState([]);
    const [selectedTiers, setSelectedTiers] = useState([]);
    const [includeDescription, setIncludeDescription] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem("includeDescription");
        setIncludeDescription(saved ? JSON.parse(saved) : false);
    }, []);

    const handleDescriptionToggle = (checked) => {
        localStorage.setItem("includeDescription", JSON.stringify(checked));
        setIncludeDescription(checked);
    }

    const [displayType, setDisplayType] = useState("icon");

    const [giftsData, giftsLoading] = useData("gifts");

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
                <span style={{ fontWeight: "bold", textAlign: "end" }}>Filter Keywords</span>
                <div style={{ display: "flex" }}><KeywordSelector selectedKeywords={selectedKeywords} setSelectedKeywords={setSelectedKeywords} /></div>
                <span style={{ fontWeight: "bold", textAlign: "end" }}>Filter Tiers</span>
                <div style={{ display: "flex" }}><GiftTierSelector selectedTiers={selectedTiers} setSelectedTiers={setSelectedTiers} /></div>
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
        {giftsLoading ?
            <div style={{ textAlign: "center", fontSize: "1.5rem" }}>Loading Gifts...</div> :
            <GiftList searchString={searchString} selectedKeywords={selectedKeywords} selectedTiers={selectedTiers} includeDescription={includeDescription} displayType={displayType} giftsData={giftsData} />
        }
    </div>;
}

export default GiftsTab;