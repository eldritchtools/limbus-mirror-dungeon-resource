"use client";

import { KeywordIcon } from "@eldritchtools/limbus-shared-library";
import { keywordIdMapping } from "../keywordIds";
import Username from "./Username";
import IdentityImgSpread from "./IdentityImgSpread";
import ReactTimeAgo from "react-time-ago";
import "./BuildEntry.css";
import { decodeBuildExtraOpts } from "../md-plans/BuildExtraOpts";

export default function BuildEntry({ build, clickable=true }) {
    const extraProps = {};
    if (build.extra_opts) {
        const extraOpts = decodeBuildExtraOpts(build.extra_opts, ["iu"])
        if (extraOpts.identityUpties) extraProps.identityUpties = extraOpts.identityUpties;
    }

    const sizes = { width: "300px", iconSize: 24, buttonIconSize: 16, scale: 0.175, maxRailIcons: 5 };

    if (!sizes) return null;
    const hiddenIcons = build.keyword_ids.length - sizes.maxRailIcons;

    return <div className="build-entry" style={{ width: sizes.width }}>
        {build.keyword_ids.length > 0 ?
            <div className="build-icon-rails">
                {build.keyword_ids.slice(0, sizes.maxRailIcons).map(id => <KeywordIcon key={id} id={keywordIdMapping[id]} size={sizes.iconSize} />)}
                {hiddenIcons > 0 ? <span style={{
                    width: sizes.iconSize, height: sizes.iconSize, display: "flex",
                    alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "#7c6a55"
                }}>+{hiddenIcons}</span> : null}
            </div> :
            null
        }

        <div className="build-contents" style={{ marginTop: build.keyword_ids.length === 0 ? 0 : "0px" }}>
            <div style={{ display: "flex", height: "2.4rem", alignItems: "center", marginBottom: "0.2rem" }}>
                <h2 className="build-title" style={{ fontSize: "1.2rem", fontWeight: "bold", marginTop: "0", marginBottom: "0" }}>
                    {build.title}
                </h2>
            </div>
            <div style={{ fontSize: "0.8rem", marginBottom: "0.2rem", color: "#ddd" }}>
                <span>by <Username username={build.username} flair={build.user_flair} clickable={clickable}/> • </span> <ReactTimeAgo date={build.published_at ?? build.created_at} locale="en-US" timeStyle="mini" />
            </div>
            <div style={{ marginBottom: "0.2rem", alignSelf: "center" }}>
                <IdentityImgSpread identityIds={build.identity_ids} scale={sizes.scale} deploymentOrder={build.deployment_order} activeSinners={build.active_sinners} {...extraProps} />
            </div>
        </div>
    </div>
}
