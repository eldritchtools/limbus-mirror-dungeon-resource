"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import PlansSearchComponent from "../PlansSearchComponent";
import MdPlan from "@/app/components/MdPlan";
import { searchMdPlans } from "@/app/database/mdPlans";
import { useBreakpoint } from "@eldritchtools/shared-components";

export default function SearchMdPlansContent() {
    const searchParams = useSearchParams();

    const filters = useMemo(() => searchParams.entries().reduce((acc, [f, v]) => {
        if (f === "search") acc[f] = v;
        else if (f === "tags") acc[f] = v.split(",");
        return acc;
    }, {}), [searchParams]);

    const options = useMemo(() => { return { ...filters } }, [filters]);

    const [plans, setPlans] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);

    const { isMobile } = useBreakpoint();
    const size = isMobile ? 175 : 250;

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                setLoading(true);

                const params = {
                    query: filters["search"],
                    tags: filters["tags"],
                    limit: 20,
                    offset: 0,
                    published: true,
                    ignoreBlockDiscovery: true
                }

                const data = await searchMdPlans(params);

                setPlans(data || []);
                setLoading(false);
            } catch (err) {
                console.error("Error loading md plans:", err);
            }
        };

        fetchPlans();
    }, [searchParams, filters, page]);

    return <div style={{ display: "flex", flexDirection: "column", textAlign: "center", gap: "1rem" }}>
        <PlansSearchComponent options={options} />
        <div style={{ border: "1px #777 solid" }} />

        {loading ?
            <p style={{ color: "#aaa", fontweight: "bold", textAlign: "center" }}>Loading md plans...</p> :
            plans.length === 0 ?
                <p style={{ color: "#aaa", fontweight: "bold", textAlign: "center" }}>
                    {page === 1 ? "No published md plans." : "No more md plans."}
                </p> :
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, ${size}px)`, gap: isMobile ? "0.2rem" : "0.5rem", justifyContent: "center" }}>
                        {plans.map(plan => <MdPlan key={plan.id} plan={plan} />)}
                    </div>

                    <div style={{ display: "flex", gap: "0.5rem", alignSelf: "end" }}>
                        <button className="page-button" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
                        <button className="page-button" disabled={plans.length < 10} onClick={() => setPage(p => p + 1)}>Next</button>
                    </div>
                </div>
        }
    </div>;
}

