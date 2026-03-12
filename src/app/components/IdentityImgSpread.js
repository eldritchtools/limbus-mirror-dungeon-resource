import { IdentityImg, SinnerIcon } from "@eldritchtools/limbus-shared-library";

function DeploymentPosition({ sinnerId, deploymentOrder, activeSinners }) {
    const index = deploymentOrder.indexOf(sinnerId);

    if (index === -1) return null;

    const color = index < activeSinners ? "#fefe3d" : "#29fee9";
    const num = index + 1;

    return <div style={{
        position: "absolute",
        top: "5px",
        left: "5px",
        textShadow: "2px 2px 6px #000, -2px 2px 6px #000, 2px -2px 6px #000, -2px -2px 6px #000, 0px 0px 12px rgba(0, 0, 0, 0.75), 0px 0px 18px rgba(0, 0, 0, 0.5)",
        color: color,
        fontWeight: "bold",
        // height: "1rem",
        // width: "1rem",
        // textAlign: "center",
        // background: "rgba(63, 63, 63, 0.5)",
        // borderRadius: "50%"
    }}>
        {num}
    </div>
}

export default function IdentityImgSpread({ identityIds, scale, deploymentOrder = [], activeSinners = 0, identityUpties = null }) {
    const size = scale * 256;
    return <div style={{ display: "grid", gridTemplateColumns: `repeat(6, ${size}px)`, gridTemplateRows: `repeat(2, ${size}px)`, 
        width: `${size * 6 + 10}px`, alignItems: "center", justifyItems: "center", gap: "2px" }}>
            
        {identityIds.map((id, i) => <div key={i} style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {id ?
                <IdentityImg key={i} id={id} scale={scale} uptie={identityUpties ? (identityUpties[i] === "" ? undefined : identityUpties[i]) : undefined} style={{borderRadius: "4px"}} /> :
                <SinnerIcon key={i} num={i + 1} style={{ height: `${size * .75}px` }} />}

            <DeploymentPosition sinnerId={i + 1} deploymentOrder={deploymentOrder} activeSinners={activeSinners} />
        </div>
        )}
    </div>
}
