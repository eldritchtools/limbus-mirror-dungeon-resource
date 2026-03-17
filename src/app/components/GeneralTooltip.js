import { Tooltip } from "react-tooltip";
import { tooltipStyle } from "../styles";
import { useBreakpoint } from "@eldritchtools/shared-components";

const tooltipContent = {
    "teamcode": "Limbus Company allows quickly copying teams using team codes. This feature can be found beside the team name in the sinner selection menu.",
    "includeExclude": "Included items follow the \"Strict Filtering\" setting.\nExcluded items require all of them to be excluded from the results.",
    "twiceToExclude": "Select twice to exclude."
}

function generalTooltipProps(typeOrString) {
    return {
        "data-tooltip-id": "general-tooltip",
        "data-tooltip-content": typeOrString in tooltipContent ? tooltipContent[typeOrString] : typeOrString
    }
}

function GeneralTooltip() {
    const {isMobile} = useBreakpoint();

    return <Tooltip
        id="general-tooltip"
        // getTooltipContainer={() => document.body}
        render={({ content }) => <div style={{ ...tooltipStyle, padding: "0.5rem", display: "block", maxWidth: isMobile ? "40ch": "60ch", whiteSpace: "pre-wrap" }}>
            {content}
        </div>}
        style={{ backgroundColor: "transparent", zIndex: "9999" }}
    >
    </Tooltip>
}

export { GeneralTooltip, generalTooltipProps };