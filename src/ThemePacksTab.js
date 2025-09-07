import { useState } from "react";
import { GiftImg, ThemePackImg } from "./ImageHandler";
import data from "./data";

const formatUniqueGifts = (uniqueGifts) => {
    return <div style={{display: "flex", flexDirection: "row", flexWrap: "wrap"}}>
        {uniqueGifts.map(gift => <GiftImg gift={data.gifts[gift]} />)}
    </div>
}

function ThemePack({ themePack }) {
    return <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gridAutoRows: "auto", alignItems: "start", height: "auto", minWidth: "700px", padding: "3px", boxSizing: "border-box", border: "1px grey dotted" }}>
        <div style={{ height: "fit-content", boxSizing: "border-box" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", padding: "3px" }}>
                <ThemePackImg themePack={themePack} displayName={true} scale={0.5} />
            </div>
        </div>

        <div style={{ display: "grid", height: "100%", gridTemplateRows: "4fr 1fr", boxSizing: "border-box" }}>
            <div style={{ flex: "3", borderBottom: "1px grey dotted", alignItems: "start", padding: "5px" }}>
                {"unique_gifts" in themePack ? formatUniqueGifts(themePack["unique_gifts"]) : null}
            </div>
            <div style={{ flex: "1", display: "flex", flexDirection: "column", alignItems: "start", padding: "5px" }}>
                <div>Floors</div>
                <div>
                    <span style={{ color: "#4ade80" }}>Normal: </span>
                    <span>{"normalFloors" in themePack ? themePack.normalFloors.join(", ") : "None"}</span>
                </div>
                <div>
                    <span style={{ color: "#f87171" }}>Hard: </span>
                    <span>{"hardFloors" in themePack ? themePack.hardFloors.join(", ") : "None"}</span>
                </div>
            </div>
        </div>
    </div>
}

function ThemePacksTab() {
    const [selectedCategories, setSelectedCategories] = useState([]);
    const handleCategoryToggle = (category, selected) => {
        if (selected)
            setSelectedCategories(selectedCategories.filter(x => x !== category));
        else
            setSelectedCategories([...selectedCategories, category]);
    }

    const clearCategories = () => {
        setSelectedCategories([]);
    }

    const components = [];

    Object.entries(data.themePacks).forEach(([id, themePack]) => {
        if (selectedCategories.length !== 0 && !selectedCategories.some(selectedCategory => themePack.category.includes(selectedCategory))) return;

        components.push(<ThemePack themePack={themePack} />);
    })

    const categories = {};
    Object.values(data.themePacks).forEach(themePack => {
        if (!(themePack.category[0] in categories))
            categories[themePack.category[0]] = []
        if (themePack.category.length === 2 && !categories[themePack.category[0]].includes(themePack.category[1]))
            categories[themePack.category[0]].push(themePack.category[1])
    });

    return <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", alignItems: "center", gap: "1rem", justifyContent: "start" }}>
        <div style={{ width: "100%" }}>
            <details open>
                <summary><span style={{ fontSize: "1.25rem", fontWeight: "bold" }}>Filters</span></summary>
                <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                    <table style={{ borderCollapse: "collapse" }}>
                        <tbody>
                            {
                                Object.entries(categories).map(([category, innerCategories]) => {
                                    const selected = selectedCategories.includes(category);
                                    return <tr>
                                        <td style={{ border: "1px grey dotted", padding: "2px" }}>
                                            <label style={{ paddingLeft: "2px", paddingRight: "2px", whiteSpace: "nowrap" }}>
                                                {<input type="checkbox" onChange={() => handleCategoryToggle(category, selected)} checked={selected} />}
                                                {category}
                                            </label>
                                        </td>
                                        <td style={{ border: "1px grey dotted", padding: "2px", textAlign: "start", gap: "2px" }}>
                                            <div style={{ display: "flex", width: "100%", flexWrap: "wrap" }}>
                                                {innerCategories.map(innerCategory => {
                                                    const innerSelected = selectedCategories.includes(innerCategory);
                                                    return <label style={{ paddingLeft: "2px", paddingRight: "2px", whiteSpace: "nowrap" }}>
                                                        {<input type="checkbox" onChange={() => handleCategoryToggle(innerCategory, innerSelected)} checked={innerSelected} />}
                                                        {innerCategory}
                                                    </label>
                                                })}
                                            </div>
                                        </td>
                                    </tr>
                                })
                            }
                        </tbody>
                    </table>
                    <button onClick={clearCategories}>Clear Categories</button>
                </div>
            </details>
        </div>
        <div style={{ height: "100%", width: "100%", overflowX: "hidden", overflowY: "auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(700px, 1fr))", height: "auto", width: "100%", boxSizing: "border-box" }}>
                {components}
            </div>
        </div>
    </div>;
}

export default ThemePacksTab;