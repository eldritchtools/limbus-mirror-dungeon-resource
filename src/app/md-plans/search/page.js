import { Suspense } from "react";
import SearchMdPlansContent from "./SearchMdPlansContent";

export default function SearchMdPlansPage() {
    return <div style={{ display: "flex", flexDirection: "column", textAlign: "center", gap: "1rem" }}>
        <Suspense fallback={<div>Loading...</div>}>
            <SearchMdPlansContent />
        </Suspense>
    </div>
}
