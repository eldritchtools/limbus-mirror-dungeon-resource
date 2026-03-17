import NoPrefetchLink from "../NoPrefetchLink";
import { CommentSolid } from "./Symbols";

const style = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderLeft: "2px #7c6a55 dashed",
    borderRight: "2px #7c6a55 dashed",
    color: "#ddd",
    textDecoration: "none"
};

export default function CommentButton({ targetPath, targetId, count, buildEntryVersion, iconSize, shortText = false }) {
    const text = shortText ? `${count}` : (count === 1 ? "1 Comment" : `${count} Comments`);

    if (buildEntryVersion) {
        return <NoPrefetchLink href={`/${targetPath}/${targetId}#comments`} style={style}>
            <CommentSolid text={text} size={iconSize} />
        </NoPrefetchLink>
    } else {
        return <NoPrefetchLink href={`/${targetPath}/${targetId}#comments`} className="toggle-button" style={{color: "#ddd", textDecoration: "none"}}>
            <CommentSolid text={text} size={iconSize} />
        </NoPrefetchLink>
    }
}
