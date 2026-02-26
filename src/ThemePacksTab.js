import { useState } from "react";
import { useFloorsPerPack, Gift, ThemePackImg, useData } from "@eldritchtools/limbus-shared-library";
import { useBreakpoint } from "@eldritchtools/shared-components";

const formatExclusiveGifts = (exclusiveGifts, isSmall) => {
    return <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
        {exclusiveGifts.map((gift, i) => <Gift key={i} id={gift} scale={isSmall ? .5 : 1} />)}
    </div>
}

function ThemePack({ themePack, normal, hard, isSmall }) {
    return <div style={{
        display: "grid", gridTemplateColumns: `${isSmall ? 120 : 200}px 1fr`, gridAutoRows: "auto",
        alignItems: "start", height: "auto", minWidth: isSmall ? "320px" : "640px", padding: "3px",
        boxSizing: "border-box", border: "1px grey dotted"
    }}>
        <div style={{ height: "fit-content", boxSizing: "border-box" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", padding: "3px" }}>
                <ThemePackImg themePack={themePack} displayName={true} scale={isSmall ? .3 : .5} />
            </div>
        </div>

        <div style={{ display: "grid", height: "100%", gridTemplateRows: "4fr 1fr", boxSizing: "border-box" }}>
            <div style={{ flex: "3", borderBottom: "1px grey dotted", alignItems: "start", padding: "5px" }}>
                {"exclusive_gifts" in themePack ? formatExclusiveGifts(themePack["exclusive_gifts"], isSmall) : null}
            </div>
            <div style={{ flex: "1", display: "flex", flexDirection: "column", alignItems: "start", padding: "5px" }}>
                <div>Floors</div>
                <div>
                    <span style={{ color: "#4ade80" }}>Normal: </span>
                    <span>{normal ? normal.join(", ") : "None"}</span>
                </div>
                <div>
                    <span style={{ color: "#f87171" }}>Hard: </span>
                    <span>{hard ? hard.join(", ") : "None"}</span>
                </div>
            </div>
        </div>
    </div>
}

function ThemePacksTab() {
    const [themePacksData, themePacksLoading] = useData("md_theme_packs");
    const { isDesktop } = useBreakpoint();

    const floorsPerPack = useFloorsPerPack();

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

    Object.entries(themePacksLoading ? {} : themePacksData).forEach(([id, themePack]) => {
        if (selectedCategories.length !== 0 && !selectedCategories.some(selectedCategory => themePack.category.includes(selectedCategory))) return;

        components.push(<ThemePack key={id} themePack={themePack} normal={floorsPerPack.normal[id]} hard={floorsPerPack.hard[id]} isSmall={!isDesktop} />);
    })

    const categories = {};
    Object.values(themePacksLoading ? {} : themePacksData).forEach(themePack => {
        if (!(themePack.category[0] in categories))
            categories[themePack.category[0]] = []
        if (themePack.category.length === 2 && !categories[themePack.category[0]].includes(themePack.category[1]))
            categories[themePack.category[0]].push(themePack.category[1])
    });

    return <div style={{ display: "flex", flexDirection: "column", width: "100%", alignItems: "center", gap: "1rem", justifyContent: "start" }}>
        <div style={{ width: "100%" }}>
            <details open>
                <summary><span style={{ fontSize: "1.25rem", fontWeight: "bold" }}>Filters</span></summary>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <table style={{ borderCollapse: "collapse" }}>
                        <tbody>
                            {
                                Object.entries(categories).map(([category, innerCategories], i) => {
                                    const selected = selectedCategories.includes(category);
                                    return <tr key={i}>
                                        <td style={{ border: "1px grey dotted", padding: "2px" }}>
                                            <label style={{ paddingLeft: "2px", paddingRight: "2px", whiteSpace: "nowrap" }}>
                                                {<input type="checkbox" onChange={() => handleCategoryToggle(category, selected)} checked={selected} />}
                                                {category}
                                            </label>
                                        </td>
                                        <td style={{ border: "1px grey dotted", padding: "2px", textAlign: "start", gap: "2px" }}>
                                            <div style={{ display: "flex", width: "100%", flexWrap: "wrap" }}>
                                                {innerCategories.map((innerCategory, i) => {
                                                    const innerSelected = selectedCategories.includes(innerCategory);
                                                    return <label key={i} style={{ paddingLeft: "2px", paddingRight: "2px", whiteSpace: "nowrap" }}>
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
        <div style={{ width: "100%" }}>
            <div style={{
                display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${isDesktop ? 640 : 320}px, 1fr))`,
                width: "100%", boxSizing: "border-box"
            }}>
                {components}
            </div>
        </div>
    </div>;
}

export default ThemePacksTab;