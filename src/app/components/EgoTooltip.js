"use client";

import { EgoImg, Icon, KeywordIcon, Status, useData } from "@eldritchtools/limbus-shared-library";
import { Tooltip } from "react-tooltip";
import { tooltipStyle } from "../styles";
import { AtkWeight } from "./AtkWeight";

function compileSkillData(skill, uptie) {
    return skill.data.reduce((acc, dataTier) => dataTier.uptie <= uptie ? { ...acc, ...dataTier } : acc, {});
}

function EgoTooltipContent({ id, ego, uptie = 4 }) {
    const [skillData, skillDataLoading] = useData(`egos/${id}`);
    const types = [];

    types.push(ego.awakeningType.affinity);
    if (ego.corrosionType && ego.awakeningType.affinity !== ego.corrosionType.affinity)
        types.push(ego.corrosionType.affinity);

    types.push(ego.awakeningType.type);
    if (ego.corrosionType && ego.awakeningType.type !== ego.corrosionType.type)
        types.push(ego.corrosionType.type);

    const awakeningData = !skillDataLoading ? skillData.awakeningSkills.map(skill => compileSkillData(skill, uptie)) : null;
    const corrosionData = (!skillDataLoading && skillData.corrosionSkills) ? skillData.corrosionSkills.map(skill => compileSkillData(skill, uptie)) : null;

    return <div style={{ ...tooltipStyle, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", flexDirection: "row", padding: "0.5rem", gap: "0.5rem", alignItems: "center" }}>
            <div><EgoImg ego={ego} type={"awaken"} displayName={true} displayRarity={true} style={{ width: "128px", height: "128px" }} /></div>
            <div style={{ display: "flex", flexDirection: "column", width: "192px", minHeight: "128px" }}>
                {skillDataLoading ? null :
                    <div style={{ display: "flex", gap: "0.2rem", alignItems: "center", paddingLeft: "0.2rem", paddingBottom: "0.2rem" }}>
                        Atk #:
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                {awakeningData.map((data, i) => <AtkWeight key={i} skillData={data} />)}
                            </div>
                            {corrosionData ?
                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                    {corrosionData.map((data, i) => <AtkWeight key={i} skillData={data} />)}
                                </div> :
                                null
                            }
                        </div>
                    </div>
                }
                <div style={{ flex: 1, display: "flex" }}>
                    {types.map(x => <KeywordIcon key={x} id={x} />)}
                </div>
                <div style={{ flex: 1, display: "flex", flexWrap: "wrap" }}>
                    {ego.statuses.sort().map(x => <Status key={x} id={x} includeTooltip={false} includeName={false} />)}
                </div>
                <div style={{ flex: 1, display: "flex", flexWrap: "wrap" }}>
                    {Object.entries(ego.cost).map(([affinity, cost]) => <div key={affinity} style={{ display: "flex", alignItems: "center" }}>
                        <Icon path={affinity} style={{ height: "32px", width: "32px" }} />
                        <span>x{cost}</span>
                    </div>)}
                </div>
            </div>
        </div>
    </div>
}

function TooltipLoader({ id, uptie }) {
    const [egos, egosLoading] = useData("egos");
    if (!id || egosLoading || !(id in egos)) return null;

    if (uptie) return <EgoTooltipContent id={id} ego={egos[id]} uptie={uptie} />
    return <EgoTooltipContent id={id} ego={egos[id]} />
}

function EgoTooltip() {
    return <Tooltip
        id="ego-tooltip"
        render={({ content }) => {
            if (!content) return null;
            const parts = content.split("|");
            if (parts.length > 1) return <TooltipLoader id={parts[0]} uptie={Number(parts[1])} />
            else return <TooltipLoader id={content} />
        }}
        getTooltipContainer={() => document.body}
        style={{ backgroundColor: "transparent", zIndex: "9999" }}
    />
}

export { EgoTooltip, EgoTooltipContent };