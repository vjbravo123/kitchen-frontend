"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { forgotPassword, resetPassword, clearError } from "@/lib/redux/slices/authSlice";
import { addToast } from "@/lib/redux/slices/uiSlice";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ChefHat, Lock, Mail, KeyRound, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [step, setStep] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());

    try {
      await dispatch(forgotPassword(email)).unwrap();
      setStep("reset");
      dispatch(
        addToast({
          type: "info",
          title: "Reset Code Sent",
          message: "If an account exists, a reset code has been generated.",
        })
      );
    } catch (err: any) {
      // Error
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());

    try {
      await dispatch(resetPassword({ email, otp, newPassword })).unwrap();
      dispatch(
        addToast({
          type: "success",
          title: "Password Updated",
          message: "You can now log in with your new password.",
        })
      );
      router.push("/login");
    } catch (err: any) {
      // Error
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#FAF6F0] relative overflow-hidden">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D97745] to-[#8B5E3C] text-white shadow-lg shadow-[#D97745]/20 mb-3">
            <ChefHat className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold font-heading text-[#2F2924] tracking-tight">
            {step === "request" ? "Reset Password" : "Set New Password"}
          </h1>
          <p className="text-sm text-[#766B62] mt-1">
            {step === "request"
              ? "Enter your registered email to receive a verification OTP."
              : `Enter the 6-digit code sent to ${email}`}
          </p>
        </div>

        <div className="bg-white border border-[#EADBCE] rounded-3xl p-6 sm:p-8 shadow-xl shadow-[#8B5E3C]/5">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-[#FEF4F2] border border-[#D97745]/30 text-xs text-[#9C3825]">
              {error}
            </div>
          )}

          {step === "request" ? (
            <form onSubmit={handleRequestOtp} className="flex flex-col gap-4">
              <Input
                label="Registered Email"
                type="email"
                placeholder="chef@kitchen.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                icon={<Mail className="w-4 h-4" />}
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="mt-2 w-full text-base font-semibold"
              >
                Send Reset Code
              </Button>
            </form>
          ) : (
            <form onSubmit={handleReset} className="flex flex-col gap-4">
              <Input
                label="6-Digit Verification Code"
                type="text"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.trim())}
                maxLength={6}
                required
                icon={<KeyRound className="w-4 h-4" />}
              />

              <Input
                label="New Password"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                icon={<Lock className="w-4 h-4" />}
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="mt-2 w-full text-base font-semibold"
              >
                Save New Password
              </Button>
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-[#F2EAE0] text-center text-xs text-[#766B62]">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 font-semibold text-[#D97745] hover:text-[#C56434]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
