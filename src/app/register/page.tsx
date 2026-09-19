"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { register, verifyOtp, resendOtp, clearError } from "@/lib/redux/slices/authSlice";
import { addToast } from "@/lib/redux/slices/uiSlice";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ChefHat, Lock, Mail, User, Store, KeyRound, ArrowLeft } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading, error, otpPendingEmail } = useAppSelector((state) => state.auth);

  // Form State
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // OTP State
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [activeEmail, setActiveEmail] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());

    try {
      await dispatch(
        register({
          name,
          businessName,
          email,
          password,
        })
      ).unwrap();

      setActiveEmail(email);
      setOtpSent(true);
      dispatch(
        addToast({
          type: "info",
          title: "Verification Code Sent",
          message: `Please check your email (or backend console) for your 6-digit verification code.`,
        })
      );
    } catch (err: any) {
      // Error in Redux state
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());

    try {
      await dispatch(
        verifyOtp({
          email: activeEmail || otpPendingEmail || email,
          otp,
        })
      ).unwrap();

      dispatch(
        addToast({
          type: "success",
          title: "Account Activated!",
          message: "Welcome to Kitchen Math. Your workspace is ready.",
        })
      );
      router.push("/");
    } catch (err: any) {
      // Error in Redux state
    }
  };

  const handleResendOtp = async () => {
    try {
      await dispatch(resendOtp(activeEmail || email)).unwrap();
      dispatch(
        addToast({
          type: "success",
          title: "Code Resent",
          message: "A new OTP code has been dispatched.",
        })
      );
    } catch (err: any) {
      dispatch(
        addToast({
          type: "error",
          title: "Resend Failed",
          message: err || "Please wait for cooldown before requesting another OTP.",
        })
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#FAF6F0] relative overflow-hidden">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D97745] to-[#8B5E3C] text-white shadow-lg shadow-[#D97745]/20 mb-3">
            <ChefHat className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold font-heading text-[#2F2924] tracking-tight">
            {otpSent ? "Verify Your Email" : "Create Kitchen Account"}
          </h1>
          <p className="text-sm text-[#766B62] mt-1">
            {otpSent
              ? `We sent a 6-digit security code to ${activeEmail}`
              : "Set up your bakery, cafe or home kitchen workspace."}
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-white border border-[#EADBCE] rounded-3xl p-6 sm:p-8 shadow-xl shadow-[#8B5E3C]/5">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-[#FEF4F2] border border-[#D97745]/30 text-xs text-[#9C3825]">
              {error}
            </div>
          )}

          {!otpSent ? (
            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              <Input
                label="Chef / Owner Name"
                placeholder="e.g. Maria Rossi"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                icon={<User className="w-4 h-4" />}
              />

              <Input
                label="Kitchen / Business Name"
                placeholder="e.g. Maria's Artisan Bakes"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
                icon={<Store className="w-4 h-4" />}
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="maria@bakes.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                icon={<Mail className="w-4 h-4" />}
              />

              <Input
                label="Password (min 8 chars, 1 number, 1 upper)"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                Register & Send Code
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
              <div className="p-3 bg-[#FEF9F0] border border-[#E7B86A]/40 rounded-xl text-xs text-[#8C601E]">
                💡 In development mode, the OTP is printed directly in the backend terminal logs.
              </div>

              <Input
                label="6-Digit Verification Code"
                type="text"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.trim())}
                maxLength={6}
                required
                icon={<KeyRound className="w-4 h-4" />}
                className="text-center tracking-widest text-lg font-bold font-mono"
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="mt-2 w-full text-base font-semibold"
              >
                Activate Account & Enter
              </Button>

              <div className="flex items-center justify-between text-xs text-[#766B62] pt-3">
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="flex items-center gap-1 hover:text-[#2F2924]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Change Email</span>
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="font-semibold text-[#D97745] hover:underline"
                >
                  Resend OTP
                </button>
              </div>
            </form>
          )}

          {/* Footer Sign-in Link */}
          <div className="mt-6 pt-5 border-t border-[#F2EAE0] text-center text-xs text-[#766B62]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-[#D97745] hover:text-[#C56434] underline underline-offset-4"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
