const ASSETS_ROOT = `${process.env.PUBLIC_URL}/assets`;

function RarityImg({rarity}) {
    switch(rarity) {
        case 1: return <img src={`${ASSETS_ROOT}/0.png`} alt={"0"} title={"0"} style={{height: "3rem"}} />;
        case 2: return <img src={`${ASSETS_ROOT}/00.png`} alt={"00"} title={"00"} style={{height: "3rem"}}/>;
        case 3: return <img src={`${ASSETS_ROOT}/000.png`} alt={"000"} title={"000"} style={{height: "3rem"}}/>;
        default: return null;
    }
}

function SampleImg({img, width=null, height=null}) {
    const style = {};
    if (width) style.width = width; else style.width = "auto";
    if (height) style.height = height; else style.height = "auto";
    return <img src={`${ASSETS_ROOT}/samples/${img}.png`} alt={""} title={""} style={style}/>
}

export {RarityImg, SampleImg};