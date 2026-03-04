"use client";

import { useRouter } from "next/navigation";
import { setNotificationRead } from "../database/notifications";
import "./Notifications.css";
import ReactTimeAgo from "react-time-ago";

function constructActorStr(actors) {
    if (actors.length >= 4) return `${actors[0]}, ${actors[1]}, and ${actors.length - 2} more users`;
    if (actors.length === 3) return `${actors[0]}, ${actors[1]}, and 1 more user`;
    if (actors.length === 2) return `${actors[0]} and ${actors[1]}`
    return `${actors[0]}`;
}

function constructNotifMessage(notif) {
    const actorsStr = constructActorStr(notif.actors);

    return notif.type === "comment" ?
        `${actorsStr} commented on your build ${notif.build_title}` :
        `${actorsStr} replied to your comment to the build ${notif.build_title}`;
}

export default function Notification({ notif, updateNotif }) {
    const router = useRouter();

    const handleNotifClick = async (notif) => {
        await setNotificationRead(notif.id);
        if (updateNotif && !notif.is_read) updateNotif({ ...notif, is_read: true });
        router.push(`/builds/${notif.build_id}`);
    }

    return <div onClick={() => handleNotifClick(notif)} className={notif.is_read ? "notif-read" : "notif"}>
        <div style={{ fontSize: "1rem", marginBottom: "4px" }} onClick={() => handleNotifClick(notif)}>
            {constructNotifMessage(notif)}
        </div>
        <div style={{ fontSize: "0.8rem", color: "#999" }}>
            <ReactTimeAgo date={notif.created_at} locale="en-US" timeStyle="mini" />
        </div>
    </div>
}