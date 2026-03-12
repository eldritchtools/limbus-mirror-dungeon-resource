"use client";

import { useState, useMemo, useEffect } from "react";
import { getFilteredBuilds } from "../database/builds";
import { Gift, Icon, ThemePackImg, useData } from "@eldritchtools/limbus-shared-library";
import TagSelector, { tagToTagSelectorOption } from "../components/TagSelector";
import { useAuth } from "../database/authProvider";
import { useRouter } from "next/navigation";
import MarkdownEditorWrapper from "../components/Markdown/MarkdownEditorWrapper";
import "./SinnerGrid.css";
import "./GraceGrid.css";
import { extractYouTubeId } from "../YoutubeUtils";
import SinnerGrid from "./SinnerGrid";
import { runPlansStore } from "../database/localDB";
import Select from "react-select";
import { decodeBuildExtraOpts } from "./BuildExtraOpts";

function GraceComponent({ data, level, setLevel, setCurrentGrace }) {
    const handleLevelSet = l => {
        setCurrentGrace();
        if (level === l) setLevel(0);
        else setLevel(l);
    }

    return <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        padding: "0.5rem", border: "1px #aaa solid", borderRadius: "1rem"
    }} onClick={setCurrentGrace}>
        <Icon path={data.id} />
        <div>{data.name}</div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
            <button onClick={() => handleLevelSet(1)}>-</button>
            <button onClick={() => handleLevelSet(2)}>+</button>
            <button onClick={() => handleLevelSet(3)}>++</button>
        </div>
    </div>
}

function GraceEditor({ mdData, graceLevels, setGraceLevels }) {
    const [currentGrace, setCurrentGrace] = useState(0);

    const handleLevelSet = l => {
        setGraceLevels(p => p.map(() => l));
    }

    return <div style={{ display: "flex", flexWrap: "wrap" }}>
        <div className="grace-grid">
            {mdData.grace.sort((a, b) => a.index - b.index).map(grace =>
                <GraceComponent
                    key={grace.id} data={grace}
                    level={graceLevels[grace.index - 1]}
                    setLevel={v => setGraceLevels(p => p.map((x, i) => i === grace.index - 1 ? v : x))}
                    setCurrentGrace={() => setCurrentGrace(grace.index - 1)}
                />
            )}
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
            <button onClick={() => handleLevelSet(0)}>x</button>
            <button onClick={() => handleLevelSet(1)}>-</button>
            <button onClick={() => handleLevelSet(2)}>+</button>
            <button onClick={() => handleLevelSet(3)}>++</button>
        </div>
        <Icon path={mdData.grace[currentGrace].id} />
        <div>{mdData.grace[currentGrace].name}</div>
        <div>{mdData.grace[currentGrace].descs[graceLevels[currentGrace] - 1]}</div>
    </div>
}

function FloorItem({ floor, setFloor, index, isFirst, isLast, swapFloors, removeFloor }) {
    return <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center", width: "100%" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem", paddingRight: "1rem" }}>
            <button onClick={() => swapFloors(index - 1)} disabled={isFirst}>∧</button>
            <button onClick={() => removeFloor()}>
                <div style={{ color: "#ff4848", fontWeight: "bold" }}>
                    ✕
                </div>
            </button>
            <button onClick={() => swapFloors(index + 1)} disabled={isLast}>∨</button>
        </div>
        <div>
            <div style={{ display: "flex" }}>
                <button style={{ flex: 1 }}>Add</button>
                <button style={{ flex: 1 }}>Remove</button>
            </div>
            <div style={{ display: "flex", overflowX: "auto" }}>
                {floor.themePacks.map(pack =>
                    <ThemePackImg key={pack} id={pack} displayName={true} scale={.5} />
                )}
            </div>
        </div>
        <div style={{ minWidth: "min(100ch, 90vw)", flex: 1, marginLeft: "auto", marginRight: "auto" }}>
            <MarkdownEditorWrapper value={note} onChange={setFloorNote} placeholder={"Add any notes for this floor here..."} />
        </div>
    </div>
}

function FloorPlan({ floors, setFloors }) {
    const swapFloors = (a, b) => {
        setFloors(p => {
            const res = [...p];
            [res[a], res[b]] = [res[b], res[a]];
            return res;
        });
    };
    // p.map((x, i) => i === a ? p[b] : (i === b ? p[a] : x)))

    const addFloor = () => {
        setFloors(p => [...p, {}])
    };

    const removeFloor = (index) => {
        setFloors(p => p.filter((x, i) => i !== index))
    };

    const setFloor = (index, v) => {
        setFloors(p => p.map((x, i) => i === index ? v : x))
    }

    return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {floors.map((floor, i) =>
            <FloorItem
                key={i}
                floor={floor}
                setFloor={x => setFloor(i, x)}
                index={i}
                isFirst={i === 0}
                isLast={i === floors.length - 1}
                swapFloors={x => swapFloors(i, x)}
                removeFloor={() => removeFloor(i)}
            />
        )}
    </div>
}

function isLocalId(id) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return !uuidRegex.test(id);
}

export default function RunPlanEditor({ mode, runPlanId }) {
    const [mdData, mdDataLoading] = useData("md/details");

    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [build, setBuild] = useState(null);
    const [difficulty, setDifficulty] = useState("N");
    const [graceLevels, setGraceLevels] = useState([]);
    const [keyword, setKeyword] = useState(null);
    const [startGifts, setStartGifts] = useState([]);
    const [observeGifts, setObserveGifts] = useState([]);
    const [plannedGifts, setPlannedGifts] = useState([]);
    const [floors, setFloors] = useState([]);

    const [youtubeVideo, setYoutubeVideo] = useState('');
    const [tags, setTags] = useState([]);
    const [isPublished, setIsPublished] = useState(false);
    const [otherSettings, setOtherSettings] = useState(false);
    const [blockDiscovery, setBlockDiscovery] = useState(false);
    const [loading, setLoading] = useState(mode === "edit");
    const [message, setMessage] = useState("");
    const [saving, setSaving] = useState(false);
    const [createdAt, setCreatedAt] = useState(null);
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (mode === "edit") {
            const handleRunPlan = runPlan => {
                if (!runPlan) router.back();
                if (runPlan.username || isLocalId(runPlanId)) {
                    setTitle(runPlan.title);
                    setBody(runPlan.body);
                    if (runPlan.build_id)
                        getFilteredBuilds({ build_ids: [runPlan.build_id] }, true, null, false).then(x => { if (x.length > 0) setBuild(x[0]) });
                    setDifficulty(runPlan.difficulty);
                    setGraceLevels(runPlan.grace_levels);
                    setKeyword(runPlan.keyword);
                    setStartGifts(runPlan.start_gifts);
                    setObserveGifts(runPlan.observe_gifts);
                    setPlannedGifts(runPlan.planned_gifts);
                    setFloors(runPlan.floors);
                    setYoutubeVideo(runPlan.youtube_video_id ?? '');
                    setTags(runPlan.tags.map(t => tagToTagSelectorOption(t)));
                    setIsPublished(runPlan.is_published);
                    setBlockDiscovery(runPlan.block_discovery ?? false);
                    setLoading(false);

                    if (runPlan.created_at) setCreatedAt(runPlan.created_at);
                }
            }

            if (user)
                getRunPlan(runPlanId).then(handleRunPlan).catch(_err => {
                    router.push(`/run-planner/${runPlanId}`);
                });
            else
                runPlansStore.get(Number(runPlanId)).then(handleRunPlan).catch(_err => {
                    router.push(`/run-planner/${runPlanId}`);
                });
        }
    }, [mode, runPlanId, router, user]);

    const keywordOptions = useMemo(() =>
        ["Burn", "Bleed", "Tremor", "Rupture", "Sinking", "Poise", "Charge", "Slash", "Pierce", "Blunt"]
            .map(x => ({
                label: <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Icon path={x} style={{ height: "32px" }} />
                    {x}
                </div>,
                value: x
            })),
        []);

    const keywordOptionsMapped = useMemo(() => keywordOptions.reduce((acc, x) => { acc[x.value] = x; return acc; }, {}), [keywordOptions]);

    const handleSave = async (isPublished) => {
        if (title === "") {
            setMessage("Title is required.")
            return;
        }

        if (title.length < 3 || title.length > 100) {
            setMessage("Title must be between 3-100 characters.");
            return;
        }

        const tagsConverted = tags.map(t => t.value);
        const youtubeVideoId = extractYouTubeId(youtubeVideo.trim());

        if (youtubeVideo.trim().length > 0 && youtubeVideoId === null) {
            setMessage("Invalid YouTube video id.");
            return;
        }

        // setSaving(true);
        // if (user) {
        //     if (mode === "edit") {
        //         const data = await updateBuild(buildId, user.id, title, body, identityIds, egoIds, keywordsConverted, deploymentOrder, activeSinners, teamCode, youtubeVideoId, tagsConverted, extraOpts, blockDiscovery, isPublished);
        //         router.push(`/builds/${data}`);
        //     } else {
        //         const data = await insertBuild(user.id, title, body, identityIds, egoIds, keywordsConverted, deploymentOrder, activeSinners, teamCode, youtubeVideoId, tagsConverted, extraOpts, blockDiscovery, isPublished);
        //         router.push(`/builds/${data}`);
        //     }
        // } else {
        //     const buildData = {
        //         title: title,
        //         body: body,
        //         identity_ids: identityIds,
        //         ego_ids: egoIds,
        //         keyword_ids: keywordsConverted,
        //         deployment_order: deploymentOrder,
        //         active_sinners: activeSinners,
        //         team_code: teamCode,
        //         youtube_video_id: youtubeVideoId,
        //         like_count: 0,
        //         comment_count: 0,
        //         tags: tagsConverted,
        //         block_discovery: blockDiscovery,
        //         is_published: false,
        //         created_at: createdAt ?? Date.now(),
        //         updated_at: Date.now(),
        //         extra_opts: encodeBuildExtraOpts(identityUpties, identityLevels, egoThreadspins)
        //     }

        //     if (mode === "edit") buildData.id = Number(buildId);

        //     const data = await buildsStore.save(buildData)
        //     router.push(`/builds/${data}`);
        // }
    }

    const buildDisplay = useMemo(() => {
        if (!build) return null;

        const extraOpts = decodeBuildExtraOpts(build.extra_opts);

        return <SinnerGrid
            identityIds={build.identityIds}
            egoIds={build.egoIds}
            identityUpties={extraOpts.identityUpties}
            identityLevels={extraOpts.identityLevels}
            egoThreadspins={extraOpts.egoThreadspins}
            deploymentOrder={build.deploymentOrder}
            activeSinners={build.activeSinners}
        />;
    }, [build]);

    return loading || mdDataLoading ? <div style={{ display: "flex", flexDirection: "column", alignItems: "center", fontSize: "1.5rem", fontWeight: "bold" }}>
        Loading...
    </div> : <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%", containerType: "inline-size" }}>
        {!user ?
            <div style={{ color: "rgba(255, 99, 71, 0.85)" }}>When not logged in, run plans are saved locally on this device. After logging in, you can sync them to your account. Run plans that are not synced cannot be accessed while logged in.</div>
            : null
        }
        <span style={{ fontSize: "1.2rem" }}>Title</span>
        <input type="text" value={title} style={{ width: "clamp(20ch, 80%, 100ch)" }} onChange={e => setTitle(e.target.value)} />
        <div>
            <span style={{ fontSize: "1.2rem" }}>Select Difficulty:</span>
            <select name="difficulty" id="difficulty" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                <option value="N">Normal</option>
                <option value="H">Hard</option>
                <option value="M">Mixed (Normal/Hard)</option>
                <option value="I">Infinity</option>
                <option value="E">Extreme</option>
            </select>
        </div>
        <input type="text" value={title} style={{ width: "clamp(20ch, 80%, 100ch)" }} onChange={e => setTitle(e.target.value)} />
        <span style={{ fontSize: "1.2rem" }}>Team Build</span>
        {buildDisplay()}

        <span style={{ fontSize: "1.2rem" }}>Description</span>
        <div className={{ maxWidth: "48rem", marginLeft: "auto", marginRight: "auto" }}>
            <MarkdownEditorWrapper value={body} onChange={setBody} placeholder={"Describe your build here..."} />
        </div>
        <span style={{ fontSize: "1.2rem" }}>Grace of the Stars</span>
        <GraceEditor mdData={mdData} graceLevels={graceLevels} setGraceLevels={setGraceLevels} />
        <span style={{ fontSize: "1.2rem" }}>Starting Gifts</span>
        <div style={{ display: "flex", flexDirection: "column" }}>
            <Select
                value={keywordOptionsMapped[keyword]}
                onChange={x => setKeyword(x.value)}
                options={keywordOptions}
            />
            <div style={{ display: "flex", flexDirection: "row", border: "1px #aaa solid", borderRadius: "1rem" }}>
                {
                    keyword ?
                        mdData.startGiftPool[keyword].map(giftId =>
                            <div key={giftId} onClick={() => {
                                if (startGifts.includes(giftId)) setStartGifts(p => p.filter(x => x !== giftId));
                                else setStartGifts(p => [...p, giftId]);
                            }}>
                                <Gift id={giftId} includeTooltip={false} expandOverride={false} setExpandOverride={() => setExpand(false)} />
                            </div>
                        ) : null
                }
            </div>
        </div>
        <span style={{ fontSize: "1.2rem" }}>Gift Observation</span>
        <div style={{ display: "flex", flexDirection: "column" }}>
            <button>Select Gifts</button>
            <div style={{ display: "flex", flexDirection: "row", border: "1px #aaa solid", borderRadius: "1rem" }}>
                {
                    observeGifts.map(giftId =>
                        <div key={giftId} onClick={() => setObserveGifts(p => p.filter(x => x !== giftId))}>
                            <Gift id={giftId} includeTooltip={false} expandOverride={false} setExpandOverride={() => setExpand(false)} />
                        </div>
                    )
                }
            </div>
        </div>

        <span style={{ fontSize: "1.2rem" }}>Targeted Gifts</span>
        <div style={{ display: "flex", flexDirection: "column" }}>
            <button>Select Gifts</button>
            <div style={{ display: "flex", flexWrap: "wrap" }}>
                {
                    plannedGifts.map(giftId =>
                        <div key={giftId} onClick={() => setPlannedGifts(p => p.filter(x => x !== giftId))}>
                            <Gift id={giftId} includeTooltip={false} expandOverride={false} setExpandOverride={() => setExpand(false)} />
                        </div>
                    )
                }
            </div>
        </div>

        <span style={{ fontSize: "1.2rem" }}>Floor Plan</span>
        <FloorPlan floors={floors} setFloors={setFloors} />

        <div>
            <span style={{ fontSize: "1.2rem" }} >Video</span>
        </div>
        <div>
            <input type="text" value={youtubeVideo} onChange={(e) => setYoutubeVideo(e.target.value)} placeholder="Paste a YouTube Video link or id (optional)" style={{ width: "clamp(20ch, 80%, 50ch)" }} />
        </div>
        {youtubeVideo.length > 0 ?
            <span style={{ fontSize: "0.8rem" }}>Youtube Video Id: {extractYouTubeId(youtubeVideo.trim()) ?? "Not found"}</span> :
            null}
        <span style={{ fontSize: "1.2rem" }}>Tags</span>
        <TagSelector selected={tags} onChange={setTags} creatable={true} />
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <div>
                <button className={otherSettings ? "toggle-button-active" : "toggle-button"} onClick={() => setOtherSettings(p => !p)}>
                    Other Settings
                </button>
            </div>
            {otherSettings ?
                <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                    <div style={{ fontSize: "0.8rem", color: "#aaa" }}>
                        Hide from discovery related features (popular, new, random, etc). Can still be found via search or on profiles.
                    </div>
                    <label style={{ display: "flex", alignItems: "center" }}>
                        <input type="checkbox" checked={blockDiscovery} onChange={e => setBlockDiscovery(e.target.checked)} />
                        <div>Block Discovery</div>
                    </label>
                </div> :
                null
            }
        </div>
        {user && !isPublished ?
            <div style={{ color: "#aaa" }}>
                {"Drafts can still be shared through the link, but aren't searchable and don't allow comments."}
            </div> :
            null
        }
        {isPublished ?
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem" }}>
                <button style={{ padding: "0.5rem", fontSize: "1.2rem" }} onClick={() => handleSave(true)} disabled={saving}>Update</button>
                <button style={{ padding: "0.5rem", fontSize: "1.2rem" }} onClick={() => router.back()} disabled={saving}>Cancel</button>
                <span>{message}</span>
            </div> :
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem" }}>
                <button style={{ padding: "0.5rem", fontSize: "1.2rem" }} onClick={() => handleSave(false)} disabled={saving}>Save as Draft</button>
                {user ?
                    <button style={{ padding: "0.5rem", fontSize: "1.2rem" }} onClick={() => handleSave(true)} disabled={saving}>Publish</button> :
                    null
                }
                <span>{message}</span>
            </div>
        }
    </div>
}
