"use client";

import { EgoImg, Icon, IdentityImg, Status, useData } from "@eldritchtools/limbus-shared-library";
import { useMemo } from "react";
import { sinnerMapping } from "../utils";
import { keywordIconConvert, keywordToIdMapping } from "../keywordIds";
import { selectStyle } from "../styles";

import dynamic from "next/dynamic";
const Select = dynamic(() => import("react-select"), { ssr: false });

function normalizeString(str) {
    return str.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

function checkSearch(name, sinner, str) {
    const normStr = normalizeString(str);
    if (sinner && normalizeString(sinner).includes(normStr)) return true;
    return normalizeString(name).includes(normStr);
}

export function SelectorWithExclusion({ options, optionsMapped, selected, setSelected, placeholder, filterFunction, isMulti, styles, excludeMode }) {
    const value = useMemo(() => {
        if (isMulti) {
            return selected.map((id) => {
                const exclude = id[0] === '-';
                const val = { ...optionsMapped[exclude ? id.slice(1) : id] };
                if (exclude) val.exclude = true;
                return val;
            })
        } else {
            return selected ? optionsMapped[selected] : [selected];
        }
    }, [isMulti, selected, optionsMapped]);

    const onChangeFunction = items => {
        if (isMulti) {
            setSelected(items.map(item =>
                selected.find(x => (x[0] === '-' ? x.slice(1) : x) === item.value) ?? (excludeMode ? `-${item.value}` : item.value)
            ));
        } else {
            setSelected(items ? items.value : items);
        }
    }

    return <Select
        isMulti={isMulti}
        isClearable={true}
        options={options || Object.values(optionsMapped)}
        value={value}
        onChange={onChangeFunction}
        placeholder={placeholder}
        filterOption={filterFunction}
        styles={styles}
    />;
}

function IdentitySelector({ selected, setSelected, isMulti = false, styles = selectStyle, excludeMode }) {
    const [identities, loading] = useData("identities_mini");

    const optionsMapped = useMemo(() => loading ? {} : Object.entries(identities).reduce((acc, [id, identity]) => {
        acc[id] = {
            value: identity.id,
            label: <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", maxWidth: "65vw" }}>
                <IdentityImg id={identity.id} uptie={4} displayName={false} scale={0.125} />
                <span>[{sinnerMapping[identity.sinnerId]}] {identity.name}</span>
            </div>,
            name: identity.name,
            sinner: sinnerMapping[identity.sinnerId]
        };
        return acc;
    }, {}), [identities, loading]);

    return <SelectorWithExclusion
        optionsMapped={optionsMapped}
        selected={selected}
        setSelected={setSelected}
        placeholder={"Search Identities..."}
        filterFunction={(candidate, input) => checkSearch(candidate.data.name, candidate.data.sinner, input)}
        isMulti={isMulti}
        styles={styles}
        excludeMode={excludeMode}
    />;
}

function EgoSelector({ selected, setSelected, isMulti = false, styles = selectStyle, excludeMode }) {
    const [egos, loading] = useData("egos_mini");

    const optionsMapped = useMemo(() => loading ? [] : Object.entries(egos).reduce((acc, [id, ego]) => {
        acc[id] = {
            value: ego.id,
            label: <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", maxWidth: "65vw" }}>
                <EgoImg id={ego.id} type={"awaken"} displayName={false} scale={0.125} />
                <span>[{sinnerMapping[ego.sinnerId]}] {ego.name}</span>
            </div>,
            name: ego.name,
            sinner: sinnerMapping[ego.sinnerId]
        };
        return acc;
    }, {}), [egos, loading]);

    return <SelectorWithExclusion
        optionsMapped={optionsMapped}
        selected={selected}
        setSelected={setSelected}
        placeholder={"Search E.G.Os..."}
        filterFunction={(candidate, input) => checkSearch(candidate.data.name, candidate.data.sinner, input)}
        isMulti={isMulti}
        styles={styles}
        excludeMode={excludeMode}
    />;
}

function StatusSelector({ selected, setSelected, isMulti = false, styles = selectStyle, excludeMode }) {
    const [statuses, loading] = useData("statuses");

    const optionsMapped = useMemo(() => loading ? [] : Object.entries(statuses).reduce((acc, [id, status]) => {
        acc[id] = {
            value: id,
            label: <Status status={status} includeTooltip={true} />,
            name: status.name
        };
        return acc;
    }, {}), [statuses, loading]);

    const optionsSorted = useMemo(() => Object.values(optionsMapped).sort((a, b) => normalizeString(a.name).localeCompare(normalizeString(b.name))), [optionsMapped]);

    return <SelectorWithExclusion
        options={optionsSorted}
        optionsMapped={optionsMapped}
        selected={selected}
        setSelected={setSelected}
        placeholder={"Search Statuses..."}
        filterFunction={(candidate, input) => checkSearch(candidate.data.name, null, input)}
        isMulti={isMulti}
        styles={styles}
        excludeMode={excludeMode}
    />;
}

function KeywordSelector({ selected, setSelected, isMulti = false, styles = selectStyle }) {
    const optionsMapped = useMemo(() => Object.keys(keywordToIdMapping).reduce((acc, id) => {
        acc[id] = {
            value: id,
            label: <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <Icon path={keywordIconConvert(id)} style={{ height: "32px" }} />
                <span>{id}</span>
            </div>,
            name: id
        };
        return acc;
    }, {}), []);

    return <Select
        isMulti={isMulti}
        isClearable={true}
        options={Object.values(optionsMapped)}
        value={isMulti ? selected.map(id => optionsMapped[id]) : (selected ? optionsMapped[selected] : selected)}
        onChange={isMulti ? items => setSelected(items.map(x => x.value)) : item => setSelected(item ? item.value : item)}
        placeholder={"Search Keywords..."}
        filterOption={(candidate, input) => checkSearch(candidate.data.name, null, input)}
        styles={styles}
    />;
}

function GiftSelector({ selected, setSelected, isMulti = false, styles = selectStyle }) {
    const [gifts, loading] = useData("gifts");

    const optionsMapped = useMemo(() => loading ? [] : Object.entries(gifts).reduce((acc, [id, gift]) => {
        acc[id] = {
            value: id,
            label: gift.names[0],
            name: gift.names[0]
        };
        return acc;
    }, {}), [gifts, loading]);

    const optionsSorted = useMemo(() => Object.values(optionsMapped).sort((a, b) => normalizeString(a.name).localeCompare(normalizeString(b.name))), [optionsMapped]);

    return <Select
        isMulti={isMulti}
        isClearable={true}
        options={optionsSorted}
        value={isMulti ? selected.map(id => optionsMapped[id]) : (selected ? optionsMapped[selected] : selected)}
        onChange={isMulti ? items => setSelected(items.map(x => x.value)) : item => setSelected(item ? item.value : item)}
        placeholder={"Search Gifts..."}
        filterOption={(candidate, input) => checkSearch(candidate.data.name, null, input)}
        styles={styles}
    />;
}

function SinnerSelector({ selected, setSelected, isMulti = false, styles = selectStyle }) {
    const optionsMapped = useMemo(() => Object.entries(sinnerMapping).reduce((acc, [id, sinner]) => {
        acc[id] = {
            value: id,
            label: sinner,
            name: sinner
        };
        return acc;
    }, {}), []);

    return <Select
        isMulti={isMulti}
        isClearable={true}
        options={Object.values(optionsMapped)}
        value={isMulti ? selected.map(id => optionsMapped[id]) : (selected ? optionsMapped[selected] : selected)}
        onChange={isMulti ? items => setSelected(items.map(x => x.value)) : item => setSelected(item ? item.value : item)}
        placeholder={"Search Sinner..."}
        filterOption={(candidate, input) => checkSearch(candidate.data.name, null, input)}
        styles={styles}
    />;
}

export { IdentitySelector, EgoSelector, StatusSelector, KeywordSelector, GiftSelector, SinnerSelector };