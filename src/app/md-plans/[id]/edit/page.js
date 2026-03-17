"use client";

import React from "react";
import MdPlanEditor from "../../MdPlanEditor";

export default function EditMdPlanPage({params}) {
    const { id } = React.use(params);
    return <MdPlanEditor mode="edit" mdPlanId={id} />;
}
