import { useState } from "react";
import { useProfiles } from "@eldritchtools/shared-components";

function MigrationTab() {
    const { currentProfile, importProfile } = useProfiles();
    const [dataString, setDataString] = useState("");
    const [importSuccess, setImportSuccess] = useState('');

    const handleImportProfile = async () => {
        await importProfile(currentProfile, dataString, "base64", true);
        setImportSuccess('Imported!');
        setTimeout(() => setImportSuccess(''), 2000);
    }

    return <div style={{ height: "95%", width: "80%", display: "flex", flexDirection: "column", gap: "1rem", overflowY: "auto", alignItems: "center" }}>
        <span>
            I'm migrating my tools to a new domain. The old link should have brought you here directly.
            <br /> <br />
            Unfortunately I can't automatically migrate the data from the previous domain due to how it's stored, but I've made the <a href={"https://eldritchtools.github.io/limbus-mirror-dungeon-resource-old/"}>old page accessible here</a>.
            <br /> <br />
            You can export your data from there and import it here by pasting the string from the Export Data tab below. Note that any achievements ticked here will be overwritten by the imported data.
        </span>
        <textarea style={{height: "5rem", width: "80%"}} value={dataString} onChange={e => setDataString(e.target.value)}/>
        <div><button onClick={handleImportProfile}>Import</button></div>
        <div>{importSuccess ?? null}</div>
    </div>;
}

export default MigrationTab;
