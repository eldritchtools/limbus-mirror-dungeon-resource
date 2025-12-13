import { useEffect, useMemo, useState } from "react";
import ThemePackNameWithTooltip from "./ThemePackNameWithTooltip";
import { KeywordIcon, FusionRecipe, useData } from "@eldritchtools/limbus-shared-library";
import { KeywordSelector } from "./Selectors";

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

function checkSearchMatch(searchString, includeDescription, gift) {
    if (includesIgnoreCase(gift.names[0], searchString)) return true;
    if (includeDescription && includesIgnoreCase(gift.search_desc, searchString)) return true;
    return false;
}

function filterFusionRecipes(gifts, fusionsList, searchString, includeDescription, includeIngredients, selectedKeywords, selectedThemePacks) {
    let list = fusionsList;
    if (searchString !== "")
        list = list.filter(recipe =>
            checkSearchMatch(searchString, includeDescription, gifts[recipe.id]) ||
            (includeIngredients &&
                recipe.ingredients.some(ingredient => {
                    if (ingredient instanceof Object)
                        return ingredient.options.some(option => checkSearchMatch(searchString, includeDescription, gifts[option]))
                    else
                        return checkSearchMatch(searchString, includeDescription, gifts[ingredient])
                })));
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
                    {giftsData[recipe.id].exclusiveTo.map((source, i) => <ThemePackNameWithTooltip key={i} id={source} />)}
                </div> :
                <span>Always obtainable</span>}
        </td>
    </tr>
}

function FusionsDisplay({ searchString, includeDescription, includeIngredients, selectedKeywords, selectedThemePacks, giftsData }) {
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
                components.push(<tr key={keyword}><td style={tdstyle} colSpan={3}><div style={style}>Keywordless</div></td></tr>);
            else
                components.push(<tr key={keyword}><td style={tdstyle} colSpan={3}><div style={style}><KeywordIcon id={keyword} scale={1.5} />{keyword}</div></td></tr>);
            fusionsByKeyword[keyword].forEach(recipe => components.push(<FusionRow key={components.length} recipe={recipe} giftsData={giftsData} />));
        });

        return <table style={{ borderCollapse: "collapse", width: "100%" }}><tbody>{components}</tbody></table>
    } else {
        const filteredRecipesList = filterFusionRecipes(giftsData, fusionRecipesList, searchString, includeDescription, includeIngredients, selectedKeywords, selectedThemePacks);
        return <table style={{ borderCollapse: "collapse", width: "100%" }}><tbody>{filteredRecipesList.map((recipe, i) => <FusionRow key={i} recipe={recipe} giftsData={giftsData} />)}</tbody></table>
    }
}

function FusionsTab() {
    const [searchString, setSearchString] = useState("");
    const [selectedKeywords, setSelectedKeywords] = useState([]);
    const [selectedThemePacks, setSelectedThemePacks] = useState([]);

    const [giftsData, giftsLoading] = useData("gifts");
    const [themePacksData, themePacksLoading] = useData("md_theme_packs");

    const [includeDescription, setIncludeDescription] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem("includeDescription");
        setIncludeDescription(saved ? JSON.parse(saved) : false);
    }, []);

    const handleDescriptionToggle = (checked) => {
        localStorage.setItem("includeDescription", JSON.stringify(checked));
        setIncludeDescription(checked);
    }

    const [includeIngredients, setIncludeIngredients] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem("includeIngredients");
        setIncludeIngredients(saved ? JSON.parse(saved) : false);
    }, []);

    const handleIngredientsToggle = (checked) => {
        localStorage.setItem("includeIngredients", JSON.stringify(checked));
        setIncludeIngredients(checked);
    }

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
        !giftsLoading ?
            <FusionsDisplay
                searchString={searchString}
                includeDescription={includeDescription}
                includeIngredients={includeIngredients}
                selectedKeywords={selectedKeywords}
                selectedThemePacks={selectedThemePacks}
                giftsData={giftsData}
            /> : null,
        [searchString, includeDescription, includeIngredients, selectedKeywords, selectedThemePacks, giftsData, giftsLoading]
    );

    return <div style={{ display: "flex", flexDirection: "column", maxHeight: "100%", minWidth: "80%", gap: "1rem", justifyContent: "center" }}>
        <details open>
            <summary><span style={{ fontSize: "1.25rem", fontWeight: "bold" }}>Filters</span></summary>
            <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
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
                        <label>
                            <input type="checkbox" checked={includeIngredients} onChange={e => handleIngredientsToggle(e.target.checked)} />
                            <span
                                data-tooltip-id="genericTooltip"
                                data-tooltip-content={"This will check for the search text in the ingredients as well. Also affected by 'Include Description'."}
                                style={{ borderBottom: "1px #aaa dotted", cursor: "help" }}
                            >
                                Include Ingredients
                            </span>
                        </label>
                    </div>
                    <span style={{ fontWeight: "bold", textAlign: "end" }}>Filter Keywords</span>
                    <KeywordSelector selectedKeywords={selectedKeywords} setSelectedKeywords={setSelectedKeywords} />
                </div>
                <div style={{ width: "80%" }}>
                    <div style={{ fontSize: "1.25rem", fontWeight: "bold" }}>Theme Packs <button onClick={clearSources}>Clear All</button></div>
                    <table style={{ borderCollapse: "collapse" }}>
                        <tbody>
                            {
                                Object.entries(themePackList).map(([category, themePacks], i) => <tr key={i}>
                                    <td style={{ border: "1px grey dotted", padding: "2px" }}>{category}</td>
                                    <td style={{ border: "1px grey dotted", padding: "2px", textAlign: "start", gap: "2px" }}>
                                        <div style={{ display: "flex", width: "100%", flexWrap: "wrap" }}>
                                            {themePacks.map((themePack, i) => {
                                                const selected = selectedThemePacks.includes(themePack);
                                                return <label key={i} style={{ paddingLeft: "2px", paddingRight: "2px", whiteSpace: "nowrap" }}>
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