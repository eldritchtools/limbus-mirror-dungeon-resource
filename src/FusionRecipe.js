import { GiftImg } from "./ImageHandler";

function FusionRecipe({ data, recipe, includeProduct=true }) {
    const fontStyle = { color: "#ECCDA3", fontSize: "2.5em" }
    const components = [];
    if (includeProduct) {
        components.push(<GiftImg gift={data.gifts[recipe.id]} />);
        components.push(<span style={fontStyle}>=</span>);
    }
    recipe.ingredients.forEach(ingredient => {
        if (components.length !== 2) components.push(<span style={fontStyle}>+</span>);
        if (ingredient instanceof Object) {
            const half = Math.ceil(ingredient.options.length / 2);
            components.push(<div style={{ ...fontStyle, display: "flex", flexDirection: "row", alignItems: "center", gap: "5px" }}>
                {ingredient.count}x
                <div>
                    <div style={{ display: "flex", flexDirection: "row" }}>{ingredient.options.slice(0, half).map(option => <GiftImg gift={data.gifts[option]} scale={0.5} />)}</div>
                    <div style={{ display: "flex", flexDirection: "row" }}>{ingredient.options.slice(half).map(option => <GiftImg gift={data.gifts[option]} scale={0.5} />)}</div>
                </div>
            </div>)
        } else {
            components.push(<GiftImg gift={data.gifts[ingredient]} />);
        }
    });
    return <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>{components}</div>
}

export default FusionRecipe;