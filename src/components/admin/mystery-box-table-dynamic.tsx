"use client";

import dynamic from "next/dynamic";

const MysteryBoxTableInner = dynamic(() => import("./mystery-box-table"), {
  loading: () => (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-16 animate-pulse rounded-xl bg-zinc-900/60" />
      ))}
    </div>
  ),
});

export default MysteryBoxTableInner;
