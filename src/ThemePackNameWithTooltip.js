import { Tooltip } from "react-tooltip";
import { getFloorsForPack, ThemePackImg, useData } from "@eldritchtools/limbus-shared-library";
import { tooltipStyle } from "./constants";

function ThemePackNameWithTooltip({ id, style = {} }) {
    const [themePacksData, themePacksLoading] = useData("md_theme_packs");
    if(themePacksLoading) return null;

    const defaultStyle = { borderBottom: "1px dotted #aaa", cursor: "help" };
    const themePack = themePacksData[id];

    return <span
        data-tooltip-id={"theme-pack-name-tooltip"}
        data-tooltip-content={id}
        style={{ ...defaultStyle, ...style }}
    >
        {themePack.name}
    </span>;
}

function TooltipContent({ themePackId }) {
    const [themePacksData, themePacksLoading] = useData("md_theme_packs");
    const {normal, hard} = getFloorsForPack(themePackId);

    if (!themePackId || themePacksLoading) return null;
    const themePack = themePacksData[themePackId];

    return <div style={tooltipStyle}>
        <div style={{ padding: "0.75rem" }}>
            <div style={{ fontSize: "1.5em", fontWeight: "bold" }}>{themePack.name}</div>
            <ThemePackImg themePack={themePack} scale={0.5} />
            <div style={{ display: "grid", width: "100%", gridTemplateColumns: "1fr 1fr" }} >
                <div style={{ color: "#4ade80" }}>Normal</div>
                <div style={{ color: "#f87171" }}>Hard</div>
                <div>{normal.length ? normal.map(f => `F${f}`).join(", ") : "None"}</div>
                <div>{hard.length ? hard.map(f => `F${f}`).join(", ") : "None"}</div>
            </div>
        </div>
    </div>
}

function ThemePackNameTooltip() {
    return <Tooltip
        id={"theme-pack-name-tooltip"}
        render={({ content }) => <TooltipContent themePackId={content} />}
        getTooltipContainer={() => document.body}
        style={{ backgroundColor: "transparent", zIndex: "9999" }}
    />
}

export default ThemePackNameWithTooltip;
export { ThemePackNameTooltip };