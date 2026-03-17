import { ThemePackImg } from "@eldritchtools/limbus-shared-library";
import { Modal } from "../components/Modal";
import { useBreakpoint } from "@eldritchtools/shared-components";

export default function SelectThemePackModal({ isOpen, onClose, options, onSelectPack }) {
    const { isMobile } = useBreakpoint();

    return <Modal isOpen={isOpen} onClose={onClose}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", padding: "1rem", maxHeight: "90vh", overflowY: "auto", width: "980px", maxWidth: "80vw" }}>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? 75 : 100}px, 1fr))`, width: "100%", rowGap: "0.5rem" }}>
                {options.map(id =>
                    <div key={id} onClick={() => onSelectPack(id)} style={{ cursor: "pointer" }}>
                        <ThemePackImg id={id} displayName={true} scale={isMobile ? .15 : 0.25} />
                    </div>
                )}
            </div>
        </div>
    </Modal>
}