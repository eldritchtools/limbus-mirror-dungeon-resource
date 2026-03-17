"use client";

import { useState, useMemo, useEffect } from "react";
import { Gift, Icon, ThemePackImg, useData } from "@eldritchtools/limbus-shared-library";
import TagSelector, { tagToTagSelectorOption } from "../components/TagSelector";
import { useAuth } from "../database/authProvider";
import { useRouter } from "next/navigation";
import MarkdownEditorWrapper from "../components/Markdown/MarkdownEditorWrapper";
import "./SinnerGrid.css";
import "./GraceGrid.css";
import { extractYouTubeId } from "../YoutubeUtils";
import { mdPlansStore } from "../database/localDB";
import Select from "react-select";
import BuildDisplay from "./BuildDisplay";
import SelectGiftModal from "./SelectGiftModal";
import { selectStyle } from "../styles";
import MarkdownRenderer from "../components/Markdown/MarkdownRenderer";
import { useBreakpoint } from "@eldritchtools/shared-components";
import IdEgoDisplay from "./IdEgoDisplay";
import SelectThemePackModal from "./SelectThemePackModal";
import { createMdPlan, getMdPlan, updateMdPlan } from "../database/mdPlans";
import { keywordIdMapping, keywordToIdMapping } from "../keywordIds";

const observeCost = { 0: 0, 1: 70, 2: 160, 3: 270 }

function GraceComponent({ data, level, setLevel, setCurrentGrace }) {
    const handleLevelSet = l => {
        setCurrentGrace();
        if (level === l) setLevel(0);
        else setLevel(l);
    }

    return <div className="grace-component" onClick={setCurrentGrace}>
        <Icon path={data.id} style={{ width: "75px", height: "75px" }} />
        <div>{data.name}</div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
            <button className={level === 1 ? "toggle-button active" : "toggle-button"} onClick={() => handleLevelSet(1)}>-</button>
            <button className={level === 2 ? "toggle-button active" : "toggle-button"} onClick={() => handleLevelSet(2)}>+</button>
            <button className={level === 3 ? "toggle-button active" : "toggle-button"} onClick={() => handleLevelSet(3)}>++</button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.2rem", fontWeight: "bold" }}>
            <Icon path={"starlight"} />
            {data.cost * level}
        </div>
    </div>
}

function GraceEditor({ mdData, graceLevels, setGraceLevels }) {
    const [currentGrace, setCurrentGrace] = useState(0);

    const handleLevelSet = l => {
        setGraceLevels(p => p.map(() => l));
    }

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
                    setLevel={v => setGraceLevels(p => p.map((x, i) => i === grace.index - 1 ? v : x))}
                    setCurrentGrace={() => setCurrentGrace(grace.index - 1)}
                />
            )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", border: "1px #aaa solid", borderRadius: "1rem", padding: "0.5rem", alignItems: "center", width: "350px" }}>
            <span>Set All Graces</span>
            <div style={{ display: "flex", gap: "0.5rem" }}>
                <button onClick={() => handleLevelSet(0)}>x</button>
                <button onClick={() => handleLevelSet(1)}>-</button>
                <button onClick={() => handleLevelSet(2)}>+</button>
                <button onClick={() => handleLevelSet(3)}>++</button>
            </div>
            <div style={{ border: "1px #aaa solid", width: "100%", margin: "0.5rem" }} />
            <Icon path={mdData.grace[currentGrace].id} style={{ width: "75px", height: "75px" }} />
            <div>{mdData.grace[currentGrace].name}</div>
            <div style={{ height: "180px", width: "100%", overflowY: "auto", marginTop: "0.2rem" }}>
                {constructDesc()}
            </div>
        </div>
    </div>
}

function FloorItem({ floor, setFloor, difficulty, index, isFirst, isLast, swapFloors, removeFloor, addThemePacks, removeThemePacks, addFloorGifts, removeFloorGifts }) {
    const { isMobile } = useBreakpoint();

    const options = useMemo(() => {
        const result = ["1", "2", "3", "4", "5"];
        if (difficulty === "I" || difficulty === "E") result.push("6-10");
        if (difficulty === "E") result.push("11-15");
        return result;
    }, [difficulty]);

    return <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <span>Floor Set:</span>
            <select value={floor.floorSet} onChange={e => {setFloor("floorSet", e.target.value); setFloor("themePacks", []); setFloor("gifts", []); }}>
                {options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <span>Floor Label:</span>
            <input value={floor.label} onChange={e => setFloor("label", e.target.value)} />
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center", width: "100%" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "2rem", paddingRight: "1rem" }}>
                <button onClick={() => swapFloors(index - 1)} disabled={isFirst}>∧</button>
                <button onClick={() => removeFloor()}>
                    <div style={{ color: "#ff4848", fontWeight: "bold" }}>
                        ✕
                    </div>
                </button>
                <button onClick={() => swapFloors(index + 1)} disabled={isLast}>∨</button>
            </div>
            <div style={{
                display: "flex", flexDirection: "column", alignItems: "center", width: isMobile ? "250px" : "300px", height: "350px",
                border: "1px #aaa solid", borderRadius: "1rem", padding: "0.5rem", boxSizing: "border-box"
            }}>
                <h3 style={{ margin: 0 }}>Theme Packs</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 80px)" }}>
                    <button onClick={() => addThemePacks()}>Add</button>
                    <button onClick={() => removeThemePacks()}>Remove</button>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "center", overflowY: "auto" }}>
                    {floor.themePacks.map(pack =>
                        <ThemePackImg key={pack} id={pack} displayName={true} scale={.3} />
                    )}
                </div>
            </div>
            <div style={{
                display: "flex", flexDirection: "column", alignItems: "center", width: isMobile ? "250px" : "300px", height: "350px",
                border: "1px #aaa solid", borderRadius: "1rem", padding: "0.5rem", boxSizing: "border-box"
            }}>
                <h3 style={{ margin: 0 }}>Gifts</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 80px)" }}>
                    <button onClick={() => addFloorGifts()}>Add</button>
                    <button onClick={() => removeFloorGifts()}>Remove</button>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", overflowY: "auto" }}>
                    {floor.gifts.map(gift =>
                        <Gift key={gift} id={gift} scale={isMobile ? 0.6 : 0.9} />
                    )}
                </div>
            </div>
            <div style={{ minWidth: "min(80ch, 90vw)" }}>
                <MarkdownEditorWrapper
                    value={floor.note}
                    onChange={x => setFloor("note", x)}
                    placeholder={"Add any notes for this floor here..."}
                />
            </div>
        </div>
    </div>
}

function FloorPlan({ difficulty, floors, setFloors, addThemePacks, removeThemePacks, addFloorGifts, removeFloorGifts }) {
    const [nextKey, setNextKey] = useState(0);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setNextKey(Math.max(0, ...floors.map(x => x.key)) + 1);
    }, [floors]);

    const swapFloors = (a, b) => {
        setFloors(p => {
            const res = [...p];
            [res[a], res[b]] = [res[b], res[a]];
            return res;
        });
    };
    // p.map((x, i) => i === a ? p[b] : (i === b ? p[a] : x)))

    const addFloor = () => {
        setFloors(p => [...p, {
            key: nextKey,
            floorSet: "1",
            label: "",
            themePacks: [],
            gifts: [],
            note: ""
        }])
        setNextKey(p => p+1);
    };

    const removeFloor = (index) => {
        setFloors(p => p.filter((x, i) => i !== index));
    };

    const setFloor = (index, key, value) => {
        setFloors(p => p.map((x, i) => i === index ? {...x, [key]: value} : x));
    }

    return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <div>
            <button onClick={() => addFloor()}>Add Floor</button>
        </div>
        {floors.map((floor, i) =>
            <FloorItem
                key={floor.key}
                floor={floor}
                setFloor={(k, v) => setFloor(i, k, v)}
                difficulty={difficulty}
                index={i}
                isFirst={i === 0}
                isLast={i === floors.length - 1}
                swapFloors={x => swapFloors(i, x)}
                removeFloor={() => removeFloor(i)}
                addThemePacks={() => addThemePacks(i)}
                removeThemePacks={() => removeThemePacks(i)}
                addFloorGifts={() => addFloorGifts(i)}
                removeFloorGifts={() => removeFloorGifts(i)}
            />
        )}
    </div>
}

function isLocalId(id) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return !uuidRegex.test(id);
}

export default function MdPlanEditor({ mode, mdPlanId }) {
    const [mdData, mdDataLoading] = useData("md/details");
    const [themePacks, themePacksLoading] = useData("md_theme_packs");
    const [floorPacks, floorPacksLoading] = useData("md_floor_packs");

    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [recommendationMode, setRecommendationMode] = useState("none");
    const [builds, setBuilds] = useState([]);
    const [identityIds, setIdentityIds] = useState([]);
    const [egoIds, setEgoIds] = useState([]);
    const [difficulty, setDifficulty] = useState("N");
    const [graceLevels, setGraceLevels] = useState(Array.from({ length: 10 }, () => 0));
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
    const { isMobile } = useBreakpoint();

    const [giftSelectionOpen, setGiftSelectionOpen] = useState(false);
    const [giftSelectionMode, setGiftSelectionMode] = useState(null);
    const [giftSelectionSearch, setGiftSelectionSearch] = useState(false);
    const [giftSelectionFloorIndex, setGiftSelectionFloorIndex] = useState(0);

    const [packSelectionOpen, setPackSelectionOpen] = useState(false);
    const [packSelectionMode, setPackSelectionMode] = useState(null);
    const [packSelectionFloorIndex, setPackSelectionFloorIndex] = useState(0);

    useEffect(() => {
        if (mode === "edit") {
            const handleMdPlan = mdPlan => {
                if (!mdPlan) router.back();
                if (mdPlan.username || isLocalId(mdPlanId)) {
                    setTitle(mdPlan.title);
                    setBody(mdPlan.body);
                    setBuilds(mdPlan.builds);
                    setRecommendationMode(mdPlan.recommendation_mode);
                    setIdentityIds(mdPlan.identity_ids);
                    setEgoIds(mdPlan.ego_ids);
                    setBuilds(mdPlan.builds);
                    setDifficulty(mdPlan.difficulty);
                    setGraceLevels(mdPlan.grace_levels);
                    setKeyword(keywordIdMapping[mdPlan.keyword_id]);
                    setStartGifts(mdPlan.start_gift_ids);
                    setObserveGifts(mdPlan.observe_gift_ids);
                    setPlannedGifts(mdPlan.target_gift_ids);
                    setFloors(mdPlan.floors.map((x, i) => ({...x, key: i})));
                    setYoutubeVideo(mdPlan.youtube_video_id ?? '');
                    setTags(mdPlan.tags.map(t => tagToTagSelectorOption(t?.name ?? t)));
                    setIsPublished(mdPlan.is_published);
                    setBlockDiscovery(mdPlan.block_discovery ?? false);
                    setLoading(false);

                    if (mdPlan.created_at) setCreatedAt(mdPlan.created_at);
                }
            }

            if (user)
                getMdPlan(mdPlanId).then(handleMdPlan).catch(_err => {
                    router.push(`/md-plans/${mdPlanId}`);
                });
            else
                mdPlansStore.get(Number(mdPlanId)).then(handleMdPlan).catch(_err => {
                    router.push(`/md-plans/${mdPlanId}`);
                });
        }
    }, [mode, mdPlanId, router, user]);

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

        const cost = mdData.grace.reduce((acc, grace) => acc + grace.cost * graceLevels[grace.index - 1], 0) + observeCost[observeGifts.length];

        const planData = {
            title: title,
            body: body,
            recommendation_mode: recommendationMode,
            difficulty: difficulty,
            identity_ids: identityIds,
            ego_ids: egoIds,
            grace_levels: graceLevels,
            cost: cost,
            keyword_id: keywordToIdMapping[keyword] ?? null,
            start_gift_ids: startGifts,
            observe_gift_ids: observeGifts,
            target_gift_ids: plannedGifts,
            floors: floors,
            youtube_video_id: youtubeVideoId,
            is_published: isPublished,
            block_discovery: blockDiscovery,
            build_ids: builds.map(build => build.id),
            tags: tagsConverted
        }

        setSaving(true);
        if (user) {
            if (mode === "edit") {
                const data = await updateMdPlan(mdPlanId, planData);
                router.push(`/md-plans/${data}`);
            } else {
                const data = await createMdPlan(planData);
                router.push(`/md-plans/${data}`);
            }
        } else {
            planData.created_at = createdAt ?? Date.now();
            planData.updated_at = Date.now();
            if (mode === "edit") planData.id = Number(buildId);

            const data = await mdPlansStore.save(planData)
            router.push(`/md-plans/${data}`);
        }
    }

    const handleGiftSelectionOpen = (mode, search, index = 0) => {
        setGiftSelectionMode(mode);
        setGiftSelectionSearch(search);
        setGiftSelectionOpen(true);
        setGiftSelectionFloorIndex(index);
    };

    const addStartingGift = () => handleGiftSelectionOpen("starting-add", false);
    const removeStartingGift = () => handleGiftSelectionOpen("starting-rem", false);
    const addGiftObservation = () => handleGiftSelectionOpen("observation-add", true);
    const removeGiftObservation = () => handleGiftSelectionOpen("observation-rem", false);
    const addTargetedGifts = () => handleGiftSelectionOpen("target-add", true);
    const removeTargetedGifts = () => handleGiftSelectionOpen("target-rem", false);
    const addFloorGifts = index => handleGiftSelectionOpen("floor-add", true, index);
    const removeFloorGifts = index => handleGiftSelectionOpen("floor-rem", false, index);

    const [giftSelectionList, giftSelectionFunc, giftSelectionFilter] = useMemo(() => {
        if (themePacksLoading || mdDataLoading || !giftSelectionOpen) return [[], null, null];

        switch (giftSelectionMode) {
            case "starting-add":
                return [mdData.startGiftPool[keyword].map(x => `${x}`),
                id => {
                    const lim = 1 + (graceLevels[3] !== 0) + (graceLevels[9] !== 0);
                    if (startGifts.length < lim) setStartGifts(p => [...p, id])
                },
                gift => !startGifts.includes(gift.id)
                ];
            case "starting-rem":
                return [startGifts, id => setStartGifts(p => p.filter(x => x !== id)), null];
            case "observation-add":
                return [null,
                    id => { if (observeGifts.length < 3) setObserveGifts(p => [...p, id]) },
                    gift => ["1", "2", "3"].includes(gift.tier) && !gift.vestige && !observeGifts.includes(gift.id)
                ];
            case "observation-rem":
                return [observeGifts, id => setObserveGifts(p => p.filter(x => x !== id)), null];
            case "target-add":
                return [null, id => setPlannedGifts(p => [...p, id]), gift => !gift.vestige && !plannedGifts.includes(gift.id)];
            case "target-rem":
                return [plannedGifts, id => setPlannedGifts(p => p.filter(x => x !== id)), null];
            case "floor-add":
                if(floors.length === 0) return [[], null, null];
                return [
                    Array.from(floors[giftSelectionFloorIndex].themePacks.reduce((acc, id) => {
                        if ("exclusive_gifts" in themePacks[id])
                            themePacks[id].exclusive_gifts.forEach(giftId => acc.add(giftId))
                        return acc;
                    }, new Set())),
                    id => setFloors(p => p.map((floor, i) => i === giftSelectionFloorIndex ?
                        { ...floor, gifts: [...floors[i].gifts, id] } :
                        floor)
                    ),
                    gift => !gift.vestige && !floors[giftSelectionFloorIndex].gifts?.includes(gift.id)
                ]
            case "floor-rem":
                if(floors.length === 0) return [[], null, null];
                return [
                    floors[giftSelectionFloorIndex].gifts,
                    id => setFloors(p => p.map((floor, i) => i === giftSelectionFloorIndex ?
                        { ...floor, gifts: floors[i].gifts.filter(x => x !== id) } :
                        floor)
                    ),
                    null
                ]
            default:
                return [null, null, null];
        }
    }, [giftSelectionMode, giftSelectionOpen, startGifts, observeGifts, plannedGifts, giftSelectionFloorIndex, graceLevels, keyword, mdData, mdDataLoading, floors, setFloors, themePacks, themePacksLoading]);

    const handlePackSelectionOpen = (mode, index = 0) => {
        setPackSelectionMode(mode);
        setPackSelectionOpen(true);
        setPackSelectionFloorIndex(index);
    };

    const addThemePacks = index => handlePackSelectionOpen("add", index);
    const removeThemePacks = index => handlePackSelectionOpen("rem", index);

    const [packSelectionList, packSelectionFunc] = useMemo(() => {
        if (floorPacksLoading || !packSelectionOpen) return [[], null];

        switch (packSelectionMode) {
            case "add":
                const floor = floors[packSelectionFloorIndex];
                const options = difficulty === "M" ?
                    Array.from(new Set([...floorPacks.normal[floor.floorSet], ...floorPacks.hard[floor.floorSet]])) :
                    (difficulty === "N" ?
                        floorPacks.normal[floor.floorSet] :
                        floorPacks.hard[floor.floorSet]
                    );

                return [
                    options.filter(x => !floor.themePacks.includes(x)),
                    id => setFloors(p => p.map((floor, i) => i === packSelectionFloorIndex ?
                        { ...floor, themePacks: [...floor.themePacks, id] } :
                        floor)
                    )
                ];
            case "rem":
                return [
                    floors[packSelectionFloorIndex].themePacks,
                    id => setFloors(p => p.map((floor, i) => i === packSelectionFloorIndex ?
                        { ...floor, themePacks: floor.themePacks.filter(x => x !== id) } :
                        floor)
                    )
                ];
            default:
                return [[], null];
        }
    }, [packSelectionOpen, difficulty, floorPacks, floorPacksLoading, packSelectionFloorIndex, packSelectionMode, floors]);

    return loading || mdDataLoading ? <div style={{ display: "flex", flexDirection: "column", alignItems: "center", fontSize: "1.5rem", fontWeight: "bold" }}>
        Loading...
    </div> : <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%", containerType: "inline-size" }}>
        <h2 style={{ fontSize: "1.2rem", margin: 0 }}>
            {mode === "edit" ? "Editing" : "Creating"} Run Plan
        </h2>
        {!user ?
            <div style={{ color: "rgba(255, 99, 71, 0.85)" }}>When not logged in, run plans are saved locally on this device. After logging in, you can sync them to your account. Run plans that are not synced cannot be accessed while logged in.</div>
            : null
        }
        <span style={{ fontSize: "1.2rem" }}>Title</span>
        <input type="text" value={title} style={{ width: "clamp(20ch, 80%, 100ch)" }} onChange={e => setTitle(e.target.value)} />
        <div style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
            <span style={{ fontSize: "1.2rem" }}>Select Difficulty:</span>
            <select name="difficulty" id="difficulty" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                <option value="N">Normal</option>
                <option value="H">Hard</option>
                <option value="M">Mixed (Normal/Hard)</option>
                <option value="I">Infinity</option>
                <option value="E">Extreme</option>
            </select>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
            <span style={{ fontSize: "1.2rem" }}>Select Team Recommendation Mode:</span>
            <select name="recommend" id="recommend" value={recommendationMode} onChange={e => setRecommendationMode(e.target.value)}>
                <option value="none">None</option>
                <option value="list">List</option>
                <option value="build">Build</option>
            </select>
        </div>
        <span style={{ color: "#aaa" }}>Select a mode if you want to recommend what to bring for this run plan. List mode lets you display a list of identities and E.G.Os. Build mode lets you select builds available in the Team Building Hub.</span>

        {recommendationMode === "list" ? <>
            <span style={{ fontSize: "1.2rem" }}>Recommended Identities and E.G.Os</span>
            <span style={{ color: "#aaa" }}>Select identities and E.G.Os to recommend.</span>
            <IdEgoDisplay identityIds={identityIds} setIdentityIds={setIdentityIds} egoIds={egoIds} setEgoIds={setEgoIds} editable={true} />
        </> :
            null
        }

        {recommendationMode === "build" ? <>
            <span style={{ fontSize: "1.2rem" }}>Recommended Team Builds</span>
            <span style={{ color: "#aaa" }}>Select team builds to recommend. You may select as many as you want.</span>
            <BuildDisplay builds={builds} setBuilds={setBuilds} editable={true} />
        </> :
            null
        }

        <span style={{ fontSize: "1.2rem" }}>Description</span>
        <div className={{ maxWidth: "48rem", marginLeft: "auto", marginRight: "auto" }}>
            <MarkdownEditorWrapper value={body} onChange={setBody} placeholder={"Describe your run plan here..."} />
        </div>
        <span style={{ fontSize: "1.2rem" }}>Grace of the Stars</span>
        <span style={{ color: "#aaa" }}>Starting buffs bought with starlight</span>
        <GraceEditor mdData={mdData} graceLevels={graceLevels} setGraceLevels={setGraceLevels} />
        <span style={{ fontSize: "1.2rem" }}>Gifts Setup</span>
        <span style={{ color: "#aaa" }}>Gifts to start the run with. The corresponding graces need to be turned on to select multiple starting gifts.</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            <div style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem",
                width: isMobile ? "200px" : "300px", padding: "0.2rem", border: "1px #aaa solid", borderRadius: "1rem"
            }}>
                <span style={{ fontSize: "1.2rem" }}>Starting Gifts</span>
                <Select
                    value={keywordOptionsMapped[keyword]}
                    onChange={x => { setStartGifts([]); setKeyword(x.value); }}
                    options={keywordOptions}
                    styles={selectStyle}
                    placeholder={"Select keyword..."}
                />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                    <button disabled={!keyword} onClick={() => addStartingGift()}>Add</button>
                    <button disabled={!keyword} onClick={() => removeStartingGift()}>Remove</button>
                </div>
                <div style={{ display: "flex", flexDirection: "row", gap: "0.2rem" }}>
                    {startGifts.map(giftId => <Gift key={giftId} id={giftId} scale={isMobile ? 0.6 : 1} />)}
                </div>
            </div>
            <div style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem",
                width: isMobile ? "200px" : "300px", padding: "0.2rem", border: "1px #aaa solid", borderRadius: "1rem"
            }}>
                <span style={{ fontSize: "1.2rem" }}>Gift Observation</span>
                <div style={{ display: "flex", alignItems: "center", gap: "0.2rem", fontWeight: "bold" }}>
                    <Icon path={"starlight"} />
                    {observeCost[observeGifts.length]}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                    <button onClick={() => addGiftObservation()}>Add</button>
                    <button onClick={() => removeGiftObservation()}>Remove</button>
                </div>
                <div style={{ display: "flex", flexDirection: "row", gap: "0.2rem" }}>
                    {observeGifts.map(giftId => <Gift key={giftId} id={giftId} scale={isMobile ? 0.6 : 1} />)}
                </div>
            </div>
        </div>

        <span style={{ fontSize: "1.2rem" }}>Targeted Gifts</span>
        <span style={{ color: "#aaa" }}>Gifts that should be targeted during the run</span>

        <div style={{ display: "flex" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 80px)" }}>
                <button onClick={() => addTargetedGifts()}>Add</button>
                <button onClick={() => removeTargetedGifts()}>Remove</button>
            </div>
        </div>
        {plannedGifts.length > 0 ?
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.2rem", padding: "0.2rem" }}>
                {plannedGifts.map(giftId => <Gift key={giftId} id={giftId} scale={isMobile ? 0.6 : 1} />)}
            </div> :
            null
        }

        <span style={{ fontSize: "1.2rem" }}>Floor Plan</span>
        <span style={{ color: "#aaa" }}>Plans for each floor or set of floors. The floor set determines the available theme packs, while the label is shown to the viewers of the run plan.</span>
        <FloorPlan
            difficulty={difficulty} floors={floors} setFloors={setFloors}
            addThemePacks={addThemePacks} removeThemePacks={removeThemePacks}
            addFloorGifts={addFloorGifts} removeFloorGifts={removeFloorGifts}
        />

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
        <SelectGiftModal
            isOpen={giftSelectionOpen}
            onClose={() => setGiftSelectionOpen(false)}
            choiceList={giftSelectionList}
            showSearch={giftSelectionSearch}
            onSelectGift={giftSelectionFunc}
            forcedFilter={giftSelectionFilter}
        />

        <SelectThemePackModal
            isOpen={packSelectionOpen}
            onClose={() => setPackSelectionOpen(false)}
            options={packSelectionList}
            onSelectPack={packSelectionFunc}
        />
    </div>
}
