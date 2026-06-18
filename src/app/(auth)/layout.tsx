import Image from "next/image";
import { Logo } from "@/components/Logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-ink-bg">
      <div className="relative hidden w-1/2 overflow-hidden lg:block">
        <Image
          src="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=80"
          alt="AI technology abstract"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/95 via-ink-surface/90 to-ink-bg/95" />
        <div className="absolute inset-0 flex flex-col justify-between p-12">
          <Logo size="lg" />
          <div>
            <h2 className="text-3xl font-bold leading-tight text-white">
              Content that fits your brand — powered by AI.
            </h2>
            <p className="mt-4 max-w-md text-lg text-white/70">
              Join thousands of creators and businesses generating blogs, social posts,
              images, and SEO content from one intelligent workspace.
            </p>
          </div>
          <p className="text-sm text-white/50">© 2026 InkFit AI</p>
        </div>
      </div>

      <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="mb-8 lg:hidden">
          <Logo size="md" />
        </div>
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
