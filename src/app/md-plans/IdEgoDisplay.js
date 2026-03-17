import { useState } from "react";
import AllIdEgoModal from "./AllIdEgoModal";
import { EgoImg, IdentityImg } from "@eldritchtools/limbus-shared-library";

export default function IdEgoDisplay({ identityIds, setIdentityIds, egoIds, setEgoIds, editable = false }) {
    const [modalOpen, setModalOpen] = useState(false);

    return <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
        {editable ? 
            <div onClick={() => setModalOpen(true)}>
                <button>Select recommended identities and E.G.Os</button>
            </div> :
            null
        }
        {identityIds.length > 0 ?
            <div style={{ overflowX: "auto", overflowY: "hidden" }}>
                <div style={{ display: "flex", flexShrink: 0, gap: "0.5rem", padding: "0.2rem", border: "1px transparent solid", borderRadius: "1rem" }}>
                    {identityIds.map(id =>
                        <div key={id} style={{ width: "128px", flexShrink: 0 }} data-tooltip-id="identity-tooltip" data-tooltip-content={id}>
                            <IdentityImg id={id} uptie={4} displayName={true} displayRarity={true} />
                        </div>
                    )}
                </div>
            </div> :
            null
        }
        {egoIds.length > 0 ?
            <div style={{ overflowX: "auto", overflowY: "hidden" }}>
                <div style={{ display: "flex", flexShrink: 0, gap: "0.5rem", padding: "0.2rem", border: "1px transparent solid", borderRadius: "1rem" }}>
                    {egoIds.map(id =>
                        <div key={id} style={{ width: "128px", flexShrink: 0 }} data-tooltip-id="ego-tooltip" data-tooltip-content={id}>
                            <EgoImg id={id} type={"awaken"} displayName={true} displayRarity={true} />
                        </div>
                    )}
                </div>
            </div> :
            null
        }

        {editable ? 
            <AllIdEgoModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                identityIds={identityIds}
                egoIds={egoIds}
                setIdentityIds={setIdentityIds}
                setEgoIds={setEgoIds}
            /> :
            null
        }
    </div>
}