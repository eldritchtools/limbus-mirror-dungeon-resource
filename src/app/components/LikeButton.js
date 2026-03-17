import { useEffect, useState } from "react";
import { useRequestsCache } from "../database/RequestsCacheProvider";
import { useAuth } from "../database/authProvider";
import { LikeOutline, LikeSolid } from "./Symbols";


export default function LikeButton({ targetType, targetId, likeCount, buildEntryVersion = false, iconSize, shortText = false }) {
    const { user } = useAuth();
    const { checkLiked, toggleLike, fetchUserData } = useRequestsCache();
    const [count, setCount] = useState(likeCount);
    const [loading, setLoading] = useState(false);

    useEffect(() => { if (user) fetchUserData(targetType, [targetId]) }, [fetchUserData, targetType, targetId, user]);
    const liked = useMemo(() => checkLiked(targetType, targetId), [checkLiked, targetType, targetId]);
    const text = shortText ? `${count}` : (count === 1 ? "1 Like" : `${count} Likes`);

    if (!user)
        if (buildEntryVersion) {
            return <div
                className="is-disabled"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "#ddd", borderBottomLeftRadius: "12px" }}
            >
                <LikeOutline text={text} size={iconSize} />
            </div>
        } else {
            return <button className={liked ? "toggle-button-active" : "toggle-button"} disabled={true} title="Login required">
                <LikeOutline text={text} size={iconSize} />
            </button>
        }

    if (liked === undefined || liked === null) return null;

    const handleClick = async () => {
        setLoading(true);
        await toggleLike(targetType, targetId);
        setLoading(false);

        if (liked) setCount(p => p - 1);
        else setCount(p => p + 1);
    };

    if (buildEntryVersion) {
        return <div
            className={loading ? "is-disabled" : null}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "#ddd", borderBottomLeftRadius: "12px" }}
            onClick={loading ? null : handleClick}
        >
            {liked ? <LikeSolid text={text} size={iconSize} /> : <LikeOutline text={text} size={iconSize} />}
        </div>
    } else {
        return <button onClick={handleClick} className={liked ? "toggle-button-active" : "toggle-button"} disabled={loading}>
            {liked ? <LikeSolid text={text} size={iconSize} /> : <LikeOutline text={text} size={iconSize} />}
        </button>
    }
}
