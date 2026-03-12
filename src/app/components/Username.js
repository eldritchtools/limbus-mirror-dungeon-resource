import Link from "next/link";
import "./Username.css";

export default function Username({username, flair, style={}}){
    if (flair) 
        return <span style={{whiteSpace: "wrap"}}>
            <Link href={`/profiles/${username}`} className="username" prefetch={false} style={style}>{username}</Link> <em style={{color: "#aaa"}}>({flair})</em>
        </span>
    return <Link href={`/profiles/${username}`} className="username" prefetch={false} style={style}>{username}</Link>
}