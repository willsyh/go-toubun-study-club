import { AuthArt } from "@/components/auth/auth-art";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh bg-canvas">
      <AuthArt />
      <main className="flex w-full items-center justify-center px-4 py-12 sm:px-8 lg:w-1/2">
        <div className="w-full max-w-140">{children}</div>
      </main>
    </div>
  );
}
