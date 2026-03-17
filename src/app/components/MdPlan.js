"use client";

import { Icon, KeywordIcon } from "@eldritchtools/limbus-shared-library";
import { keywordIdMapping } from "../keywordIds";
import Username from "./Username";
import ReactTimeAgo from "react-time-ago";
import "./MdPlan.css";
import Tag from "./Tag";
import LikeButton from "./LikeButton";
import CommentButton from "./CommentButton";
import SaveButton from "./SaveButton";
import { useBreakpoint } from "@eldritchtools/shared-components";
import NoPrefetchLink from "../NoPrefetchLink";

const diffMapping = {
    "N": "Normal",
    "H": "Hard",
    "M": "Mixed (Normal/Hard)",
    "I": "Infinity",
    "E": "Extreme"
}

export default function MdPlan({ plan, complete = true, clickable = true }) {
    const { isMobile } = useBreakpoint();
    const width = isMobile ? "175px" : "250px";

    return <div className="md-plan" style={{ width: width }}>
        <NoPrefetchLink href={`/md-plans/${plan.id}`} className="md-plan-link" />

        <div className="md-plan-contents" style={{ width: width }}>
            <div style={{ display: "flex", height: "2.4rem", alignItems: "center", marginBottom: "0.2rem" }}>
                <h2 className="md-plan-title" style={{ fontSize: "1.2rem", fontWeight: "bold", marginTop: "0", marginBottom: "0" }}>
                    {plan.title}
                </h2>
            </div>
            <div style={{ fontSize: "0.8rem", marginBottom: "0.2rem", color: "#ddd" }}>
                <span>by <Username username={plan.username} flair={plan.user_flair} clickable={clickable} /> • </span> <ReactTimeAgo date={plan.published_at ?? plan.created_at} locale="en-US" timeStyle="mini" />
            </div>
            <div>
                Difficulty: {diffMapping[plan.difficulty]}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>Keyword</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>Min Starlight</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {plan.keyword_id ?
                        <KeywordIcon id={keywordIdMapping[plan.keyword_id]} size={24} /> :
                        <div />
                    }
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon path={"starlight"} />
                    {plan.cost}
                </div>
            </div>
            <div style={{ marginBottom: "0.2rem", alignSelf: "start" }}>
                {complete ? <div style={{ display: "flex", flexDirection: "row", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                    {plan.tags.map((t, i) => t ? <Tag key={i} tag={t} type={"md-plans"} /> : null)}
                </div> : null}
            </div>
        </div>
        {complete ?
            <div className="md-plan-buttons-container">
                <LikeButton targetType={"md_plan"} targetId={plan.id} likeCount={plan.like_count} buildEntryVersion={true} iconSize={20} shortText={true} />
                <CommentButton targetPath={"md-plans"} targetId={plan.id} count={plan.comment_count} buildEntryVersion={true} iconSize={20} shortText={true} />
                <SaveButton targetType={"md_plan"} targetId={plan.id} buildEntryVersion={true} iconSize={20} shortText={true} />
            </div>
            : null}
    </div>
}
