import { useState, useRef, useEffect } from "react";
import * as Select from "@radix-ui/react-select";
import "./floorSelector.css";
import { Gift, ThemePackImg, useData } from "@eldritchtools/limbus-shared-library";
import { useBreakpoint, useProfiles } from "@eldritchtools/shared-components";
import { createPortal } from "react-dom";

function FloorSelector({ value, setValue, options, isSmall }) {
    const [isOpen, setIsOpen] = useState(false);

    const triggerRef = useRef(null);

    const handleUpdateValue = (updatedValue) => {
        setValue(updatedValue);
    }

    const sizeStyle = isSmall ? { width: "125px", height: "240px" } : { width: "200px", height: "350px" };

    return (
        <Select.Root value={value} onValueChange={handleUpdateValue} open={isOpen} onOpenChange={setIsOpen}>
            <Select.Trigger className="floor-select-trigger" ref={triggerRef} style={sizeStyle}>
                {value ? <ThemePackImg id={value} displayName={true} scale={isSmall ? .3 : 0.45} /> : null}
            </Select.Trigger>

            <Select.Content className="floor-select-content" position="popper">
                <Select.Viewport>
                    <div className="floor-select-grid">
                        {options.map((option) =>
                            <Select.Item key={option} value={option} className="floor-select-item">
                                <div className="floor-item-inner">
                                    <ThemePackImg id={option} displayName={true} scale={isSmall ? .15 : 0.25} />
                                </div>
                            </Select.Item>
                        )}
                        {value ? <Select.Item key={"cancel"} value={null} className="floor-select-item">
                            <div className="floor-item-inner" style={{
                                height: "100%", justifyContent: "center",
                                color: "#ff4848", fontSize: "3rem", fontWeight: "bold"
                            }}>
                                ✕
                            </div>
                        </Select.Item> : null}
                    </div>
                    {options.length > 10 ? <div className="floor-select-fade-bottom" > ▼ </div> : null}
                </Select.Viewport>
            </Select.Content>
        </Select.Root>
    );
}

function FloorSelection({ mode, difficulty, selectedFloors, setSelectedFloors, selectedGifts, setSelectedGifts }) {
    const [themePacks, themePacksLoading] = useData("md_theme_packs");
    const [floorPacks, floorPacksLoading] = useData("md_floor_packs");
    const [selectOpen, setSelectOpen] = useState(false);
    const [selectIndex, setSelectIndex] = useState(null);
    const [selectMode, setSelectMode] = useState(null);
    const { isDesktop } = useBreakpoint();

    if (themePacksLoading || floorPacksLoading) return null;

    const setSelectedFloor = (value, index) => {
        setSelectedFloors(selectedFloors.map((f, i) => i === index ? value : f));
        setSelectedGifts(selectedGifts.map((g, i) => i === index ? [] : g));
    }

    const getOptions = floor => {
        let options = [];
        if (floor <= 5) {
            if (difficulty === "N") options = floorPacks.normal[floor];
            else options = floorPacks.hard[floor];
        } else if (floor <= 10) {
            options = floorPacks.hard["6-10"];
        } else {
            options = floorPacks.hard["11-15"];
        }
        return options.filter(pack => !selectedFloors.includes(pack));
    }
    const selectors = [];

    const constructSelector = i =>
        <FloorSelector
            value={selectedFloors[i]}
            setValue={v => setSelectedFloor(v, i)}
            options={getOptions(i + 1)}
            isSmall={!isDesktop}
        />;

    const floors = difficulty === "E" ? 15 : (difficulty === "I" ? 10 : 5);
    for (let i = 0; i < floors; i++) selectors.push(constructSelector(i));
    const size = isDesktop ? "400px" : "330px";

    const constructGiftsComponent = (exclusive_gifts, index) => mode === "view" ?
        <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
            {exclusive_gifts.map(giftId =>
                <Gift key={giftId} id={giftId} includeTooltip={true} scale={isDesktop ? .66 : .5} />
            )}
        </div> :
        <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
            <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
                {selectedGifts[index].map(giftId =>
                    <Gift key={giftId} id={giftId} includeTooltip={true} scale={isDesktop ? .66 : .5} />
                )}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                <button onClick={() => { setSelectOpen(true); setSelectIndex(index); setSelectMode("add") }}>Add</button>
                <button
                    onClick={() => { setSelectOpen(true); setSelectIndex(index); setSelectMode("rem") }}
                    disabled={selectedGifts[index].length === 0}
                >
                    Remove
                </button>
            </div>
        </div>

    const addGift = (giftId, index) => {
        setSelectedGifts(p => p.map((v, i) => i === index ? [...v, giftId] : v));
    }

    const removeGift = (giftId, index) => {
        setSelectedGifts(p => p.map((v, i) => i === index ? v.filter(id => id !== giftId) : v))
    }

    return <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${size}, 1fr))`, width: "100%", gap: "0.5rem" }}>
        {selectors.map((selector, index) => <div key={index} style={{ display: "grid", gridTemplateColumns: "1fr auto", width: size }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
                <span>Floor {index + 1}</span>
                {
                    selectedFloors[index] && "exclusive_gifts" in themePacks[selectedFloors[index]] ?
                        constructGiftsComponent(themePacks[selectedFloors[index]].exclusive_gifts, index) :
                        null
                }
            </div>
            {selector}
        </div>)}

        <Modal isOpen={selectOpen} onClose={() => { setSelectOpen(false); setSelectIndex(null); setSelectMode(null); }}>
            {selectOpen ? (
                selectMode === "add" ?
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <span>Add Gifts</span>
                        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", maxWidth: isDesktop ? "450px" : "300px", maxHeight: "80%", overflowY: "auto" }}>
                            {themePacks[selectedFloors[selectIndex]].exclusive_gifts
                                .filter(giftId => !selectedGifts[selectIndex].includes(giftId))
                                .map(giftId =>
                                    <div onClick={() => addGift(giftId, selectIndex)}>
                                        <Gift key={giftId} id={giftId} includeTooltip={true} scale={isDesktop ? .75 : .5} expandable={false} />
                                    </div>)
                            }
                        </div>
                        <button onClick={() => { setSelectOpen(false); setSelectIndex(null); setSelectMode(null); }}>Close</button>
                    </div> :
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <span>Remove Gifts</span>
                        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", maxWidth: isDesktop ? "450px" : "300px", maxHeight: "80%", overflowY: "auto" }}>
                            {selectedGifts[selectIndex].map(giftId =>
                                <div onClick={() => removeGift(giftId, selectIndex)}>
                                    <Gift key={giftId} id={giftId} includeTooltip={true} scale={isDesktop ? .75 : .5} expandable={false} />
                                </div>)
                            }
                        </div>
                        <button onClick={() => { setSelectOpen(false); setSelectIndex(null); setSelectMode(null); }}>Close</button>
                    </div>
            ) : null}
        </Modal>
    </div>
}

function FloorPlannerTab() {
    const [selectedFloors, setSelectedFloors] = useState(new Array(15).fill(null));
    const [selectedGifts, setSelectedGifts] = useState(new Array(15).fill([]));
    const { profileData, setProfileData } = useProfiles();
    const [selectedPlan, setSelectedPlan] = useState("");
    const [mode, setMode] = useState(localStorage.getItem("floorPlannerMode") ?? "view");
    const [difficulty, setDifficulty] = useState("E");

    const [planName, setPlanName] = useState("");
    const [saveIsOpen, setSaveIsOpen] = useState(false);
    const [deleteIsOpen, setDeleteIsOpen] = useState(false);

    useEffect(() => {
        if (mode !== null) localStorage.setItem("floorPlannerMode", mode);
    }, [mode]);

    const handleSetDifficulty = v => {
        if (difficulty === "N" || v === "N") setSelectedFloors(new Array(15).fill(null));
        setDifficulty(v);
    }

    const clear = () => {
        setSelectedFloors(new Array(15).fill(null));
        setSelectedGifts(new Array(15).fill([]));
    }

    const savePlan = () => {
        if (planName.trim().length === 0) return;
        const plans = profileData.plans ?? {};
        setProfileData({ ...profileData, plans: { ...plans, [planName]: { floors: selectedFloors, gifts: selectedGifts } } });
        setSelectedPlan(planName);
        setSaveIsOpen(false);
    }

    const openSavePlan = () => {
        setPlanName("");
        setSaveIsOpen(true);
    }

    const loadPlan = () => {
        if (selectedPlan in (profileData.plans ?? {})) {
            const plan = profileData.plans[selectedPlan];
            setSelectedFloors(plan.floors);
            setSelectedGifts(plan.gifts);
        }
    }

    const deletePlan = () => {
        const { [selectedPlan]: _, ...rest } = profileData.plans;
        setProfileData({ ...profileData, plans: rest })
        setSelectedPlan("");
        setDeleteIsOpen(false);
    }

    const openDeletePlan = () => {
        if (selectedPlan in (profileData.plans ?? {})) {
            setDeleteIsOpen(true);
        }
    }

    return <div style={{ display: "flex", flexDirection: "column", gap: "5px", alignItems: "center", width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
            Floor Plans:
            <select name="plan" id="plan" value={selectedPlan} onChange={e => setSelectedPlan(e.target.value)} style={{ minWidth: "10rem" }}>
                <option value="" />
                {Object.keys((profileData.plans ?? {})).map(k => <option value={k}>{k}</option>)}
            </select>
            <button onClick={openSavePlan}>Save</button>
            <button onClick={loadPlan}>Load</button>
            <button onClick={openDeletePlan}>Delete</button>
        </div>
        <div style={{ display: "flex", flexDirection: "row", gap: "0.5rem", alignItems: "center" }}>
            <label>
                <span data-tooltip-id="genericTooltip" data-tooltip-content="Changing to or from Normal will reset all selected theme packs."
                    style={{ marginRight: "0.2rem", borderBottom: "1px #aaa dotted" }}>
                    Select Difficulty:
                </span>
                <select name="difficulty" id="difficulty" value={difficulty} onChange={e => handleSetDifficulty(e.target.value)}>
                    <option value="N">Normal</option>
                    <option value="H">Hard</option>
                    <option value="I">Infinity</option>
                    <option value="E">Extreme</option>
                </select>
            </label>
            <label>
                <span style={{ marginRight: "0.2rem" }}>Mode:</span>
                <select name="mode" id="mode" value={mode} onChange={e => setMode(e.target.value)}>
                    <option value="view">View Gifts</option>
                    <option value="plan">Plan Gifts</option>
                </select>
            </label>
            <button onClick={clear}>Clear</button>
        </div>
        <FloorSelection
            mode={mode}
            difficulty={difficulty}
            selectedFloors={selectedFloors}
            setSelectedFloors={setSelectedFloors}
            selectedGifts={selectedGifts}
            setSelectedGifts={setSelectedGifts}
        />
        <Modal isOpen={saveIsOpen} onClose={() => setSaveIsOpen(false)}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem", alignItems: "center" }}>
                <input value={planName} onChange={e => setPlanName(e.target.value)} placeholder="Input name..." />
                <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button onClick={savePlan}>Save</button>
                    <button onClick={() => setSaveIsOpen(false)}>Cancel</button>
                </div>
            </div>
        </Modal>
        <Modal isOpen={deleteIsOpen} onClose={() => setDeleteIsOpen(false)}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem", alignItems: "center" }}>
                <div>Delete {selectedPlan}?</div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button onClick={deletePlan}>Delete</button>
                    <button onClick={() => setDeleteIsOpen(false)}>Cancel</button>
                </div>
            </div>
        </Modal>
    </div>;
}

export default FloorPlannerTab;

const overlayStyle = {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100vw",
    height: "100vh",
    background: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: "1000"
};

const contentStyle = {
    background: "black",
    padding: "1rem",
    borderRadius: "0.5rem",
    border: "1px #aaa solid",
    boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
};

const closeStyle = {
    position: "absolute",
    top: "0.5rem",
    right: "0.5rem",
    background: "transparent",
    border: "none",
    fontSize: "1.25rem",
    cursor: "pointer"
}

function Modal({ children, isOpen, onClose }) {
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div style={overlayStyle} onClick={onClose}>
            <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
                <button style={closeStyle} onClick={onClose}>
                    ✕
                </button>
                {children}
            </div>
        </div>, document.body);
}
