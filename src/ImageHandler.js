const ASSETS_ROOT = `${process.env.PUBLIC_URL}/assets`;

function resize(style, size) {
    return {...style, width: `${size}px`, height: `${size}px`};
}

const iconStyle = {width: "32px", height: "32px"};

function Icon({id, scale=1}) {
    return <img src={`${ASSETS_ROOT}/icons/${id}.png`} alt={id} title={id} style={resize(iconStyle, 32*scale)} />;
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

function rescaleEGO(scale) {
    return {width: `${256*scale}px`, height: `${256*scale}px`};
}

function EGOImg({EGOId, scale=1}) {
    const scaledStyle = rescaleEGO(scale);
    const img = <img src={`${ASSETS_ROOT}/egos/${EGOId}_awaken_profile.png`} alt={""} title={""} style={scaledStyle}/>

    return img;
}

function SampleImg({img, width=null, height=null}) {
    const style = {};
    if (width) style.width = width; else style.width = "auto";
    if (height) style.height = height; else style.height = "auto";
    return <img src={`${ASSETS_ROOT}/samples/${img}.png`} alt={""} title={""} style={style}/>
}

export {Icon, IdentityImg, RarityImg, EGOImg, SampleImg};