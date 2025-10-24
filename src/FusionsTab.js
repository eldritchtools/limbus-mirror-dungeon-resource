import { useMemo, useState } from "react";
import ThemePackNameWithTooltip from "./ThemePackNameWithTooltip";
import { KeywordIcon, KeywordSelector, FusionRecipe, useData } from "@eldritchtools/limbus-shared-library";

const keywords = ["Burn", "Bleed", "Tremor", "Rupture", "Sinking", "Poise", "Charge", "Slash", "Pierce", "Blunt", "Keywordless"];

function getFusionRecipes(gifts) {
    const list = [];
    Object.entries(gifts).forEach(([id, gift]) => {
        if (!gift.recipes) return;
        gift.recipes.forEach(recipe => {
            list.push({ id: id, ingredients: recipe })
        })
    });
    return list;
}

function organizeThemePacks(giftsData, themePacksData) {
    const fusionThemePacks = new Set();
    Object.entries(giftsData).forEach(([_, gift]) => {
        if (!gift.fusion || !("exclusiveTo" in gift)) return;
        gift.exclusiveTo.forEach(source => fusionThemePacks.add(source));
    })

    const typeMap = Object.entries(themePacksData).reduce((acc, [id, themePack]) => {
        if (!("exclusive_gifts" in themePack) || !fusionThemePacks.has(id))
            return acc;

        switch (id[0]) {
            case "C":
                acc["Canto"].push(id);
                break;
            case "I":
                acc["Intervallo"].push(id);
                break;
            case "R":
                acc["Railway"].push(id);
                break;
            case "W":
                acc["Walpurgisnacht"].push(id);
                break;
            default:
                break;
        }

        return acc;
    }, { "Canto": [], "Intervallo": [], "Railway": [], "Walpurgisnacht": [] });

    const result = Object.entries(typeMap).reduce((acc, [k, v]) => {
        if (v.length > 0) acc[k] = v;
        return acc;
    }, {})

    return result;
}

function includesIgnoreCase(s1, s2) {
    return s1.toLowerCase().includes(s2.toLowerCase());
}

function filterFusionRecipes(gifts, fusionsList, searchString, selectedKeywords, selectedThemePacks) {
    let list = fusionsList;
    if (searchString !== "")
        list = list.filter(recipe => includesIgnoreCase(gifts[recipe.id].names[0], searchString) || recipe.ingredients.some(ingredient => {
            if (ingredient instanceof Object)
                return ingredient.options.some(option => includesIgnoreCase(gifts[option].names[0], searchString))
            else
                return includesIgnoreCase(gifts[ingredient].names[0], searchString)
        }));
    if (selectedKeywords.length !== 0) {
        list = list.filter(recipe => selectedKeywords.includes(gifts[recipe.id].keyword));
    }
    if (selectedThemePacks.length !== 0)
        list = list.filter(recipe => gifts[recipe.id].exclusiveTo ? gifts[recipe.id].exclusiveTo.some(source => selectedThemePacks.includes(source)) : false);
    return list;
}

function FusionRow({ recipe, giftsData }) {
    const tdStyle = { borderTop: "1px grey dotted", borderBottom: "1px grey dotted", padding: "5px" };

    return <tr>
        <td style={tdStyle}><FusionRecipe recipe={recipe} /></td>
        <td style={tdStyle}>
            {giftsData[recipe.id].hardonly ? <span style={{ color: "#f87171" }}>Hard only</span> : <span style={{ color: "#4ade80" }}>Normal or Hard</span>}
        </td>
        <td style={tdStyle}>
            {giftsData[recipe.id].exclusiveTo ?
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <span>Requires:</span>
                    {giftsData[recipe.id].exclusiveTo.map(source => <ThemePackNameWithTooltip id={source} />)}
                </div> :
                <span>Always obtainable</span>}
        </td>
    </tr>
}

function FusionsDisplay({ searchString, selectedKeywords, selectedThemePacks, giftsData }) {
    const fusionRecipesList = useMemo(() => getFusionRecipes(giftsData), [giftsData]);

    if (searchString === "" && selectedKeywords.length === 0 && selectedThemePacks.length === 0) {
        const fusionsByKeyword = fusionRecipesList.reduce((acc, fusion) => {
            acc[giftsData[fusion.id].keyword].push(fusion);
            return acc;
        }, keywords.reduce((acc, keyword) => { acc[keyword] = []; return acc }, {}))

        const components = [];
        const tdstyle = { borderTop: "1px grey dotted", borderBottom: "1px grey dotted" }
        const style = { fontSize: "1.5em", fontWeight: "bold", display: "flex", flexDirection: "row", alignItems: "center" };
        keywords.forEach(keyword => {
            if (fusionsByKeyword[keyword].length === 0) return;
            if (keyword === "Keywordless")
                components.push(<tr><td style={tdstyle} colSpan={3}><div style={style}>Keywordless</div></td></tr>);
            else
                components.push(<tr><td style={tdstyle} colSpan={3}><div style={style}><KeywordIcon id={keyword} scale={1.5} />{keyword}</div></td></tr>);
            fusionsByKeyword[keyword].forEach(recipe => components.push(<FusionRow recipe={recipe} giftsData={giftsData} />));
        });

        return <table style={{ borderCollapse: "collapse", width: "100%" }}><tbody>{components}</tbody></table>
    } else {
        const filteredRecipesList = filterFusionRecipes(giftsData, fusionRecipesList, searchString, selectedKeywords, selectedThemePacks);
        return <table style={{ borderCollapse: "collapse", width: "100%" }}><tbody>{filteredRecipesList.map(recipe => <FusionRow recipe={recipe} giftsData={giftsData} />)}</tbody></table>
    }
}

function FusionsTab() {
    const [searchString, setSearchString] = useState("");
    const [selectedKeywords, setSelectedKeywords] = useState([]);
    const [selectedThemePacks, setSelectedThemePacks] = useState([]);

    const [giftsData, giftsLoading] = useData("gifts");
    const [themePacksData, themePacksLoading] = useData("md_theme_packs");

    const themePackList = useMemo(() => (giftsLoading || themePacksLoading) ? {} : organizeThemePacks(giftsData, themePacksData), [giftsData, giftsLoading, themePacksData, themePacksLoading]);

    const handleSearchChange = (e) => {
        setSearchString(e.target.value);
    }

    const handleSourceToggle = (themePack, selected) => {
        if (selected)
            setSelectedThemePacks(selectedThemePacks.filter(x => x !== themePack));
        else
            setSelectedThemePacks([...selectedThemePacks, themePack]);
    }

    const clearSources = () => {
        setSelectedThemePacks([]);
    }

    const fusionsComponent = useMemo(() =>
        <FusionsDisplay searchString={searchString} selectedKeywords={selectedKeywords} selectedThemePacks={selectedThemePacks} giftsData={giftsData} />,
        [searchString, selectedKeywords, selectedThemePacks, giftsData]
    );

    return <div style={{ display: "flex", flexDirection: "column", maxHeight: "100%", minWidth: "80%", gap: "1rem", justifyContent: "center" }}>
        <details open>
            <summary><span style={{ fontSize: "1.25rem", fontWeight: "bold" }}>Filters</span></summary>
            <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, auto)", gap: "0.5rem", alignItems: "center" }}>
                    <span style={{ fontWeight: "bold", textAlign: "end" }}>Search</span>
                    <div style={{ display: "flex", alignItems: "start" }}><input value={searchString} onChange={handleSearchChange} /></div>
                    <span style={{ fontWeight: "bold", textAlign: "end" }}>Filter Keywords</span>
                    <KeywordSelector value={selectedKeywords} onChange={v => setSelectedKeywords(v)} />
                </div>
                <div style={{ width: "80%" }}>
                    <div style={{ fontSize: "1.25rem", fontWeight: "bold" }}>Theme Packs <button onClick={clearSources}>Clear All</button></div>
                    <table style={{ borderCollapse: "collapse" }}>
                        <tbody>
                            {
                                Object.entries(themePackList).map(([category, themePacks]) => <tr>
                                    <td style={{ border: "1px grey dotted", padding: "2px" }}>{category}</td>
                                    <td style={{ border: "1px grey dotted", padding: "2px", textAlign: "start", gap: "2px" }}>
                                        <div style={{ display: "flex", width: "100%", flexWrap: "wrap" }}>
                                            {themePacks.map(themePack => {
                                                const selected = selectedThemePacks.includes(themePack);
                                                return <label style={{ paddingLeft: "2px", paddingRight: "2px", whiteSpace: "nowrap" }}>
                                                    {<input type="checkbox" onChange={() => handleSourceToggle(themePack, selected)} checked={selected} />}
                                                    {themePacksData[themePack].name}
                                                </label>
                                            })}
                                        </div>
                                    </td>
                                </tr>)
                            }
                        </tbody>
                    </table>

                </div>
            </div>
        </details>
        <div style={{ flex: 1, height: "50%", display: "flex", justifyContent: "center", width: "100%" }}>
            <div style={{ height: "100%", minWidth: "80%", maxWidth: "100%", overflowY: "auto" }}>
                {fusionsComponent}
            </div>
        </div>
    </div>;
}

export default FusionsTab;