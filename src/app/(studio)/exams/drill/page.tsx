import { Suspense } from "react";
import { ExamDrill } from "@/components/studio/exam-drill";

export default function ExamDrillPage() {
  return (
    <Suspense>
      <ExamDrill />
    </Suspense>
  );
}
