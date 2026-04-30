import React from "react";
import { statusClasses } from "../../utils/helpers";

export default function StatusBadge({ value }) {
  return <span className={statusClasses[value] || "badge badge-slate"}>{value}</span>;
}
