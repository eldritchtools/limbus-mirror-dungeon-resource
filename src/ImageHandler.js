const ASSETS_ROOT = `${process.env.PUBLIC_URL}/assets`;

const giftContainerStyle = {position: "relative", width: "64px", height: "64px"};
const giftBackgroundStyle = {position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)"};
const giftStyle = {position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)"};
const giftTierStyle = {position: "absolute", top: "5%", left: "5%", fontFamily: "'Archivo Narrow', sans-serif", fontWeight: "bold", fontSize: "24px", color: "#ffd84d", transform: "scaleY(1.4)"}
const giftKeywordStyle = {position: "absolute", bottom: "5%", right: "5%"};

function resize(style, size) {
    return {...style, width: `${size}px`, height: `${size}px`};
}

function rescaleFont(style, scale) {
    return {...style, fontSize: `${24*scale}px`}
}

function tierToString(tier) {
    switch(tier){
        case "1": return "I";
        case "2": return "II";
        case "3": return "III";
        case "4": return "IV";
        case "5": return "V";
        case "EX": return "EX";
        default: return "";
    }
}

function GiftImg({gift, scale=1}) {
    const size = 96*scale;
    const tier = tierToString(gift.tier);
    return <div style={resize(giftContainerStyle, size)}>
        <img src={`${ASSETS_ROOT}/ego_gift_background.png`} alt="" style={resize(giftBackgroundStyle, size)} />
        <img src={`${ASSETS_ROOT}/ego_gifts/${"image_override" in gift ? gift["image_override"] : gift.name}.png`} alt={gift.name} title={gift.name} style={resize(giftStyle, size*0.75)}/>
        <span style={rescaleFont(giftTierStyle, scale)}>{tier}</span>
        {gift.keyword !== "Keywordless" ? <img src={`${ASSETS_ROOT}/icons/${gift.keyword}.png`} alt="" style={resize(giftKeywordStyle, size*0.3)}/> : null}
    </div>
}

const iconStyle = {width: "32px", height: "32px"};

function Icon({id, scale=1}) {
    return <img src={`${ASSETS_ROOT}/icons/${id}.png`} alt={id} title={id} style={resize(iconStyle, 32*scale)} />;
}

function rescaleThemePack(scale) {
    return {width: `${380*scale}px`, height: `${690*scale}px`};
}

function ThemePackImg({themePack, scale=1}) {
    return <img src={`${ASSETS_ROOT}/theme_packs/${themePack.image}.png`} alt={themePack.name} title={themePack.name} style={rescaleThemePack(scale)}/>;
}

function rescaleIdentity(scale) {
    return {width: `${537*scale}px`, height: `${827*scale}px`};
}

function IdentityImg({identity, displayName=false, scale=1}) {
    const scaledStyle = rescaleIdentity(scale);
    const img = identity.id.slice(-2) === "01" ?
        <img src={`${ASSETS_ROOT}/identities/${identity.id}_normal_info.png`} alt={identity.name} title={identity.name} style={scaledStyle}/> :
        <img src={`${ASSETS_ROOT}/identities/${identity.id}_gacksung_info.png`} alt={identity.name} title={identity.name} style={scaledStyle}/>;

    if (displayName) {
        return <div style={{display: "flex", flexDirection: "column", textAlign: "center", width: scaledStyle.width}}>
            {img}
            <span>{identity.name}</span>
            <span>{identity.sinner}</span>
        </div>
    } else {
        return img;
    }
}

function RarityImg({rarity}) {
    switch(rarity) {
        case 1: return <img src={`${ASSETS_ROOT}/0.png`} alt={"0"} title={"0"} style={{height: "3rem"}} />;
        case 2: return <img src={`${ASSETS_ROOT}/00.png`} alt={"00"} title={"00"} style={{height: "3rem"}}/>;
        case 3: return <img src={`${ASSETS_ROOT}/000.png`} alt={"000"} title={"000"} style={{height: "3rem"}}/>;
        default: return null;
    }
}

export {GiftImg, Icon, ThemePackImg, IdentityImg, RarityImg};