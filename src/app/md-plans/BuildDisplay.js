import { useState, useMemo, useRef } from "react";
import SinnerGrid from "./SinnerGrid";
import { decodeBuildExtraOpts } from "./BuildExtraOpts";
import SelectBuildModal from "./SelectBuildModal";
import ReactTimeAgo from "react-time-ago";
import Username from "../components/Username";
import { KeywordIcon } from "@eldritchtools/limbus-shared-library";
import { keywordIdMapping } from "../keywordIds";
import BuildEntry from "../components/BuildEntry";
import { constructTeamCode } from "./TeamCodeEncoding";
import "./teamcode.css";

export default function BuildDisplay({ builds, setBuilds, editable = false }) {
    const [index, setIndex] = useState(null);
    const [addBuildOpen, setAddBuildOpen] = useState(false);
    const teamCodeRef = useRef(null);
    const [copySuccess, setCopySuccess] = useState('');
    const [build, extraOpts] = useMemo(
        () => builds.length > 0 && index !== null ?
            [builds[index], decodeBuildExtraOpts(builds[index].extra_opts)] :
            [null, null],
        [builds, index]
    );

    const handleTeamCodeCopy = async () => {
        if (teamCodeRef.current) {
            try {
                await navigator.clipboard.writeText(teamCodeRef.current.value);
                setCopySuccess('Copied!');
                setTimeout(() => setCopySuccess(''), 2000);
            } catch (err) {
                setCopySuccess('Failed to copy!');
                setTimeout(() => setCopySuccess(''), 2000);
                console.error('Failed to copy text: ', err);
            }
        }
    };

    const teamCode = useMemo(() => build === null ? "" : constructTeamCode(build.identity_ids, build.ego_ids, build.deployment_order), [build]);

    return <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
        {build ? <>
            <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                <h2 style={{ display: "flex", fontSize: "1.2rem", fontWeight: "bold", alignItems: "center", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", gap: "0.2rem" }}>
                        {build.keyword_ids.map(id => <KeywordIcon key={id} id={keywordIdMapping[id]} />)}
                    </div>
                    {build.title}
                </h2>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ fontSize: "0.9rem", marginBottom: "0.5rem", color: "#ddd" }}>
                        <span>by <Username username={build.username} flair={build.user_flair} clickable={false} /></span>
                        {build.is_published ? <>
                            <span> • </span>
                            <ReactTimeAgo date={build.published_at ?? build.created_at} locale="en-US" timeStyle="mini" />
                            {build.updated_at !== (build.published_at ?? build.created_at) ?
                                <span> • Last edited <ReactTimeAgo date={build.updated_at} locale="en-US" timeStyle="mini" /></span> :
                                null}
                        </> :
                            null
                        }
                    </div>
                </div>
            </div>

            <SinnerGrid
                identityIds={build.identity_ids}
                egoIds={build.ego_ids}
                identityUpties={extraOpts.identityUpties}
                identityLevels={extraOpts.identityLevels}
                egoThreadspins={extraOpts.egoThreadspins}
                deploymentOrder={build.deployment_order}
                activeSinners={build.active_sinners}
            />

            <div style={{ display: "flex", gap: "0.2rem", alignSelf: builds.length > 0 ? "center" : "start", justifyContent: "center", flexWrap: "wrap" }}>
                {builds.length > 0 ? <>
                    <button disabled={index === 0} onClick={() => setIndex(p => p - 1)}>←</button>
                    <button disabled={index === builds.length - 1} onClick={() => setIndex(p => p + 1)}>→</button>
                    <button onClick={() => setIndex(null)}>View all builds</button>
                </> :
                    null
                }
                {editable ? <>
                    <button onClick={() => setAddBuildOpen(true)}>Add Build</button>
                    <button onClick={() => {
                        setBuilds(p => p.filter((x, i) => i !== index))
                        if (index === builds.length - 1) setIndex(index - 1);
                    }}>Remove Build</button>
                </> :
                    null
                }
                <div style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                    <span>Team Code:</span>
                    <div style={{ position: "relative" }}>
                        <input value={teamCode} ref={teamCodeRef} readOnly={true} style={{ cursor: "pointer" }} onClick={handleTeamCodeCopy} />
                        {copySuccess !== '' ?
                            <div className="copy-popup">
                                <div className="copy-popup-box">
                                    {copySuccess}
                                </div>
                            </div> :
                            null
                        }
                    </div>
                </div>
            </div>
        </> :
            <div style={{ borderTop: "1px #777 dotted", borderBottom: "1px #777 dotted", borderRadius: "1rem", boxSizing: "border-box" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "start", padding: "1rem", boxSizing: "border-box" }}>
                    {builds.length > 0 ?
                        <div style={{ paddingLeft: "1rem", overflowX: "auto", scrollbarWidth: "thin", width: "100%" }}>
                            <div style={{ display: "flex", gap: "1rem" }}>
                                {builds.map((build, i) =>
                                    <div key={build.id} onClick={() => setIndex(i)}>
                                        <BuildEntry build={build} clickable={false} />
                                    </div>
                                )}
                            </div>
                        </div> :
                        <div style={{ textAlign: "center" }}>
                            No builds selected...
                        </div>
                    }
                    {editable ? <div style={{ display: "flex", gap: "0.2rem", alignItems: "center" }}>
                        <button onClick={() => setAddBuildOpen(true)}>Add Builds</button>
                        <span style={{ color: "#aaa" }}>Select a build to remove it</span>
                    </div> :
                        null
                    }
                </div>
            </div>
        }

        {editable ?
            <SelectBuildModal
                isOpen={addBuildOpen}
                onClose={() => setAddBuildOpen(false)}
                onSelectBuild={build => {
                    const index = builds.findIndex(x => x.id === build.id);
                    if (index === -1) {
                        setBuilds(p => [...p, build]);
                        setIndex(builds.length);
                    } else {
                        setIndex(index);
                    }
                }}
            /> :
            null
        }
    </div>
}