"use client";

import { useState } from "react";
import { SinnerIcon, Icon, IdentityImg, EgoImg, useData } from "@eldritchtools/limbus-shared-library";
import { Modal } from "../components/Modal";
import "./AllIdEgoModal.css";

const modeStyle = { fontSize: "1.2rem", fontWeight: "bold", cursor: "pointer", transition: "all 0.2s" };

const keywordMapping = {
    "Burn": "Combustion",
    "Bleed": "Laceration",
    "Tremor": "Vibration",
    "Rupture": "Burst",
    "Sinking": "Sinking",
    "Poise": "Breath",
    "Charge": "Charge"
};

const idsMainFilters = {
    "tier": ["0", "00", "000"],
    "sinner": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    "keyword": ["Burn", "Bleed", "Tremor", "Rupture", "Sinking", "Poise", "Charge"],
    "affinity": ["wrath", "lust", "sloth", "gluttony", "gloom", "pride", "envy"],
    "skillType": ["Slash", "Pierce", "Blunt", "Guard", "Evade", "Counter"]
}

const egosMainFilters = {
    "tier": ["zayin", "teth", "he", "waw", "aleph"],
    "sinner": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    "keyword": ["Burn", "Bleed", "Tremor", "Rupture", "Sinking", "Poise", "Charge"],
    "affinity": ["wrath", "lust", "sloth", "gluttony", "gloom", "pride", "envy"],
    "skillType": ["Slash", "Pierce", "Blunt"]
}

const egoRankMapping = {
    "ZAYIN": 0,
    "TETH": 1,
    "HE": 2,
    "WAW": 3,
    "ALEPH": 4
}

const mainFiltersMapping = {};
Object.entries(idsMainFilters).forEach(([type, list]) => list.forEach(filter => { mainFiltersMapping[filter] = type; }));
Object.entries(egosMainFilters).forEach(([type, list]) => list.forEach(filter => { mainFiltersMapping[filter] = type; }));

export default function AllIdEgoModal({ isOpen, onClose, identityIds, egoIds, setIdentityIds, setEgoIds }) {
    const [identities, identitiesLoading] = useData("identities_mini");
    const [egos, egosLoading] = useData("egos");
    const [mode, setMode] = useState("id");
    const [searchString, setSearchString] = useState("");
    const [filters, setFilters] = useState([]);

    const handleToggle = (filter, selected, excluded) => {
        if (selected)
            setFilters(p => p.map(x => x === filter ? `-${x}` : x));
        else if (excluded)
            setFilters(p => p.filter(x => `-${filter}` !== x));
        else
            setFilters(p => [...p, filter]);
    }

    const clearAll = () => {
        setFilters([]);
    }

    const list = useMemo(() => {
        let result = [];
        if(identitiesLoading || egosLoading) return result;

        const [f, fe] = filters.reduce(([f, fe], filter) => {
            const exc = filter[0] === "-";
            let realFilter = exc ? filter.slice(1) : filter;
            if (Number.isInteger(Number(realFilter)) && Number(realFilter) > 0) realFilter = Number(realFilter);

            if (exc) {
                if (mainFiltersMapping[realFilter] in fe) fe[mainFiltersMapping[realFilter]].push(realFilter);
                else fe[mainFiltersMapping[realFilter]] = [realFilter];
            } else {
                if (mainFiltersMapping[realFilter] in f) f[mainFiltersMapping[realFilter]].push(realFilter);
                else f[mainFiltersMapping[realFilter]] = [realFilter];
            }

            return [f, fe];
        }, [[], []]);

        if (mode === "id") {
            Object.entries(identities).forEach(([id, data]) => {
                if (identityIds.includes(id)) return false;
                if (searchString.length > 0 && !data.name.toLowerCase().includes(searchString.toLowerCase())) return false;

                for (const type in f) {
                    if (type === "tier") {
                        if (!f[type].some(x => x.length === data.rank)) return false;
                    } else if (type === "affinity") {
                        if (!f[type].some(x => data.skillTypes.some(s => s.type.affinity === x) || data.defenseSkillTypes.some(s => s.type.affinity === x))) return false;
                    } else if (type === "skillType") {
                        if (!f[type].some(x => data.skillTypes.some(s => s.type.type === x.toLowerCase()) || data.defenseSkillTypes.some(s => s.type.type === x.toLowerCase()))) return false;
                    } else if (type === "keyword") {
                        if (!f[type].some(x => (data.skillKeywordList || []).includes(x))) return false;
                    } else if (type === "sinner") {
                        if (!f[type].some(x => x === data.sinnerId)) return false;
                    }
                }

                for (const type in fe) {
                    if (type === "tier") {
                        if (fe[type].some(x => x.length === data.rank)) return false;
                    } else if (type === "affinity") {
                        if (fe[type].some(x => data.skillTypes.some(s => s.type.affinity === x) || data.defenseSkillTypes.some(s => s.type.affinity === x))) return false;
                    } else if (type === "skillType") {
                        if (fe[type].some(x => data.skillTypes.some(s => s.type.type === x.toLowerCase()) || data.defenseSkillTypes.some(s => s.type.type === x.toLowerCase()))) return false;
                    } else if (type === "keyword") {
                        if (fe[type].some(x => (data.skillKeywordList || []).includes(x))) return false;
                    } else if (type === "sinner") {
                        if (fe[type].some(x => x === data.sinnerId)) return false;
                    }
                }

                result.push(data);
            })
        } else {
            Object.entries(egos).forEach(([id, data]) => {
                if (egoIds.some(list => list.includes(id))) return true;
                if (searchString.length > 0 && !data.name.toLowerCase().includes(searchString.toLowerCase())) return true;

                for (const type in f) {
                    if (type === "tier") {
                        if (!f[type].some(x => x === data.rank.toLowerCase())) return false;
                    } else if (type === "affinity") {
                        if (!f[type].some(x => data.awakeningType.affinity === x || ("corrosionType" in data && data.corrosionType.affinity === x))) return false;
                    } else if (type === "skillType") {
                        if (!f[type].some(x => data.awakeningType.type === x.toLowerCase() || ("corrosionType" in data && data.corrosionType.type === x.toLowerCase()))) return false;
                    } else if (type === "keyword") {
                        if (!f[type].some(x => data.statuses?.includes(keywordMapping[x]))) return false;
                    } else if (type === "sinner") {
                        if (!f[type].some(x => x === data.sinnerId)) return false;
                    }
                }

                for (const type in fe) {
                    if (type === "tier") {
                        if (fe[type].some(x => x === data.rank.toLowerCase())) return false;
                    } else if (type === "affinity") {
                        if (fe[type].some(x => data.awakeningType.affinity === x || ("corrosionType" in data && data.corrosionType.affinity === x))) return false;
                    } else if (type === "skillType") {
                        if (fe[type].some(x => data.awakeningType.type === x.toLowerCase() || ("corrosionType" in data && data.corrosionType.type === x.toLowerCase()))) return false;
                    } else if (type === "keyword") {
                        if (fe[type].some(x => data.statuses?.includes(keywordMapping[x]))) return false;
                    } else if (type === "sinner") {
                        if (fe[type].some(x => x === data.sinnerId)) return false;
                    }
                }

                result.push(data);
            })
        }

        result = result.sort((a, b) => a.sinnerId === b.sinnerId ? b.id.localeCompare(a.id) : a.sinnerId - b.sinnerId);
        if(mode === "id") {
            result = [...(identityIds.map(x => identities[x])), ...result];
        } else {
            result = [...(egoIds.map(x => egos[x])), ...result];
        }

        if (mode === "id") {
            return result.map(data => {
                const included = identityIds.includes(data.id);
                return <div key={data.id} 
                    className={included ? "identity-select-item active" : "identity-select-item"} 
                    onClick={() => {
                        if(included) setIdentityIds(p => p.filter(x => data.id !== x))
                        else setIdentityIds(p => [...p, data.id])
                    }}
                >
                    <div className="identity-item-inner" data-tooltip-id="identity-tooltip" data-tooltip-content={data.id}>
                        <IdentityImg identity={data} uptie={4} displayName={true} displayRarity={true} />
                    </div>
                </div>
            })
        } else {
            return result.map(data => {
                const included = egoIds.includes(data.id);
                return <div key={data.id} 
                    className={included ? "ego-select-item active" : "ego-select-item"} 
                    onClick={() => {
                        if(included) setEgoIds(p => p.filter(x => data.id !== x))
                        else setEgoIds(p => [...p, data.id])
                    }}
                >
                    <div className="ego-item-inner" data-tooltip-id="ego-tooltip" data-tooltip-content={data.id}>
                        <EgoImg ego={data} type={"awaken"} displayName={true} displayRarity={true} />
                    </div>
                </div>
            })
        }
    }, [mode, identities, identitiesLoading, egos, egosLoading, identityIds, egoIds, setIdentityIds, setEgoIds, searchString, filters]);

    const toggleComponents = useMemo(() => {
        const toggleComponent = (category, filter) => {
            const selected = filters.includes(filter);
            const excluded = !selected && filters.includes(`-${filter}`);

            return <div key={filter} style={{
                backgroundColor: selected ? "#3f3f3f" : (excluded ? "rgba(239,68,68, 0.8)" : "transparent"), height: "32px", display: "flex",
                alignItems: "center", justifyContent: "center", padding: "0.1rem 0.2rem", cursor: "pointer",
                borderBottom: selected ? "2px #4caf50 solid" : (excluded ? "2px #dc2626 solid" : "transparent"),
                transition: "all 0.2s"
            }}
                onClick={() => handleToggle(filter, selected, excluded)}
            >
                {category === "sinner" ?
                    <SinnerIcon num={filter} style={{ height: "32px" }} /> :
                    <Icon path={filter} style={{ height: (category === "tier" && filter[0] !== "0") ? "24px" : "32px" }} />
                }
            </div>
        }

        const result = [];
        Object.entries(mode === "id" ? idsMainFilters : egosMainFilters)
            .forEach(([category, list]) => list.forEach(filter => result.push(toggleComponent(category, filter))))
        return result;
    }, [mode, filters]);

    return <Modal isOpen={isOpen} onClose={onClose}>
        <div style={{display: "flex", flexDirection: "column", gap: "0.5rem"}}>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center", paddingLeft: "1rem" }}>
                <div style={{ ...modeStyle, color: mode === "id" ? "#ddd" : "#777" }} onClick={() => setMode("id")}>Identities</div>
                <div style={{ ...modeStyle, color: mode === "ego" ? "#ddd" : "#777" }} onClick={() => setMode("ego")}>E.G.Os</div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.1rem", alignItems: "center" }}>
                <input type="text" placeholder="Search..." value={searchString} onChange={(e) => setSearchString(e.target.value)} />
                {toggleComponents}

                {<div style={{ display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} onClick={clearAll}>
                    Clear All
                </div>}
            </div>
            <div style={{ maxHeight: "400px", overflowY: "auto", justifyContent: "center" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))" }}>
                    {list}
                </div>
            </div>
        </div>
    </Modal>
}
