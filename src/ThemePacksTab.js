import { useState } from "react";
import { GiftImg, ThemePackImg } from "./ImageHandler";

function ThemePacksTab({ data }) {
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

    const formatUniqueGifts = (uniqueGifts) => {
        const rowLimit = 5;
        const rows = [];
        let index = 0;
        const rowStyle = { display: "flex", flexDirection: "row" };
        while (uniqueGifts.length - index >= rowLimit) {
            rows.push(<div style={rowStyle}>{uniqueGifts.slice(index, index + rowLimit).map(gift => <GiftImg gift={data.gifts[gift]} />)}</div>)
            index += rowLimit;
        }
        rows.push(<div style={rowStyle}>{uniqueGifts.slice(index).map(gift => <GiftImg gift={data.gifts[gift]} />)}</div>)
        return <div style={{ display: "flex", flexDirection: "column" }}>
            {rows}
        </div>
    }

    Object.entries(data["theme_packs"]).forEach(([id, themePack]) => {
        if (selectedCategories.length !== 0 && !selectedCategories.some(selectedCategory => themePack.category.includes(selectedCategory))) return;

        components.push(<div style={{ height: "fit-content", borderTop: "1px grey dotted", borderBottom: "1px grey dotted", boxSizing: "border-box" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", "padding": "3px" }}>
                <ThemePackImg themePack={themePack} scale={0.5} />
                {themePack.name}
            </div>
        </div>);

        components.push(<div style={{ display: "grid", height: "100%", gridTemplateRows: "3fr 1fr", borderTop: "1px grey dotted", borderBottom: "1px grey dotted", boxSizing: "border-box" }}>
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
        </div>)
    })

    const categories = {};
    Object.values(data["theme_packs"]).forEach(themePack => {
        if (!(themePack.category[0] in categories))
            categories[themePack.category[0]] = []
        if (themePack.category.length === 2 && !categories[themePack.category[0]].includes(themePack.category[1]))
            categories[themePack.category[0]].push(themePack.category[1])
    });

    return <div style={{ display: "flex", flexDirection: "row", height: "100%", alignItems: "start", gap: "5px", justifyContent: "center" }}>
        <div style={{ width: "30%" }}>
            <h2>Categories</h2>
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
                                    {innerCategories.map(innerCategory => {
                                        const innerSelected = selectedCategories.includes(innerCategory);
                                        return <label style={{ paddingLeft: "2px", paddingRight: "2px", whiteSpace: "nowrap" }}>
                                            {<input type="checkbox" onChange={() => handleCategoryToggle(innerCategory, innerSelected)} checked={innerSelected} />}
                                            {innerCategory}
                                        </label>
                                    })}
                                </td>
                            </tr>
                        })
                    }
                </tbody>
            </table>
            <button onClick={clearCategories}>Clear Categories</button>
        </div>
        <div style={{ height: "100%", overflowY: "auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gridAutoRows: "auto", alignItems: "start", height: "auto", maxHeight: "100%", width: "fit-content" }}>
                {components}
            </div>
        </div>
    </div>;
}

export default ThemePacksTab;