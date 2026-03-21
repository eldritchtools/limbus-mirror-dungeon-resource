import { useEffect, useState } from "react";
import { useAuth } from "../database/authProvider";
import BuildEntry from "../components/BuildEntry";
import { getFilteredBuilds } from "../database/builds";
import { Modal } from "../components/Modal";
import { tabStyle } from "../styles";
import BuildsSearchComponent from "./BuildsSearchComponent";

function prepareBuildFilters(filters) {
    return Object.entries(filters).reduce((acc, [f, v]) => {
        if (f === "search") acc["query"] = v; 
        else if(f === "tags") acc[f] = v;
        else if (f === "identities" || f === "egos") {
            const [include, exclude] = v.reduce(([i, e], x) => {
                if (x[0] === "-") e.push(parseInt(x.slice(1)));
                else i.push(parseInt(x));
                return [i, e];
            }, [[], []]);
            if (include.length > 0) acc[f] = include;
            if (exclude.length > 0) acc[`${f}_exclude`] = exclude;
        }
        else if (f === "keywords") {
            const [include, exclude] = v.reduce(([i, e], x) => {
                if (x[0] === "-") e.push(keywordToIdMapping[x.slice(1)]);
                else i.push(keywordToIdMapping[x]);
                return [i, e];
            }, [[], []]);
            if (include.length > 0) acc[f] = include;
            if (exclude.length > 0) acc[`${f}_exclude`] = exclude;
        }
        return acc;
    }, {});
}

export default function SelectBuildModal({ isOpen, onClose, onSelectBuild }) {
    const { user } = useAuth();
    const [filters, setFilters] = useState({});
    const [searchBuilds, setSearchBuilds] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [searchMode, setSearchMode] = useState("search");

    useEffect(() => {
        const fetchBuilds = async () => {
            try {
                setLoading(true);

                if (searchMode === "search") {
                    const sortBy = filters["sortBy"] || "score";
                    const strictFiltering = filters["strictFiltering"] || false;
                    const newFilters = prepareBuildFilters(filters);

                    const data = await getFilteredBuilds({ ...newFilters, "ignore_block_discovery": true, "include_egos": true }, true, sortBy, strictFiltering, page, 24);

                    setSearchBuilds(data || []);
                } else if (searchMode === "user") {
                    if (user) {
                        const data = await getFilteredBuilds({ "user_id": user.id, "ignore_block_discovery": true, "include_egos": true }, true, "recency", false, page, 24);
                        setSearchBuilds(data || []);
                    }
                } else if (searchMode === "draft") {
                    if (user) {
                        const data = await getFilteredBuilds({ "user_id": user.id, "ignore_block_discovery": true, "include_egos": true }, false, "recency", false, page, 24);
                        setSearchBuilds(data || []);
                    }
                }
                setLoading(false);
            } catch (err) {
                console.error("Error loading builds:", err);
            }
        };

        fetchBuilds();

    }, [filters, page, setSearchBuilds, searchMode, user]);

    return <Modal isOpen={isOpen} onClose={onClose}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", padding: "1rem", maxHeight: "90vh", overflowY: "auto", width: "980px", maxWidth: "80vw" }}>
            <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "1rem", alignSelf: "center", marginTop: "0.5rem", marginBottom: "0.5rem" }}>
                <div style={{ ...tabStyle, color: searchMode === "search" ? "#ddd" : "#777" }} onClick={() => setSearchMode("search")}>Search Builds</div>
                <div style={{ ...tabStyle, color: searchMode === "user" ? "#ddd" : "#777" }} onClick={() => setSearchMode("user")}>My Builds</div>
                {/* <div style={{ ...tabStyle, color: searchMode === "draft" ? "#ddd" : "#777" }} onClick={() => setSearchMode("draft")}>My Drafts</div> */}
            </div>
            {searchMode === "search" ?
                <BuildsSearchComponent options={filters} setFilters={setFilters} /> :
                (!user ?
                    <span>Locally saved builds are not supported.</span> :
                    null
                )
            }
            <span style={{ textAlign: "center" }}>Adding the same build more than once is not supported.</span>
            <div style={{ border: "1px #777 solid" }} />

            {loading ?
                <p style={{ color: "#aaa", fontweight: "bold", textAlign: "center" }}>Loading builds...</p> :
                searchBuilds.length === 0 ?
                    <p style={{ color: "#aaa", fontweight: "bold", textAlign: "center" }}>
                        {page === 1 ? "No published builds yet." : "No more builds."}
                    </p> :
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, 300px)", gap: "1rem", justifyContent: "center" }}>
                            {searchBuilds.map(build => <div key={build.id} onClick={() => onSelectBuild(build)}>
                                <BuildEntry build={build} size={"S"} complete={false} clickable={false} />
                            </div>
                            )}
                        </div>

                        <div style={{ display: "flex", gap: "0.5rem", alignSelf: "end" }}>
                            <button className="page-button" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
                            <button className="page-button" disabled={searchBuilds.length < 24} onClick={() => setPage(p => p + 1)}>Next</button>
                        </div>
                    </div>
            }
        </div>
    </Modal>
}