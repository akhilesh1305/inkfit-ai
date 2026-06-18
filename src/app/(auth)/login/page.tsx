import { Suspense } from "react";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />}>
      <LoginForm />
    </Suspense>
  );
}
