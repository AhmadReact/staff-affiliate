 "use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loginThunk } from "@/store/slices/authSlice";

export default function SignInPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.accessToken || !auth.user) return;

    const userType = auth.user.user_type;

    if (userType === "staff") {
      router.replace("/admin-dashboard/customers");
    } else if (userType === "customer") {
      router.replace("/customer-dashboard");
    }
  }, [auth.accessToken, auth.user, router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!username || !password) {
      setError("Please enter both username and password.");
      return;
    }

    try {
      const result = await dispatch(
        loginThunk({ username, password }),
      ).unwrap();

      const userType = result.user?.user_type;

      if (userType === "staff") {
        router.push("/admin-dashboard/customers");
      } else {
        router.push("/customer-dashboard");
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";
      setError(message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Sign in to track your referrals, earnings, and payouts.
          </p>
        </div>

        <div className="bg-white/90 backdrop-blur shadow-lg rounded-2xl p-6 sm:p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 outline-none transition"
                placeholder="Enter your username"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                >
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 outline-none transition"
                placeholder="Enter your password"
              />
            </div>

            {(error || auth.error) && (
              <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error || auth.error}
              </p>
            )}

            <button
              type="submit"
              disabled={auth.loading}
              className="w-full inline-flex justify-center items-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/30 hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition"
            >
              {auth.loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-xs text-center text-gray-400">
            By continuing, you agree to our{" "}
            <span className="font-medium text-gray-500">Terms</span> and{" "}
            <span className="font-medium text-gray-500">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
