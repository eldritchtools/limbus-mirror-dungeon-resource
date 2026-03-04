import { KeywordIcon, keywords } from "@eldritchtools/limbus-shared-library";

function KeywordSelector({ selectedKeywords, setSelectedKeywords }) {
    const handleToggle = (keyword, selected) => {
        if (selected)
            setSelectedKeywords(p => p.filter(x => x !== keyword));
        else
            setSelectedKeywords(p => [...p, keyword]);
    }

    const clearAll = () => {
        setSelectedKeywords([]);
    }

    const toggleComponent = (keyword, selected, icon = true) => {
        return <div key={keyword} style={{
            backgroundColor: selected ? "#3f3f3f" : "#1f1f1f", height: "32px", display: "flex",
            alignItems: "center", justifyContent: "center", padding: "0.1rem 0.2rem", cursor: "pointer",
            borderBottom: selected ? "2px #4caf50 solid" : "transparent",
            transition: "all 0.2s"
        }}
            onClick={() => handleToggle(keyword, selected)}
        >
            {icon ? <KeywordIcon id={keyword} style={{ height: "32px" }} /> : keyword}
        </div>
    }

    return <div style={{ display: "flex", flexWrap: "wrap", border: "1px #777 dotted", borderRadius: "1rem", padding: "0.5rem", gap: "0.2rem" }}>
        {keywords.slice(0, -1).map(keyword => toggleComponent(keyword, selectedKeywords.includes(keyword)))}
        {toggleComponent(keywords[keywords.length - 1], selectedKeywords.includes(keywords[keywords.length - 1]), false)}
        {<div style={{ display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} onClick={clearAll}>Clear All</div>}
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

function GiftTierSelector({ selectedTiers, setSelectedTiers }) {
    const handleToggle = (tier, selected) => {
        if (selected)
            setSelectedTiers(p => p.filter(x => x !== tier));
        else
            setSelectedTiers(p => [...p, tier]);
    }

    const clearAll = () => {
        setSelectedTiers([]);
    }
    const toggleComponent = (tier, selected) => {
        return <div key={tier} style={{
            backgroundColor: selected ? "#3f3f3f" : "#1f1f1f", height: "32px", display: "flex",
            alignItems: "center", justifyContent: "center", padding: "0.1rem 0.2rem", cursor: "pointer",
            borderBottom: selected ? "2px #4caf50 solid" : "transparent",
            transition: "all 0.2s", width: "32px"
        }}
            onClick={() => handleToggle(tier, selected)}
        >
            <span style={{ fontFamily: "'Archivo Narrow', sans-serif", fontWeight: "bold", fontSize: "20px", color: "#ffd84d", transform: "scaleY(1.4)" }}>{tierToString(tier)}</span>
        </div>
    }

    return <div style={{ display: "flex", flexWrap: "wrap", border: "1px #777 dotted", borderRadius: "1rem", padding: "0.5rem", gap: "0.2rem" }}>
        {["1", "2", "3", "4", "5", "EX"].map(tier => toggleComponent(tier, selectedTiers.includes(tier)))}
        {<div style={{ display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} onClick={clearAll}>Clear All</div>}
    </div>
}

export { KeywordSelector, GiftTierSelector };