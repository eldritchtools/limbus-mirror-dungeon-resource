"use client";

import { useMemo } from "react";
import "./tag.css";
import NoPrefetchLink from "../NoPrefetchLink";

export default function Tag({ tag, type }) {
    const path = useMemo(() => {
        const search = new URLSearchParams({ tags: [tag] });
        return `/${type}/search?${search.toString()}`;
    }, [tag, type]);

    return <NoPrefetchLink className="tag" href={path}>{tag}</NoPrefetchLink>
}