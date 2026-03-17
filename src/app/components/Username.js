import "./Username.css";
import NoPrefetchLink from "../NoPrefetchLink";

export default function Username({ username, flair, style = {}, clickable = true }) {
    // const component = clickable ?
    //     <NoPrefetchLink href={`/profiles/${username}`} className="username" style={style}>{username}</NoPrefetchLink> :
    //     <span className="username">{username}</span>

    const component = <span className="username">{username}</span>

    if (flair)
        return <span style={{ whiteSpace: "wrap" }}>
            {component} <em style={{ color: "#aaa" }}>({flair})</em>
        </span>
    return component;
}