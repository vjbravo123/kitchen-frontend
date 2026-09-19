"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { login, clearError } from "@/lib/redux/slices/authSlice";
import { addToast } from "@/lib/redux/slices/uiSlice";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ChefHat, Lock, Mail, Sparkles, Utensils, Check } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());

    try {
      await dispatch(login({ email, password })).unwrap();
      dispatch(
        addToast({
          type: "success",
          title: "Welcome Back, Chef!",
          message: "Signed in successfully. Your kitchen is ready.",
        })
      );
      router.push("/");
    } catch (err: any) {
      // Error handled by Redux state
    }
  };

  const fillDemoCredentials = () => {
    setEmail("demo@kitchen.test");
    setPassword("Demo@1234");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#FAF6F0] relative overflow-hidden">
      {/* Decorative Warm Shapes */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#E7B86A]/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-[#D97745]/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D97745] to-[#8B5E3C] text-white shadow-lg shadow-[#D97745]/20 mb-4">
            <ChefHat className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[#2F2924] tracking-tight">
            Kitchen Math & Costing
          </h1>
          <p className="text-sm text-[#766B62] mt-1">
            Sign in to manage recipes, calculate exact batch costs & track pantry stock.
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-white border border-[#EADBCE] rounded-3xl p-6 sm:p-8 shadow-xl shadow-[#8B5E3C]/5 relative">
          {/* Quick Demo Pill */}
          <div className="mb-6 p-3.5 rounded-2xl bg-[#FEF9F0] border border-[#E7B86A]/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D97745] shrink-0" />
              <div className="text-xs">
                <span className="font-semibold text-[#2F2924]">Quick Evaluation: </span>
                <span className="text-[#766B62]">Pre-seeded demo kitchen</span>
              </div>
            </div>
            <Button
              type="button"
              variant="honey"
              size="sm"
              onClick={fillDemoCredentials}
              className="text-xs h-7 px-2.5 rounded-lg"
            >
              Fill Demo
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="p-3.5 rounded-xl bg-[#FEF4F2] border border-[#D97745]/30 text-xs text-[#9C3825]">
                {error}
              </div>
            )}

            <Input
              label="Email Address"
              type="email"
              placeholder="chef@kitchen.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              icon={<Mail className="w-4 h-4" />}
            />

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-[#594E46] uppercase tracking-wider">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-[#D97745] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                icon={<Lock className="w-4 h-4" />}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="mt-2 w-full text-base font-semibold"
            >
              Sign In to Kitchen
            </Button>
          </form>

          {/* Footer Register Link */}
          <div className="mt-6 pt-5 border-t border-[#F2EAE0] text-center text-xs text-[#766B62]">
            Don&apos;t have an artisan account yet?{" "}
            <Link
              href="/register"
              className="font-semibold text-[#D97745] hover:text-[#C56434] underline underline-offset-4"
            >
              Create Kitchen Account
            </Link>
          </div>
        </div>

        {/* Friendly Kitchen Guarantee */}
        <p className="text-center text-xs text-[#8C8075] mt-6 flex items-center justify-center gap-1.5">
          <span>🍂 Warm, friendly & homely — designed for people who cook with passion.</span>
        </p>
      </div>
    </div>
  );
}
