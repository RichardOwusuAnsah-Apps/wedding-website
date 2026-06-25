import { LoginForm } from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;
  // Only allow internal /admin redirects (avoid open-redirect).
  const redirectTo =
    redirect && redirect.startsWith("/admin") ? redirect : "/admin";

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[linear-gradient(180deg,#fbf7ef,var(--color-ivory))]">
      <LoginForm redirectTo={redirectTo} />
    </div>
  );
}
