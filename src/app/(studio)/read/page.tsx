import { Suspense } from "react";
import { ReadView } from "@/components/studio/read-view";

export default function ReadPage() {
  return (
    <Suspense>
      <ReadView />
    </Suspense>
  );
}
