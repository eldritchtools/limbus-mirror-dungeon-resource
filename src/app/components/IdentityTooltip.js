"use client";

import { IdentityImg, KeywordIcon, useData } from "@eldritchtools/limbus-shared-library";
import { Tooltip } from "react-tooltip";
import { tooltipStyle } from "../styles";

function IdentityTooltipContent({ identity }) {
    return <div style={{...tooltipStyle, display: "flex", flexDirection: "column"}}>
        <div style={{ display: "flex", flexDirection: "row", padding: "0.5rem", gap: "0.5rem", height: "128px" }}>
            <div>
                <IdentityImg identity={identity} uptie={4} displayName={true} displayRarity={true} style={{width: "128px", height: "128px"}} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", width: "192px" }}>
                <div style={{ flex: 1, display: "flex" }}>
                    {(identity.skillKeywordList || []).map(x => <KeywordIcon key={x} id={x} />)}
                </div>
                <div style={{ flex: 1, display: "flex" }}>
                    {identity.affinities.map(x => <KeywordIcon key={x} id={x} />)}
                </div>
                <div style={{ flex: 1, display: "flex" }}>
                    {identity.types.map(x => <KeywordIcon key={x} id={x} />)}
                </div>
            </div>
        </div>
    </div>
}

function TooltipLoader({ id }) {
    const [identities, identitiesLoading] = useData("identities_mini");
    if (!id || identitiesLoading || !(id in identities)) return null;

    return <IdentityTooltipContent identity={identities[id]} />
}

function IdentityTooltip() {
    return <Tooltip
        id="identity-tooltip"
        render={({ content }) => <TooltipLoader id={content} />}
        getTooltipContainer={() => document.body}
        style={{ backgroundColor: "transparent", zIndex: "9999" }}
    />
}

export { IdentityTooltip, IdentityTooltipContent };