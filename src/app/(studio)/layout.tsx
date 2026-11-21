import { UserProvider } from "@/components/app/user-context";
import { SettingsProvider } from "@/components/studio/settings-dialog";

// Loaded as a plain stylesheet: next/font's generated CSS trips over the
// custom "*.css" Turbopack loader rule in next.config.ts.
const FONTS =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&family=Noto+Serif+JP:wght@400;600&display=swap";

/**
 * The "desktop edition" screens: main menu, tutor select, study rooms, exams,
 * language class and calls. Cream paper look, no sidebar.
 */
export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href={FONTS} precedence="default" />
      <div className="studio min-h-dvh">
        <SettingsProvider>{children}</SettingsProvider>
      </div>
    </UserProvider>
  );
}
