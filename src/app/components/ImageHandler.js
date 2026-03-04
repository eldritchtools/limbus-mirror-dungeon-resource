const ASSETS_ROOT = `${process.env.PUBLIC_URL}/assets`;

function SampleImg({ img, width = null, height = null }) {
    const style = {};
    if (width) style.width = width; else style.width = "auto";
    if (height) style.height = height; else style.height = "auto";
    return <img src={`${ASSETS_ROOT}/samples/${img}.png`} alt={""} title={""} style={style} />
}

export { SampleImg };