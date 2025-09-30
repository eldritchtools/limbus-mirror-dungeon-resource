import { Gift } from "@eldritchtools/limbus-shared-library";
import data from './data';

function FusionRecipe({ recipe, includeProduct=true }) {
    const fontStyle = { color: "#ECCDA3", fontSize: "2.5em" }
    const components = [];
    recipe.ingredients.forEach(ingredient => {
        if (components.length !== 0) components.push(<span style={fontStyle}>+</span>);
        if (ingredient instanceof Object) {
            const half = Math.ceil(ingredient.options.length / 2);
            components.push(<div style={{ ...fontStyle, display: "flex", flexDirection: "row", alignItems: "center", gap: "5px" }}>
                {ingredient.count}x
                <div>
                    <div style={{ display: "flex", flexDirection: "row" }}>{ingredient.options.slice(0, half).map(option => <Gift id={option} scale={0.5} />)}</div>
                    <div style={{ display: "flex", flexDirection: "row" }}>{ingredient.options.slice(half).map(option => <Gift id={option} scale={0.5} />)}</div>
                </div>
            </div>)
        } else {
            components.push(<Gift id={ingredient} />);
        }
    });

    if (includeProduct) {
        components.unshift(<span style={fontStyle}>=</span>);
        components.unshift(<Gift id={recipe.id} />);
    }
    
    return <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>{components}</div>
}

export default FusionRecipe;