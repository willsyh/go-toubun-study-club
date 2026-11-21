import { Suspense } from "react";
import { CharacterSelectScreen } from "@/components/studio/character-select";

export default function CharactersPage() {
  return (
    <Suspense>
      <CharacterSelectScreen />
    </Suspense>
  );
}
