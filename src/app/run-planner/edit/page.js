"use client";

import React from "react";
import RunPlanEditor from "../RunPlanEditor";

export default function EditRunPlanPage({params}) {
    const { id } = React.use(params);
    return <RunPlanEditor mode="edit" runPlanId={id} />;
}
