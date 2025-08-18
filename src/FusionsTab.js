import { useMemo, useState } from "react";
import { Icon } from "./ImageHandler";
import FusionRecipe from "./FusionRecipe";
import ThemePackNameWithTooltip from "./ThemePackNameWithTooltip";

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

function organizeThemePacks(data, themePacks) {
    const fusionThemePacks = new Set();
    Object.entries(data.gifts).forEach(([id, gift]) => {
        if (!gift.fusion || !("sources" in gift)) return;
        gift.sources.forEach(source => fusionThemePacks.add(source));
    })

    const typeMap = Object.entries(themePacks).reduce((acc, [id, themePack]) => {
        if (!("unique_gifts" in themePack) || !fusionThemePacks.has(id))
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
        list = list.filter(recipe => includesIgnoreCase(gifts[recipe.id].name, searchString) || recipe.ingredients.some(ingredient => {
            if (ingredient instanceof Object)
                return ingredient.options.some(option => includesIgnoreCase(gifts[option].name, searchString))
            else
                return includesIgnoreCase(gifts[ingredient].name, searchString)
        }));
    if (selectedKeywords.length !== 0) {
        list = list.filter(recipe => selectedKeywords.includes(gifts[recipe.id].keyword));
    }
    if (selectedThemePacks.length !== 0)
        list = list.filter(recipe => gifts[recipe.id].sources ? gifts[recipe.id].sources.some(source => selectedThemePacks.includes(source)) : false);
    return list;
}

function FusionRow({ data, recipe }) {
    const tdStyle = { borderTop: "1px grey dotted", borderBottom: "1px grey dotted", padding: "5px" };
    return <tr>
        <td style={tdStyle}><FusionRecipe data={data} recipe={recipe} /></td>
        <td style={tdStyle}>
            {data.gifts[recipe.id].hardonly ? <span style={{ color: "#f87171" }}>Hard only</span> : <span style={{ color: "#4ade80" }}>Normal or Hard</span>}
        </td>
        <td style={tdStyle}>
            {data.gifts[recipe.id].sources ?
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <span>Requires:</span>
                    {data.gifts[recipe.id].sources.map(source => <ThemePackNameWithTooltip data={data} id={source} />)}
                </div> :
                <span>Always obtainable</span>}
        </td>
    </tr>
}

function FusionsDisplay({ data, searchString, selectedKeywords, selectedThemePacks }) {
    const fusionRecipesList = useMemo(() => getFusionRecipes(data.gifts), [data]);

    if (searchString === "" && selectedKeywords.length === 0 && selectedThemePacks.length === 0) {
        const fusionsByKeyword = fusionRecipesList.reduce((acc, fusion) => {
            acc[data.gifts[fusion.id].keyword].push(fusion);
            return acc;
        }, keywords.reduce((acc, keyword) => { acc[keyword] = []; return acc }, {}))

        const components = [];
        const tdstyle = { borderTop: "1px grey dotted", borderBottom: "1px grey dotted" }
        const style = { fontSize: "1.5em", fontWeight: "bold", display: "flex", flexDirection: "row", alignItems: "center" };
        keywords.forEach(keyword => {
            if (fusionsByKeyword[keyword].length === 0) return;
            if (keyword === "Keywordless")
                components.push(<td style={tdstyle} colspan={3}><div style={style}>Keywordless</div></td>);
            else
                components.push(<td style={tdstyle} colspan={3}><div style={style}><Icon id={keyword} scale={1.5} />{keyword}</div></td>);
            fusionsByKeyword[keyword].forEach(recipe => components.push(<FusionRow data={data} recipe={recipe} />));
        });

        return <table style={{ borderCollapse: "collapse" }}><tbody>{components}</tbody></table>
    } else {
        const filteredRecipesList = filterFusionRecipes(data.gifts, fusionRecipesList, searchString, selectedKeywords, selectedThemePacks);
        return <table style={{ borderCollapse: "collapse" }}><tbody>{filteredRecipesList.map(recipe => <FusionRow data={data} recipe={recipe} />)}</tbody></table>
    }
}

function FusionsTab({ data }) {
    const [searchString, setSearchString] = useState("");
    const [selectedKeywords, setSelectedKeywords] = useState([]);
    const themePackList = useMemo(() => organizeThemePacks(data, data["theme_packs"]), [data]);
    const [selectedThemePacks, setSelectedThemePacks] = useState([]);

    const handleSearchChange = (e) => {
        setSearchString(e.target.value);
    }

    const handleKeywordToggle = (keyword, selected) => {
        if (selected)
            setSelectedKeywords(selectedKeywords.filter(x => x !== keyword));
        else
            setSelectedKeywords([...selectedKeywords, keyword]);
    }

    const clearKeywords = () => {
        setSelectedKeywords([]);
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

    const fusionsComponent = useMemo(() => <FusionsDisplay data={data} searchString={searchString} selectedKeywords={selectedKeywords} selectedThemePacks={selectedThemePacks} />, [data, searchString, selectedKeywords, selectedThemePacks]);

    return <div style={{ display: "flex", flexDirection: "row", maxHeight: "100%", gap: "5px", alignItems: "center" }}>
        <div style={{ width: "40%", display: "flex", flexDirection: "column", minHeight: "100%", justifyContent: "start" }}>
            <div>
                <h2>Search</h2>
                <input value={searchString} onChange={handleSearchChange} />
            </div>
            <div>
                <h2>Keyword</h2>
                <div style={{ display: "flex", flexDirection: "row", gap: "5px", justifyContent: "center" }}>
                    {keywords.map(keyword => {
                        const selected = selectedKeywords.includes(keyword);
                        return <label style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                            {<input type="checkbox" onChange={() => handleKeywordToggle(keyword, selected)} checked={selected} />}
                            {keyword === "Keywordless" ? "Keywordless" : <Icon id={keyword} />}
                        </label>
                    })}
                    <button onClick={clearKeywords}>Clear All</button>
                </div>
            </div>
            <div>
                <h2>Theme Packs</h2>
                <table style={{ borderCollapse: "collapse" }}>
                    <tbody>
                        {
                            Object.entries(themePackList).map(([category, themePacks]) => <tr>
                                <td style={{ border: "1px grey dotted", padding: "2px" }}>{category}</td>
                                <td style={{ border: "1px grey dotted", padding: "2px", textAlign: "start", gap: "2px" }}>
                                    {themePacks.map(themePack => {
                                        const selected = selectedThemePacks.includes(themePack);
                                        return <label style={{ paddingLeft: "2px", paddingRight: "2px", whiteSpace: "nowrap" }}>
                                        {<input type="checkbox" onChange={() => handleSourceToggle(themePack, selected)} checked={selected} />}
                                        {data["theme_packs"][themePack].name}
                                    </label>})}
                                </td>
                            </tr>)
                        }
                    </tbody>
                </table>
                <button onClick={clearSources}>Clear All</button>
            </div>
        </div>
        <div style={{ flex: "1", minHeight: "50%", maxHeight: "100%", overflowY: "auto", display: "flex", justifyContent: "end" }}>
            {fusionsComponent}
        </div>
    </div>;
}

export default FusionsTab;