import { isTouchDevice } from "@eldritchtools/shared-components";
import Link from "next/link";

export default function TooltipLink({ href, tooltipId, tooltipContent, className, style, children }) {
    const props = {};
    if (className) props.className = className;
    if (style) props.style = style;
    if (isTouchDevice()) props.onClick = e => e.preventDefault();

    return <Link
        href={href}
        data-tooltip-id={tooltipId}
        data-tooltip-content={tooltipContent}
        prefetch={false}
        {...props}
    >
        {children}
    </Link>
}