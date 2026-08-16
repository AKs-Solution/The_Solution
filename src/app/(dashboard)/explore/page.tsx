import { Suspense } from "react";
import ExplorePage from "./explore-client";

export default function ExploreRoute() {
  return (
    <Suspense fallback={<div className="text-sm text-slate-500">Loading public corpus...</div>}>
      <ExplorePage />
    </Suspense>
  );
}
