import { useState, useRef } from "react";
import * as Select from "@radix-ui/react-select";
import "./floorSelector.css";
import { floorPacks, Gift, ThemePackImg, themePacks } from "@eldritchtools/limbus-shared-library";

function FloorSelector({ value, setValue, options }) {
    const [isOpen, setIsOpen] = useState(false);

    const triggerRef = useRef(null);

    const handleUpdateValue = (updatedValue) => {
        setValue(updatedValue);
    }

    return (
        <Select.Root value={value} onValueChange={handleUpdateValue} open={isOpen} onOpenChange={setIsOpen}>
            <Select.Trigger className="floor-select-trigger" ref={triggerRef}>
                <ThemePackImg id={value} displayName={true} scale={0.45} />
            </Select.Trigger>

            <Select.Content className="floor-select-content" position="popper">
                <Select.Viewport>
                    <div className="floor-select-grid">
                        {options.map((option) =>
                            <Select.Item key={option} value={option} className="floor-select-item">
                                <div className="floor-item-inner">
                                    <ThemePackImg id={option} displayName={true} scale={0.25} />
                                </div>
                            </Select.Item>
                        )}
                        {value ? <Select.Item key={"cancel"} value={null} className="floor-select-item">
                                <div className="floor-item-inner" style={{height: "100%", justifyContent: "center", color: "#ff4848", fontSize: "3rem", fontWeight: "bold"}}>
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

function FloorSelection({ difficulty, selectedFloors, setSelectedFloors }) {
    const setSelectedFloor = (value, index) => {
        setSelectedFloors(selectedFloors.map((f, i) => i === index ? value : f));
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

    for (let i = 0; i < 5; i++) selectors.push(<FloorSelector value={selectedFloors[i]} setValue={v => setSelectedFloor(v, i)} options={getOptions(i + 1)} />);
    if (difficulty === "I" || difficulty === "E")
        for (let i = 5; i < 10; i++) selectors.push(<FloorSelector value={selectedFloors[i]} setValue={v => setSelectedFloor(v, i)} options={getOptions(i + 1)} />);
    if (difficulty === "E")
        for (let i = 10; i < 15; i++) selectors.push(<FloorSelector value={selectedFloors[i]} setValue={v => setSelectedFloor(v, i)} options={getOptions(i + 1)} />);

    return <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)" }}>
        {selectors.map((selector, index) => <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", width: "400px" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
                <span>Floor {index+1}</span>
                {
                    selectedFloors[index] && "exclusive_gifts" in themePacks[selectedFloors[index]] ? 
                    <div style={{display: "flex", flexDirection: "row", flexWrap: "wrap"}}>
                        {themePacks[selectedFloors[index]].exclusive_gifts.map(giftId => <Gift id={giftId} includeTooltip={true} scale={0.66}/>)}
                    </div> :
                    null
                }
            </div>
            {selector}
        </div>)}
    </div>
}

function FloorPlannerTab() {
    const [selectedFloors, setSelectedFloors] = useState(new Array(15).fill(null));
    const [difficulty, setDifficulty] = useState("E");

    const handleSetDifficulty = v => {
        if (difficulty === "N" || v === "N") setSelectedFloors(new Array(15).fill(null));
        setDifficulty(v);
    }

    return <div style={{ display: "flex", flexDirection: "column", maxHeight: "100%", gap: "5px", alignItems: "center" }}>
        <div style={{ display: "flex", flexDirection: "row", gap: "0.5rem", alignItems: "center" }}>
            <div data-tooltip-id="genericTooltip" data-tooltip-content="Changing to or from Normal will reset all selected theme packs." style={{borderBottom: "1px #aaa dotted"}}>Select Difficulty:</div>
            <select name="difficulty" id="difficulty" value={difficulty} onChange={e => handleSetDifficulty(e.target.value)}>
                <option value="N">Normal</option>
                <option value="H">Hard</option>
                <option value="I">Infinity</option>
                <option value="E">Extreme</option>
            </select>
        </div>
        <FloorSelection difficulty={difficulty} selectedFloors={selectedFloors} setSelectedFloors={setSelectedFloors} />
    </div>;
}

export default FloorPlannerTab;
