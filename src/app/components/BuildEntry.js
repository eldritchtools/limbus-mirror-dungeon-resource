"use client";

import { KeywordIcon } from "@eldritchtools/limbus-shared-library";
import { keywordIdMapping } from "../keywordIds";
import Username from "./Username";
import IdentityImgSpread from "./IdentityImgSpread";
import ReactTimeAgo from "react-time-ago";
import { decodeBuildExtraOpts } from "../run-planner/BuildExtraOpts";
import "./BuildEntry.css";

export default function BuildEntry({ build }) {
    const extraProps = {};
    if (build.extra_opts) {
        const extraOpts = decodeBuildExtraOpts(build.extra_opts, ["iu"])
        if (extraOpts.identityUpties) extraProps.identityUpties = extraOpts.identityUpties;
    }

    const sizes = { width: "300px", iconSize: 24, buttonIconSize: 16, scale: 0.175 };

    if (!sizes) return null;

    return <div className="build-entry" style={{ width: sizes.width }}>
        {build.keyword_ids.length > 0 ?
            <div className="build-icon-rails">
                {build.keyword_ids.map(id => <KeywordIcon key={id} id={keywordIdMapping[id]} size={sizes.iconSize} />)}
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
                <span>by <Username username={build.username} flair={build.user_flair} /> • </span> <ReactTimeAgo date={build.published_at ?? build.created_at} locale="en-US" timeStyle="mini" />
            </div>
            <div style={{ marginBottom: "0.2rem", alignSelf: "center" }}>
                <IdentityImgSpread identityIds={build.identity_ids} scale={sizes.scale} deploymentOrder={build.deployment_order} activeSinners={build.active_sinners} {...extraProps} />
            </div>
        </div>
    </div>
}
