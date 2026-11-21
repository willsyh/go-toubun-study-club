import { Suspense } from "react";
import { CallView } from "@/components/studio/call-view";

export default function CallPage() {
  return (
    <Suspense>
      <CallView />
    </Suspense>
  );
}
