"use client";
import { useEffect, useState } from "react";
import { tabStyle } from "../styles";
import { useSearchParams } from "next/navigation";
import { searchMdPlans } from "../database/mdPlans";
import MdPlan from "../components/MdPlan";
import PlansSearchComponent from "./PlansSearchComponent";
import { useBreakpoint } from "@eldritchtools/shared-components";

export default function MdPlansPage() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(null);
    const [refreshCounter, setRefreshCounter] = useState(0);
    const searchParams = useSearchParams();

    const { isMobile } = useBreakpoint();
    const size = isMobile ? 175 : 250;

    useEffect(() => {
        const mode = searchParams.get('mode');
        if (["popular", "recent", "random"].includes(mode)) {
            setActiveTab(mode);
        } else {
            const saved = localStorage.getItem("mdplanActiveTab");
            setActiveTab(saved ?? "popular");
        }
    }, [searchParams]);

    useEffect(() => {
        if (!activeTab) return;

        let canceled = false;

        const fetchPlans = async () => {
            try {
                setLoading(true);
                const params = {
                    limit: 20,
                    offset: 0,
                    published: true
                };

                const data = activeTab === "popular" ?
                    await searchMdPlans({ ...params, sortBy: "popular" }) :
                    activeTab === "recent" ?
                        await searchMdPlans({ ...params, sortBy: "new" }) :
                        await searchMdPlans({ ...params, sortBy: "random" })
                if (!canceled) {
                    setPlans(data || []);
                }
            } catch (err) {
                if (!canceled) console.error(err);
            } finally {
                if (!canceled) setLoading(false);
            }
        };

        fetchPlans();
        localStorage.setItem("mdplanActiveTab", activeTab);
        return () => {
            canceled = true;
        };
    }, [activeTab, refreshCounter]);

    const handleTabClick = (tab) => {
        if (activeTab === tab) setRefreshCounter(p => p + 1);
        else setActiveTab(tab);
    }

    return <div style={{ display: "flex", flexDirection: "column", textAlign: "center", gap: "0.5rem" }}>
        <PlansSearchComponent />
        <div style={{ border: "1px #777 solid" }} />
        <div style={{ display: "flex", flexDirection: "row", gap: "1rem", alignSelf: "center", marginTop: "0.5rem", marginBottom: "0.5rem" }}>
            <div style={{ ...tabStyle, color: activeTab === "popular" ? "#ddd" : "#777" }} onClick={() => handleTabClick("popular")}>Popular</div>
            <div style={{ ...tabStyle, color: activeTab === "recent" ? "#ddd" : "#777" }} onClick={() => handleTabClick("recent")}>New</div>
            <div style={{ ...tabStyle, color: activeTab === "random" ? "#ddd" : "#777" }} onClick={() => handleTabClick("random")}>Random</div>
        </div>
        {loading ?
            <div style={{ color: "#9ca3af" }}>
                {"Loading MD plans..."}
            </div> :
            (plans.length === 0 ?
                <div>
                    No published plans.
                </div> :
                <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, ${size}px)`, gap: isMobile ? "0.2rem" : "0.5rem", justifyContent: "center" }}>
                    {plans.map(plan => <MdPlan key={plan.id} plan={plan} />)}
                </div>
            )}
    </div>;
}
