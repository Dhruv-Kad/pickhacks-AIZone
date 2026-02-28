"use client";

import { PermitType } from "./types";

const PERMIT_TYPES: { value: PermitType; label: string }[] = [
  { value: "fence", label: "Fence" },
  { value: "shed", label: "Shed / Accessory Structure" },
  { value: "treehouse", label: "Treehouse" },
];

export default function TopBar(props: {
  permitType: PermitType;
  setPermitType: (v: PermitType) => void;
}) {
  const { permitType, setPermitType } = props;

  return (
    <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-black" />
          <div className="leading-tight">
            <div className="text-sm font-semibold">AIZone Permits</div>
            <div className="text-xs text-muted-foreground">
              St. Louis County • Fence • Shed • Treehouse
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Build type</span>
          <select
            className="h-9 rounded-md border bg-background px-2 text-sm"
            value={permitType}
            onChange={(e) => setPermitType(e.target.value as PermitType)}
          >
            {PERMIT_TYPES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}