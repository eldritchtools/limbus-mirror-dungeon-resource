import { Tooltip } from "react-tooltip";
import { ThemePackImg } from "./ImageHandler";

function ThemePackNameWithTooltip({ data, id }) {
    const style = { borderBottom: "1px dotted #aaa", cursor: "help" };
    const themePack = data["theme_packs"][id];

    return <>
        <span data-tooltip-id={id} style={style}>{themePack.name}</span>
        <Tooltip id={id} style={{ outlineStyle: "solid", outlineColor: "#ffffff", outlineWidth: "1px", backgroundColor: "#000000" }}>
            <div>
                <div style={{ fontSize: "1.5em", fontWeight: "bold" }}>{themePack.name}</div>
                <ThemePackImg themePack={themePack} scale={0.5} />
                <div style={{ display: "grid", width: "100%", gridTemplateColumns: "1fr 1fr" }} >
                    <div style={{ color: "#4ade80" }}>Normal</div>
                    <div style={{ color: "#f87171" }}>Hard</div>
                    <div>{themePack.normalFloors ? themePack.normalFloors.map(f => `F${f}`).join(", ") : "None"}</div>
                    <div>{themePack.hardFloors ? themePack.hardFloors.map(f => `F${f}`).join(", ") : "None"}</div>
                </div>
            </div>
        </Tooltip>
    </>;
}

export default ThemePackNameWithTooltip;