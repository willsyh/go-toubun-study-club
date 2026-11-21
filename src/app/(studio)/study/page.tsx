import { Suspense } from "react";
import { StudyView } from "@/components/studio/study-view";

export default function StudyPage() {
  return (
    <Suspense>
      <StudyView />
    </Suspense>
  );
}
