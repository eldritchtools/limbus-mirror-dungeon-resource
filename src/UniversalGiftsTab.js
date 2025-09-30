import { Gift, KeywordIcon } from "@eldritchtools/limbus-shared-library";
import universalGifts from "./data/universalGifts.json";

function GiftRow({ list=null, dict=null }) {
    return <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", width: "100%", justifyContent: "center" }}>
        {list ? 
            list.map(giftId => <Gift id={giftId} includeTooltip={true} />) : 
            dict.map(([giftId, notes]) => <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                <Gift id={giftId} includeTooltip={true} />
                <span style={{whiteSpace: "pre-wrap"}}>{notes}</span>
                </div>)}
    </div>
}

function Container({ category }) {
    return <div style={{ display: "flex", flexDirection: "column", border: "1px #aaa dotted", borderRadius: "0.5rem", padding: "0.5rem", width: "100%", boxSizing: "border-box" }}>
        <div style={{ fontSize: "1.25rem", fontWeight: "bold" }}>{category.title}</div>
        {
            "gifts" in category ?
                <GiftRow list={category.gifts} /> :
                category.sections.map(section => <div style={{ display: "flex", flexDirection: "column" }}>
                    <div>{section.title}</div>
                    <GiftRow list={section.gifts} />
                </div>)
        }
    </div>
}

function ComboContainer({ data }) {
    return <div style={{ display: "flex", flexDirection: "column", border: "1px #aaa dotted", borderRadius: "0.5rem", padding: "0.5rem", width: "100%", boxSizing: "border-box" }}>
        <div style={{ fontSize: "1.25rem", fontWeight: "bold", display: "flex", flexDirection: "row", alignItems: "center" }}><KeywordIcon id={data.title} />{data.title}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)" }}>
            {data.sections.map((section, index) =>
                <div style={{ display: "flex", flexDirection: "column", borderRight: index === 0 ? "1px #aaa dotted" : null, padding: "0.5rem" }}>
                    <div style={{ fontSize: "1rem", fontWeight: "bold" }}>{section.title}</div>
                    {<GiftRow dict={section.gifts} />}
                </div>
            )}

        </div>
    </div>
}

function UniversalGiftsTab() {
    return <div style={{ display: "flex", flexDirection: "column", maxHeight: "100%", gap: "5px", alignItems: "center", overflowY: "auto", width: "100%" }}>
        These are gifts or gift combos that have benefits for all or most team compositions. The combos especially are useful when running MD Extreme or for challenge runs. They can still be useful but are not necessary for MD Infinity.
        <br />
        These are not exhaustive lists. They only include some of the most relevant examples. Gifts that fall under multiple categories may be included in only one of them. This also does not include gifts from hidden bosses and EX gifts since they cannot be obtained by normal means.
        <br />
        I have tried to order them by relevance for each category, but this varies between team compositions and different situations, so take the ordering with a grain of salt. I have deprioritized gifts that have conditions that aren't always achievable like killing enemies.
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, 520px)", width: "100%", justifyContent: "center" }}>
            {universalGifts.individual.map((category) => <Container category={category} />)}
        </div>
        All 7 archetypes have combinations of gifts that can provide benefits for all team compositions. Gifts will generally be Enablers (gifts that apply the status) or Exploiters (gifts that provide benefits against enemies with the status), with some being both.
        <div style={{ display: "grid", gridTemplateColumns: "1fr", width: "100%" }}>
            {universalGifts.combo.map((status) => <ComboContainer data={status} />)}
        </div>
    </div>;
}

export default UniversalGiftsTab;