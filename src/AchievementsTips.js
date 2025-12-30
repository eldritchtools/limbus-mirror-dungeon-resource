import { EgoImg, getFloorsPerPack, Gift, KeywordIcon, SinnerIcon, useData } from "@eldritchtools/limbus-shared-library";
import { SampleImg } from "./ImageHandler";
import ThemePackNameWithTooltip from "./ThemePackNameWithTooltip";
import { ThemePackImg, IdentityImg } from "@eldritchtools/limbus-shared-library";

function TextTip({ tip }) {
    return <span style={{ whiteSpace: "pre-line" }}>{tip.text}</span>;
}

function TableTip({ tip }) {
    const [giftsData, giftsLoading] = useData("gifts");

    const getCellComponent = (cell) => {
        if (typeof cell === "string") return <div style={{ whiteSpace: "pre-line", padding: "0.1rem", textAlign: "center" }}>{cell}</div>;
        if (typeof cell === "object" && cell !== null && !Array.isArray(cell)) {
            if ("gifts" in cell && !giftsLoading) {
                const gifts = Object.values(giftsData).filter(gift => cell.gifts.includes(gift.names[0]))
                return <div style={{ display: "flex", flexDirection: "row", padding: "0.1rem", justifyContent: "center" }}>
                    {gifts.map(gift => <Gift gift={gift} />)}
                </div>
            }
        }
        return null;
    }

    return <div style={{ display: "flex", justifyContent: "center" }}>
        <table style={{ width: "fit-content", borderCollapse: "collapse" }}>
            <thead>
                <tr>
                    {tip.headers.map(header => <th style={{ border: "1px #666 dotted" }}>{header}</th>)}
                </tr>
            </thead>
            <tbody>
                {tip.cells.map(row => <tr>
                    {row.map(cell => <td style={{ border: "1px #666 dotted" }}>
                        {getCellComponent(cell)}
                    </td>)}
                </tr>)}
            </tbody>
        </table>
    </div>;
}

function ShowGiftsTip({ tip }) {
    const [giftsData, giftsLoading] = useData("gifts");
    const floorsPerPack = getFloorsPerPack()

    const [normal, hard] = Object.entries(giftsLoading ? {} : giftsData).reduce((acc, [_id, gift]) => {
        if (gift.vestige) return acc;
        if ("keyword" in tip && gift.keyword !== tip.keyword) return acc;
        if ("tier" in tip) {
            if (Array.isArray(tip.tier)) {
                if (!tip.tier.includes(gift.tier)) return acc;
            } else {
                if (tip.tier !== gift.tier) return acc;
            }
        }
        if ("fusion" in tip) {
            if (tip.fusion !== "any" && gift.fusion !== tip.fusion) return acc;
        } else {
            if (gift.fusion) return acc;
        }
        if ("themePack" in tip && tip.themePack && !("exclusiveTo" in gift)) return acc;
        if ("enhanceable" in tip && tip.enhanceable !== gift.enhanceable) return acc;

        if ("exclusiveTo" in gift) {
            gift.exclusiveTo.forEach(source => {
                if (source in floorsPerPack.normal) floorsPerPack.normal[source].forEach(floor => {
                    if (!(floor in acc[0].exclusive)) acc[0].exclusive[floor] = {};
                    if (!(source in acc[0].exclusive[floor])) acc[0].exclusive[floor][source] = [];
                    acc[0].exclusive[floor][source].push(gift);
                })

                if (source in floorsPerPack.hard) floorsPerPack.hard[source].forEach(floor => {
                    if (!(floor in acc[1].exclusive)) acc[1].exclusive[floor] = {};
                    if (!(source in acc[1].exclusive[floor])) acc[1].exclusive[floor][source] = [];
                    acc[1].exclusive[floor][source].push(gift);
                })
            });
        } else {
            if (gift.hardonly) acc[1].general.push(gift);
            else acc[0].general.push(gift)
        }

        return acc;
    }, [{ general: [], exclusive: {} }, { general: [], exclusive: {} }])

    const giftsStyle = { display: "flex", flexDirection: "row", height: "fit-content", flexWrap: "wrap", padding: "0.5rem" };
    const centerStyle = { display: "flex", alignItems: "center", justifyContent: "center", border: "1px #666 dotted" };

    const gridComponents = [];
    // Headers
    if (tip.keyword) gridComponents.push(<div style={{ ...centerStyle, gap: "0.5rem" }}><KeywordIcon id={tip.keyword} /> {tip.keyword} Gifts</div>);
    else gridComponents.push(<div style={centerStyle}>Gifts</div>);
    gridComponents.push(<div style={{ ...centerStyle, color: "#4ade80" }}>Normal</div>);
    gridComponents.push(<div style={{ ...centerStyle, color: "#f87171" }}>Hard</div>);

    // General
    if (normal.general.length + hard.general.length > 0) {
        gridComponents.push(<div style={centerStyle}>General</div>);
        gridComponents.push(<div style={{ border: "1px #666 dotted" }}><div style={giftsStyle}>{normal.general.map(gift => <Gift gift={gift} />)}</div></div>);
        gridComponents.push(<div style={{ border: "1px #666 dotted" }}><div style={giftsStyle}>{hard.general.map(gift => <Gift gift={gift} />)}</div></div>);
    }

    function constructPackGiftsComponent(packGiftMapping) {
        return <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", alignItems: "center", alignContent: "flex-start", padding: "0.25rem", border: "1px #666 dotted", gap: "0.5rem" }}>
            {Object.entries(packGiftMapping).map(([pack, gifts]) => <div style={{ display: "flex", flexDirection: "column", textAlign: "center", border: "1px #777 dotted", borderRadius: "1rem", padding: "0.2rem" }}>
                <div><ThemePackNameWithTooltip id={pack} /></div>
                <div style={{ ...giftsStyle, justifyContent: "center" }}>{gifts.map(gift => <Gift gift={gift} />)}</div>
            </div>)
            }
        </div>
    }

    function insertFloorRow(floor, normal, hard) {
        gridComponents.push(<div style={centerStyle}>Floor {floor}</div>);
        if (normal) gridComponents.push(constructPackGiftsComponent(normal));
        else gridComponents.push(<div />);
        if (hard) gridComponents.push(constructPackGiftsComponent(hard));
        else gridComponents.push(<div />);
    }

    // Floors 1-5
    ["1", "2", "3", "4", "5"].forEach(floor => {
        if (!(floor in normal.exclusive) && !(floor in hard.exclusive)) return;
        insertFloorRow(floor, floor in normal.exclusive ? normal.exclusive[floor] : null, floor in hard.exclusive ? hard.exclusive[floor] : null);
    })

    // Floor 6-10
    if ("6-10" in hard.exclusive) {
        insertFloorRow("6-10", null, "6-10" in hard.exclusive ? hard.exclusive["6-10"] : null);
    }

    return <div style={{ display: "grid", width: "100%", gridTemplateColumns: "1fr 5fr 5fr", border: "1px #666 dotted" }}>
        {gridComponents}
    </div>
}

function ShowGiftListTip({ tip }) {
    const [giftsData, giftsLoading] = useData("gifts");

    const gifts = Object.values(giftsLoading ? {} : giftsData).filter(gift => tip.gifts.includes(gift.name))

    return <div style={{ display: "flex", flexDirection: "row", width: "100%", height: "fit-content", justifyContent: "center", flexWrap: "wrap" }}>
        {gifts.map(gift => <Gift gift={gift} />)}
    </div>
}

function ShowThemePacksTip({ tip }) {
    const [themePacksData, themePacksLoading] = useData("md_theme_packs");

    const themePacks = [];
    if (!themePacksLoading) {
        if (tip.tag) themePacks.push(...Object.values(themePacksData).filter((themePack) => themePack.tags.includes(tip.tag)));
        if (tip.themePacks) themePacks.push(...tip.themePacks.map(id => themePacksData[id]));
    }

    return <div style={{ width: "100%", display: "flex", flexDirection: "row", justifyContent: "center", overflowX: "auto" }}>
        {themePacks.map(pack => <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
            <ThemePackImg themePack={pack} displayName={true} scale={.5} />
        </div>)}
    </div>
}

function ShowThemePacksByFloorTip({ tip }) {
    const [themePacksData, themePacksLoading] = useData("md_theme_packs");
    const { hard } = getFloorsPerPack();

    const themePacks = Object.entries(themePacksLoading ? {} : themePacksData).filter(([id, themePack]) => themePack.tags.includes(tip.tag));
    const packsByFloor = themePacks.reduce((acc, [id, pack]) => {
        if (id in hard) {
            hard[id].forEach(floor => {
                if (floor in acc) acc[floor].push(id);
                else acc[floor] = [id];
            })
        } else {
            if ("any" in acc) acc["any"].push(id);
            else acc["any"] = [id];
        }
        return acc;
    }, {});

    const centerStyle = { display: "flex", alignItems: "center", justifyContent: "center", border: "1px #666 dotted" };

    const components = [];
    ["any", "1", "2", "3", "4", "5", "6-10"].forEach(floor => {
        if (!(floor in packsByFloor)) return;
        if (floor === "any") components.push(<div style={centerStyle}>Any floor</div>);
        else components.push(<div style={centerStyle}>Floor {floor}</div>);

        components.push(<div style={{ ...centerStyle, display: "flex", flexDirection: "column", padding: "0.2rem" }}>
            {packsByFloor[floor].map(id => {
                if ("highlight" in tip && floor in tip.highlight && tip.highlight[floor].includes(id))
                    return <ThemePackNameWithTooltip id={id} style={{ fontWeight: "bold", color: "#4ade80" }} />
                else
                    return <ThemePackNameWithTooltip id={id} />
            })}
        </div>)
    })

    return <div style={{ ...centerStyle, border: "transparent" }}>
        <div style={{ display: "grid", textAlign: "center", width: "fit-content", gridTemplateColumns: "1fr 1fr" }} >
            {components}
        </div>
    </div>
}

function filterIdentities(tip, identitiesData) {
    return Object.values(identitiesData).filter(identity => {
        let filter = true;
        if ("keyword" in tip) {
            if (Array.isArray(tip.keyword)) filter &= tip.keyword.some(keyword => identity.skillKeywordList?.includes(keyword));
            else filter &= identity.skillKeywordList?.includes(tip.keyword);
        }
        if (!filter) return false;

        if ("faction" in tip) {
            if (Array.isArray(tip.faction)) filter &= tip.faction.some(faction => identity.tags.includes(faction));
            else filter &= identity.tags.includes(tip.faction);
        }
        if (!filter) return false

        if ("ids" in tip) {
            filter &= tip.ids.includes(identity.id);
        }
        return filter;
    })
}

function ShowIdentities({ tip }) {
    const [identitiesData, identitiesLoading] = useData("identities");
    const identities = identitiesLoading ? [] : filterIdentities(tip, identitiesData);

    return <div style={{ width: "100%", display: "flex", flexDirection: "row", justifyContent: "center", overflowX: "auto", overflowY: "hidden" }}>
        {identities.map(identity => <div style={{ border: "1px #666 dotted" }}>
            <IdentityImg identity={identity} uptie={4} displayName={true} displayRarity={true} scale={.5} />
        </div>)}
    </div>
}

function ShowIdentitiesBySinner({ tip }) {
    const [identitiesData, identitiesLoading] = useData("identities");
    const identities = identitiesLoading ? [] : filterIdentities(tip, identitiesData);

    const start = {};
    if (tip.showAllSinners) {
        for (let i=1; i<=12; i++) start[i] = [];
    }

    const idsBySinner = identities.reduce((acc, identity) => {
        if (identity.sinnerId in acc) acc[identity.sinnerId].push(identity);
        else acc[identity.sinnerId] = [identity];
        return acc;
    }, start);

    const components = Object.entries(idsBySinner).sort((a, b) => a[0] - b[0]).map(([sinnerId, list]) =>
        <div key={sinnerId} style={{ display: "flex", flexDirection: "row", alignItems: "center", width: "480px", border: "1px #777 dotted" }}>
            <SinnerIcon num={sinnerId} style={{ width: "64px" }} />
            <div style={{ display: "flex", flexDirection: "row", overflowX: "auto", overflowY: "hidden", height: "138px" }}>
                {list.reverse().map(identity => <div key={identity.id} style={{ width: "128px", height: "128px" }}>
                    <IdentityImg identity={identity} uptie={4} displayName={true} displayRarity={true} scale={.5} />
                </div>)}
            </div>
        </div>
    );

    return <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, 480px)", justifyContent: "center", width: "100%" }}>
        {components}
    </div>
}

function RefreshCostSummary() {
    const arr = Array.from({ length: 10 }, (_, i) => i + 1);
    const style = { textAlign: "center", padding: "0.5rem", border: "1px #666 dotted" }
    let sum = 0;
    return <div style={{ display: "flex", justifyContent: "center" }}>
        <table style={{ width: "fit-content", borderCollapse: "collapse" }}>
            <thead>
                <tr>
                    <th style={style}>Refreshes</th>
                    {arr.map(number => <th style={style}>{number}</th>)}
                    <th style={style}>n</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <th style={style}>Cost per refresh</th>
                    {arr.map(number => <td style={style}>{15 * number}</td>)}
                    <td style={style}>15n</td>
                </tr>
                <tr>
                    <th style={style}>Total Cost</th>
                    {arr.map(number => <td style={style}>{15 * ((number * (number + 1)) / 2)}</td>)}
                    <td style={style}>15(n(n+1)/2)</td>
                </tr>
                <tr>
                    <th style={style}><div style={{ display: "flex", justifyContent: "center" }}><Gift id={9188} /></div></th>
                    {arr.map(number => {
                        sum += Math.floor(10.5 * number);
                        return <td style={style}>{Math.floor(10.5 * number)}<br /><br />{sum}</td>
                    })}
                    <td style={style}>floor(10.5n)<br /><br />sum(floor(10.5x) for x = 1, 2, ..., n)</td>
                </tr>
            </tbody>
        </table>
    </div>
}

function EnhanceCostSummary() {
    const giftTierStyle = { fontFamily: "'Archivo Narrow', sans-serif", fontWeight: "bold", fontSize: "24px", color: "#ffd84d" }
    const style = { textAlign: "center", padding: "0.5rem", border: "1px #666 dotted" }
    return <div style={{ display: "flex", justifyContent: "center" }}>
        <table style={{ width: "fit-content", borderCollapse: "collapse" }}>
            <thead>
                <tr>
                    <th style={style}>Tier</th>
                    <th style={style}><span style={giftTierStyle}>I</span></th>
                    <th style={style}><span style={giftTierStyle}>II</span></th>
                    <th style={style}><span style={giftTierStyle}>III</span></th>
                    <th style={style}><span style={giftTierStyle}>IV</span></th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <th style={style}><span style={giftTierStyle}>+</span></th>
                    <td style={style}>50</td>
                    <td style={style}>60</td>
                    <td style={style}>75</td>
                    <td style={style}>100</td>
                </tr>
                <tr>
                    <th style={style}><div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}><Gift id={9189} /><span style={giftTierStyle}>+</span></div></th>
                    <td style={style}>35</td>
                    <td style={style}>42</td>
                    <td style={style}>53</td>
                    <td style={style}>70</td>
                </tr>
                <tr>
                    <th style={style}><span style={giftTierStyle}>++</span></th>
                    <td style={style}>100</td>
                    <td style={style}>120</td>
                    <td style={style}>150</td>
                    <td style={style}>200</td>
                </tr>
                <tr>
                    <th style={style}><div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}><Gift id={9189} /><span style={giftTierStyle}>++</span></div></th>
                    <td style={style}>70</td>
                    <td style={style}>84</td>
                    <td style={style}>105</td>
                    <td style={style}>140</td>
                </tr>
            </tbody>
        </table>
    </div>
}

function ShowEGOsTip({ tip }) {
    return <div style={{ width: "100%", display: "flex", flexDirection: "row", justifyContent: "center", overflowX: "auto" }}>
        {tip.EGOs.map(EGOId => <div style={{ border: "1px #666 dotted" }}>
            <EgoImg id={EGOId} scale={0.5} displayName={true} type={"awaken"} />
        </div>)}
    </div>
}

function ShowSampleTip({ tip }) {
    return <div style={{ width: "100%", display: "flex", flexDirection: "row", justifyContent: "center", overflowX: "auto" }}>
        <SampleImg img={tip.img} width={tip.width} height={tip.height} />
    </div >
}

function AchievementTips({ achievement }) {
    if (!("tips" in achievement)) return <div>Coming soon...</div>;

    const components = [];
    achievement.tips.forEach(tip => {
        switch (tip.type) {
            case "text": components.push(<TextTip tip={tip} />); break;
            case "table": components.push(<TableTip tip={tip} />); break;
            case "showGifts": components.push(<ShowGiftsTip tip={tip} />); break;
            case "showGiftList": components.push(<ShowGiftListTip tip={tip} />); break;
            case "showThemePacks": components.push(<ShowThemePacksTip tip={tip} />); break;
            case "showThemePacksByFloor": components.push(<ShowThemePacksByFloorTip tip={tip} />); break;
            case "showIds": components.push(<ShowIdentities tip={tip} />); break;
            case "showIdsbySinner": components.push(<ShowIdentitiesBySinner tip={tip} />); break;
            case "refreshCostSummary": components.push(<RefreshCostSummary />); break;
            case "enhanceCostSummary": components.push(<EnhanceCostSummary />); break;
            case "showEGOs": components.push(<ShowEGOsTip tip={tip} />); break;
            case "showSample": components.push(<ShowSampleTip tip={tip} />); break;
            default: break;
        }
    });

    return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {components}
    </div>
}

export default AchievementTips;