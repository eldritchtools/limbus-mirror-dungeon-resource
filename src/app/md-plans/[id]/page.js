"use client";

import Tag from "@/app/components/Tag";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/app/database/authProvider";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Modal } from "@/app/components/Modal";
import Username from "@/app/components/Username";

import MarkdownRenderer from "@/app/components/Markdown/MarkdownRenderer";
import ReactTimeAgo from "react-time-ago";
import { useBreakpoint } from "@eldritchtools/shared-components";
import { mdPlansStore } from "@/app/database/localDB";
import { DeleteSolid, EditSolid, ViewSolid } from "@/app/components/Symbols";
// import SocialsDisplay from "@/app/components/SocialsDisplay";
import CommentSection from "@/app/components/commentSection";
import LikeButton from "@/app/components/LikeButton";
import SaveButton from "@/app/components/SaveButton";
import { isLocalId } from "@/app/utils";
import { deleteMdPlan, getMdPlan } from "@/app/database/mdPlans";
import IdEgoDisplay from "../IdEgoDisplay";
import BuildDisplay from "../BuildDisplay";
import "../GraceGrid.css";
import { Gift, Icon, ThemePackImg, useData } from "@eldritchtools/limbus-shared-library";
import { YouTubeThumbnailEmbed } from "@/app/YoutubeUtils";
import { keywordIdMapping } from "@/app/keywordIds";

const diffMapping = {
    "N": "Normal",
    "H": "Hard",
    "M": "Mixed (Normal/Hard)",
    "I": "Infinity",
    "E": "Extreme"
}

const observeCost = { 0: 0, 1: 70, 2: 160, 3: 270 };
const gracePlusStyle = { position: "absolute", top: "0", right: "-50%", fontWeight: "bold", color: "#ffd84d", fontSize: "1.5rem" };

function GraceComponent({ data, level, setCurrentGrace }) {

    return <div className={level > 0 ? "grace-component active" : "grace-component inactive"} onClick={setCurrentGrace} style={{ position: "relative" }}>
        <div style={{ position: "relative", width: "75px", height: "75px" }}>
            <Icon path={data.id} style={{ width: "75px", height: "75px" }} />
            {level === 2 ? <div style={gracePlusStyle}>+</div> : null}
            {level === 3 ? <div style={gracePlusStyle}>++</div> : null}
        </div>
        <div>{data.name}</div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.2rem", fontWeight: "bold" }}>
            <Icon path={"starlight"} />
            {data.cost * level}
        </div>
    </div>
}

function GraceViewer({ mdData, graceLevels }) {
    const [currentGrace, setCurrentGrace] = useState(0);

    const constructDesc = () => {
        const level = Math.max(graceLevels[currentGrace] - 1, 0);
        const descs = mdData.grace[currentGrace].descs[level];
        return <div style={{ whiteSpace: "pre-wrap", paddingRight: "0.2rem", textAlign: "start" }}>
            {descs.map((d, i) => <div key={i} style={{ display: "flex", alignItems: "start", gap: "0.2rem" }}>
                {
                    Array.isArray(d) ?
                        <div>
                            {d.map((d2, j) => <div key={j} style={{ display: "flex", alignItems: "start", gap: "0.2rem" }}>
                                <span>  -</span><MarkdownRenderer content={d2} />
                            </div>)}
                        </div> :
                        <><span>-</span><MarkdownRenderer content={d} /></>
                }
            </div>)}
        </div>
    }

    return <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
        <div className="grace-grid">
            {mdData.grace.sort((a, b) => a.index - b.index).map(grace =>
                <GraceComponent
                    key={grace.id} data={grace}
                    level={graceLevels[grace.index - 1]}
                    setCurrentGrace={() => setCurrentGrace(grace.index - 1)}
                />
            )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", border: "1px #aaa solid", borderRadius: "1rem", padding: "0.5rem", alignItems: "center", width: "350px" }}>
            <div style={{ position: "relative", width: "75px", height: "75px" }}>
                <Icon path={mdData.grace[currentGrace].id} style={{ width: "75px", height: "75px" }} />
                {graceLevels[currentGrace] === 2 ? <div style={gracePlusStyle}>+</div> : null}
                {graceLevels[currentGrace] === 3 ? <div style={gracePlusStyle}>++</div> : null}
            </div>
            <div>{mdData.grace[currentGrace].name}</div>
            <div style={{ height: "180px", width: "100%", overflowY: "auto", marginTop: "0.2rem" }}>
                {constructDesc()}
            </div>
        </div>
    </div>
}

function FloorItem({ floor }) {
    const { isMobile } = useBreakpoint();

    const packScale = isMobile ? .4 :
        (floor.themePacks.length === 1 ? .44 : .3)

    const themePacksComponent = <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", width: isMobile ? "160px" : "300px", height: "350px",
        border: "1px #aaa solid", borderRadius: "1rem", padding: "0.5rem", boxSizing: "border-box"
    }}>
        <h3 style={{ margin: 0 }}>Theme Packs</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "center", overflowY: "auto" }}>
            {floor.themePacks.map(pack =>
                <ThemePackImg key={pack} id={pack} displayName={true} scale={packScale} />
            )}
        </div>
    </div>;

    const giftsComponent = <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", width: isMobile ? "160px" : "300px", height: "350px",
        border: "1px #aaa solid", borderRadius: "1rem", padding: "0.5rem", boxSizing: "border-box"
    }}>
        <h3 style={{ margin: 0 }}>Gifts</h3>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", overflowY: "auto" }}>
            {floor.gifts.map(gift =>
                <Gift key={gift} id={gift} scale={isMobile ? 0.6 : 0.9} />
            )}
        </div>
    </div>

    if (isMobile)
        return <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "1.2rem" }}>
                Floor: {floor.label}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center", width: "100%" }}>
                <div style={{ display: "flex", gap: "0.2rem" }}>
                    {themePacksComponent}
                    {giftsComponent}
                </div>
                <div>
                    <MarkdownRenderer content={floor.note} />
                </div>
            </div>
        </div>

    return <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "1.2rem" }}>
            Floor: {floor.label}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center", width: "100%" }}>
            {themePacksComponent}
            {giftsComponent}
            <div style={{alignSelf: "start", marginTop: "1rem"}}>
                <MarkdownRenderer content={floor.note} />
            </div>
        </div>
    </div>
}

export default function MdPlanPage({ params }) {
    const [mdData, mdDataLoading] = useData("md/details");

    const { id } = React.use(params);
    const { user } = useAuth();
    const [plan, setPlan] = useState(null);
    const [likeCount, setLikeCount] = useState(0);
    const [commentCount, setCommentCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const router = useRouter();
    const { isMobile } = useBreakpoint();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (!loading && pathname && searchParams) {
            const hash = window.location.hash?.substring(1);
            if (!hash) return;

            const el = document.getElementById(hash);
            if (el) {
                setTimeout(() => {
                    const y = el.getBoundingClientRect().top + window.pageYOffset - 48;
                    window.scrollTo({ top: y, behavior: 'smooth' })
                }, 200);
            }
        }
    }, [loading, pathname, searchParams]);

    useEffect(() => {
        if (loading) {
            const handlePlan = x => {
                setPlan(x);
                setLoading(false);
                setLikeCount(x.like_count);
                setCommentCount(x.comment_count);
                document.title = `${x.title} | Limbus Company Team Building Hub`;
            }

            if (isLocalId(id)) {
                mdPlansStore.get(Number(id)).then(handlePlan);
            } else {
                getMdPlan(id).then(handlePlan);
            }
        }
    }, [id, loading]);

    const editPlan = () => {
        router.push(`/md-plans/${id}/edit`);
    }

    const handleDeletePlan = async () => {
        setDeleting(true);
        const data = await deleteMdPlan(id);
        if (data && data.deleted) {
            router.push(`/md-plans`);
        }
        setDeleting(false);
    }

    return loading || mdDataLoading ?
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", fontSize: "1.5rem", fontWeight: "bold" }}>
            Loading...
        </div> :
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%", containerType: "inline-size" }}>
            <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                <h2 style={{ display: "flex", fontSize: "1.2rem", fontWeight: "bold", alignItems: "center" }}>
                    {plan.title}
                </h2>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ fontSize: "0.9rem", marginBottom: "0.5rem", color: "#ddd" }}>
                        {!isLocalId(id) ?
                            <span>by <Username username={plan.username} flair={plan.user_flair} /> • </span> :
                            null
                        }
                        <ReactTimeAgo date={plan.published_at ?? plan.created_at} locale="en-US" timeStyle="mini" />
                        {plan.updated_at !== (plan.published_at ?? plan.created_at) ?
                            <span> • Last edited <ReactTimeAgo date={plan.updated_at} locale="en-US" timeStyle="mini" /></span> :
                            null}
                    </div>
                </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                <span style={{ fontSize: "1.2rem" }}>Difficulty: {diffMapping[plan.difficulty]}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", width: isMobile ? "100%" : "95%", alignSelf: "center", marginBottom: "1rem", gap: "1rem" }}>

                {plan.recommendation_mode === "list" ? <>
                    <span style={{ fontSize: "1.2rem" }}>Recommended Identities and E.G.Os</span>
                    <IdEgoDisplay identityIds={plan.identity_ids} egoIds={plan.ego_ids} editable={false} />
                </> :
                    null
                }

                {plan.recommendation_mode === "build" ? <>
                    <span style={{ fontSize: "1.2rem" }}>Recommended Team Builds</span>
                    <BuildDisplay builds={plan.builds} editable={false} />
                </> :
                    null
                }

                <div style={{ display: "flex", flexDirection: "column", paddingRight: "0.5rem", gap: "0.5rem", width: "100%" }}>
                    <span style={{ fontSize: "1.2rem" }}>Description</span>
                    <div className={{ maxWidth: "48rem", marginLeft: "auto", marginRight: "auto" }}>
                        <div>
                            <MarkdownRenderer content={plan.body} />
                        </div>
                    </div>
                </div>

                <div style={{ border: "1px #777 solid" }} />

                {plan.grace_levels.some(x => x > 0) ?
                    <>
                        <span style={{ fontSize: "1.2rem" }}>Grace of the Stars</span>
                        <span style={{ color: "#aaa" }}>Starting buffs bought with starlight</span>
                        <GraceViewer mdData={mdData} graceLevels={plan.grace_levels} />
                    </> :
                    null
                }

                {plan.start_gift_ids.length > 0 || plan.observe_gift_ids.length > 0 ?
                    <>
                        <span style={{ fontSize: "1.2rem" }}>Gifts Setup</span>
                        <span style={{ color: "#aaa" }}>Gifts to start the run with.</span>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                            {plan.start_gift_ids.length > 0 ?
                                <div style={{
                                    display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem",
                                    width: isMobile ? "200px" : "300px", padding: "0.2rem", border: "1px #aaa solid", borderRadius: "1rem"
                                }}>
                                    <span style={{ fontSize: "1.2rem" }}>Starting Gifts</span>
                                    <span style={{ display: "flex", alignItems: "center" }}>
                                        Keyword: <Icon path={keywordIdMapping[plan.keyword_id]} style={{ height: "32px" }} />
                                    </span>
                                    <div style={{ display: "flex", flexDirection: "row", gap: "0.2rem" }}>
                                        {plan.start_gift_ids.map(giftId => <Gift key={giftId} id={giftId} scale={isMobile ? 0.6 : 1} />)}
                                    </div>
                                </div> :
                                null
                            }
                            {plan.observe_gift_ids.length > 0 ?
                                <div style={{
                                    display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem",
                                    width: isMobile ? "200px" : "300px", padding: "0.2rem", border: "1px #aaa solid", borderRadius: "1rem"
                                }}>
                                    <span style={{ fontSize: "1.2rem" }}>Gift Observation</span>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.2rem", fontWeight: "bold" }}>
                                        <Icon path={"starlight"} />
                                        {observeCost[plan.observe_gift_ids.length]}
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "row", gap: "0.2rem" }}>
                                        {plan.observe_gift_ids.map(giftId => <Gift key={giftId} id={giftId} scale={isMobile ? 0.6 : 1} />)}
                                    </div>
                                </div> :
                                null
                            }
                        </div>
                    </> :
                    null
                }

                {plan.target_gift_ids.length > 0 ?
                    <>
                        <span style={{ fontSize: "1.2rem" }}>Targeted Gifts</span>
                        <span style={{ color: "#aaa" }}>Gifts that should be targeted during the run</span>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.2rem", padding: "0.2rem" }}>
                            {plan.target_gift_ids.map(giftId => <Gift key={giftId} id={giftId} scale={isMobile ? 0.6 : 1} />)}
                        </div>
                    </> :
                    null
                }

                {plan.floors.length > 0 ?
                    <>
                        <span style={{ fontSize: "1.2rem" }}>Floor Plan</span>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            {plan.floors.map((floor, i) => <FloorItem key={i} floor={floor} />)}
                        </div>
                    </> :
                    null
                }

                {plan.youtube_video_id ? <div style={{ display: "flex", paddingTop: "1rem", alignSelf: "center", width: "100%", justifyContent: "center" }}>
                    <YouTubeThumbnailEmbed videoId={plan.youtube_video_id} />
                </div> : null}

                <div style={{ border: "1px #777 solid" }} />

                <div style={{ display: "flex", flexDirection: "column", paddingLeft: "0.5rem", width: "100%", gap: "0.5rem" }}>
                    {plan.tags.length > 0 ?
                        <div style={{ display: "flex", flexDirection: "row", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                            Tags: {plan.tags.map((t, i) => <Tag key={i} tag={isLocalId(id) ? t : t.name} type={"md-plans"} />)}
                        </div> :
                        null
                    }
                    <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", flexWrap: "wrap" }}>
                        <LikeButton targetType={"md_plan"} targetId={id} likeCount={likeCount} />
                        <SaveButton targetType={"md_plan"} targetId={id} />
                        {
                            (user && user.id === plan.user_id) || isLocalId(id) ?
                                <button onClick={editPlan}>
                                    <EditSolid text={"Edit"} />
                                </button> : null
                        }
                        {
                            user && user.id === plan.user_id ?
                                <button onClick={() => setDeleteOpen(true)}>
                                    <DeleteSolid text={"Delete"} />
                                </button> : null
                        }
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        {
                            user && user.id === plan.user_id ?
                                <div>
                                    <ViewSolid text={`${plan.view_count !== null ? plan.view_count.toLocaleString() : "-"} views`} />
                                </div>
                                : null
                        }
                    </div>
                    {/* {build.user_socials?.length > 0 ?
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "start", gap: "0.25rem" }}>
                        <span>Connect with {build.username}:</span>
                        <SocialsDisplay socials={build.user_socials} expandDirection="column" align="start" />
                    </div> :
                    null
                } */}
                </div>
            </div>

            <div style={{ border: "1px #777 solid" }} />

            {plan.is_published ?
                <div id="comments" style={{ width: "clamp(300px, 100%, 1200px)", alignSelf: "center" }}>
                    <CommentSection targetType={"md_plan"} targetId={id} ownerId={plan.user_id} commentCount={commentCount} pinnedComment={plan.pinned_comment} />
                </div> :
                <p style={{ color: "#aaa", fontweight: "bold", textAlign: "center" }}>No comments while the md plan is not published.</p>
            }

            <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem" }}>
                    <span>Are you sure you want to delete this md plan?</span>
                    <span>This is a non-recoverable action.</span>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button onClick={() => handleDeletePlan()} disabled={deleting}>Yes</button>
                        <button onClick={() => setDeleteOpen(false)}>No</button>
                    </div>
                </div>
            </Modal>
        </div>
}
