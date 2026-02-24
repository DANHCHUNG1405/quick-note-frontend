"use client";

import { useState } from "react";
import { Lock, Mail, EyeOff, Eye } from "lucide-react";
import { authService } from "@/app/services/auth.service";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await authService.login({ email, password });

      router.push("/"); // đổi theo route của bạn
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-background-light">
      {/* Header */}
      <header className="w-full px-6 py-8 md:px-12 ">
        <div className="max-w-7xl mx-auto flex items-center justify-center sm:justify-start gap-2">
          <div className="bg-primary p-2 rounded-lg text-white flex items-center justify-center">
            <span className="text-2xl font-bold text-[#121117]">✎</span>
          </div>
          <h2 className="text-[#121117] text-xl font-bold tracking-tight">
            QuickNote
          </h2>
        </div>
      </header>

      {/* Main */}
      <main className="grow flex items-center justify-center px-4 pb-20">
        <div className="w-full max-w-110 bg-white rounded-xl shadow-xl shadow-primary/5 border border-primary/10 p-8 md:p-10">
          {/* Welcome */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold leading-tight mb-2 text-[#121117]">
              Welcome back
            </h1>
            <p className="text-[#656487] text-sm">
              Enter your credentials to access your notes.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-[#121117]">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#656487]" />
                <input
                  className="w-full pl-12 pr-4 h-14 bg-background-light border border-[#dcdce5]  rounded-lg text-[#121117]  focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-[#656487]/60"
                  placeholder="name@company.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-[#121117]">
                  Password
                </label>
                <a
                  href="#"
                  className="text-primary hover:text-primary/80 text-xs font-semibold transition-colors"
                >
                  Forgot Password?
                </a>
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#656487]" />

                <input
                  className="w-full pl-12 pr-12 h-14 bg-background-light border border-[#dcdce5]  rounded-lg text-[#121117]  focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-[#656487]/60"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  type={showPassword ? "text" : "password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#656487] hover:text-primary"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember */}
            <div className="flex items-center gap-2 py-1">
              <input
                id="remember"
                type="checkbox"
                className="w-4 h-4 accent-primary"
              />
              <label htmlFor="remember" className="text-sm text-[#656487]">
                Keep me signed in
              </label>
            </div>
            {error && (
              <div className="text-sm text-red-500 font-medium">{error}</div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold text-base transition-all active:scale-[0.98] shadow-lg shadow-primary/20"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            {/* Divider */}
            <div className="relative flex items-center py-4">
              <div className="grow border-t border-[#dcdce5]"></div>
              <span className="mx-4 text-[#656487] text-xs font-medium">
                OR
              </span>
              <div className="grow border-t border-[#dcdce5]"></div>
            </div>

            {/* Google */}
            <button
              type="button"
              className="w-full h-12 flex items-center justify-center gap-3 bg-white border border-[#dcdce5] rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors text-[#121117]"
            >
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDJKNgQQ443OijCd5Slk9uA3o7897YP2X01rJrqSFRi8sd9c9KbpwKhFiuVKzzQLeXXILJ-RaLQ5fucn11pIHst4RzbKU1-Be-WB5RggPyS6vqUMEDUypCXXCouKOc4ndtNWqGrYOFkt1O8pLO__IdAYGYy7MaJrYAHhMPSWYJF5EdOsc5RVoc3SgTyp8TTj0eaB_7eGLdoqw9VEls8x5-Rrmz2ER_Mg6rwgGk4e1I2OOnxAULrbWePJtWFUWZN_iQcq44cdg8TDxuj"
                alt="Google"
                className="w-5 h-5"
              />
              Continue with Google
            </button>
          </form>

          {/* Footer link */}
          <div className="mt-8 text-center">
            <p className="text-sm text-[#656487]">
              {"Don't have an account?"}{" "}
              <a
                href="/register"
                className="text-primary font-bold hover:underline"
              >
                Create an account
              </a>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 text-center text-xs text-[#656487]">
        © 2026 QuickNote Inc. All rights reserved.
      </footer>
    </section>
  );
}
