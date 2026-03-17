import { EgoImg, IdentityImg, RarityImg, SinnerIcon, useData } from "@eldritchtools/limbus-shared-library";
import "./SinnerGrid.css";
import { useMemo } from "react";

function IdentityProfile({ identity, sinnerId, uptie, level }) {
    if (!identity) return <div style={{ width: "100%", aspectRatio: "1/1", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <SinnerIcon num={sinnerId} style={{ width: "75%" }} />
    </div>

    const otherProps = {};
    if (uptie) otherProps.displayUptie = true;
    if (level) otherProps.level = level;

    return identity ?
        <div data-tooltip-id={"identity-tooltip"} data-tooltip-content={identity.id} style={{ position: "relative", width: "100%" }}>
            <IdentityImg identity={identity} uptie={(!uptie || uptie === "") ? 4 : uptie} displayName={true} displayRarity={true} {...otherProps} />
        </div> :
        <div style={{ width: "100%", aspectRatio: "1/1", boxSizing: "border-box" }} />
}

const egoRankReverseMapping = {
    0: "zayin",
    1: "teth",
    2: "he",
    3: "waw",
    4: "aleph"
}

function EgoProfile({ ego, rank, threadspin }) {
    if (!ego) return <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: "100%", aspectRatio: "4/1" }}>
        <RarityImg rarity={egoRankReverseMapping[rank]} alt={true} style={{ width: "18%", height: "auto" }} />
    </div>

    const otherProps = {}
    let tooltipId = ego.id;
    if (threadspin) {
        otherProps.threadspin = threadspin;
        tooltipId = `${tooltipId}|${threadspin}`;
    }

    return ego ?
        <div data-tooltip-id={"ego-tooltip"} data-tooltip-content={tooltipId}
            style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: "100%", aspectRatio: "4/1" }}>
            <EgoImg ego={ego} banner={true} type={"awaken"} displayName={true} displayRarity={false} {...otherProps} />
        </div> :
        <div style={{ width: "100%", aspectRatio: "4/1", boxSizing: "border-box" }} />
}

const deploymentComponentStyle = {
    flex: 1,
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    containerType: "size"
}

function DeploymentComponent({ order, activeSinners, sinnerId }) {
    const index = order.findIndex(x => x === sinnerId);
    if (index === -1) {
        return <div style={deploymentComponentStyle} />
    } else if (index < activeSinners) {
        return <div style={deploymentComponentStyle}>
            <span style={{ fontSize: `clamp(0.6rem, 20cqw, 1.5rem)`, color: "#fefe3d" }}>Active {index + 1}</span>
        </div>
    } else {
        return <div style={deploymentComponentStyle}>
            <span style={{ fontSize: `clamp(0.6rem, 20cqw, 1.5rem)`, color: "#29fee9" }}>Backup {index + 1}</span>
        </div>
    }
}

export default function SinnerGrid({ identityIds, egoIds, identityUpties, identityLevels, egoThreadspins, deploymentOrder, activeSinners }) {
    const [identities, identitiesLoading] = useData("identities");
    const [egos, egosLoading] = useData("egos");

    // Convert empty strings (from editing) to nulls
    const upties = useMemo(() => identityUpties ? identityUpties.map(x => x === "" ? null : x) : null, [identityUpties]);
    const levels = useMemo(() => identityLevels ? identityLevels.map(x => x === "" ? null : x) : null, [identityLevels]);
    const threadspins = useMemo(() => egoThreadspins ? egoThreadspins.map(x => x.map(y => y === "" ? null : y)) : null, [egoThreadspins]);

    if (identitiesLoading || egosLoading) return null;

    return <div style={{ display: "flex", flexDirection: "column", width: "100%", alignItems: "center" }}>
        <div className="sinner-grid" style={{ alignSelf: "center", transform: "translateZ(0)" }}>
            {Array.from({ length: 12 }, (_, index) =>
                <div key={index} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", width: "100%", border: "1px #444 solid" }}>
                    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%" }}>
                        <IdentityProfile
                            identity={identities[identityIds[index]] || null}
                            sinnerId={index + 1}
                            uptie={upties ? upties[index] : null}
                            level={levels ? levels[index] : null}
                        />
                        <DeploymentComponent order={deploymentOrder} activeSinners={activeSinners} sinnerId={index + 1} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%" }}>
                        {Array.from({ length: 5 }, (_, rank) =>
                            <EgoProfile
                                key={rank}
                                ego={egos[egoIds[index][rank]] || null}
                                rank={rank}
                                threadspin={threadspins ? threadspins[index][rank] : null}
                            />)}
                    </div>
                </div>
            )}
        </div>
    </div>
}
