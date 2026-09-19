"use client";

import React, { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { updateProfile, changePassword } from "@/lib/redux/slices/authSlice";
import { addToast } from "@/lib/redux/slices/uiSlice";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { formatDate } from "@/lib/utils";
import { apiClient } from "@/lib/api/client";
import {
  Settings,
  User,
  Store,
  Phone,
  Lock,
  HeartPulse,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const { vendor } = useAppSelector((state) => state.auth);

  // Profile Form
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [currency, setCurrency] = useState("₹");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password Form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Backend Health
  const [healthData, setHealthData] = useState<{
    status: string;
    database: string;
    uptimeSeconds: number;
  } | null>(null);
  const [isHealthLoading, setIsHealthLoading] = useState(false);

  useEffect(() => {
    if (vendor) {
      setName(vendor.name || "");
      setBusinessName(vendor.businessName || "");
      setPhone(vendor.phone || "");
      setCurrency(vendor.currency || "₹");
    }
  }, [vendor]);

  useEffect(() => {
    fetchHealth();
  }, []);

  const fetchHealth = async () => {
    setIsHealthLoading(true);
    try {
      const res = await apiClient.get("/health");
      setHealthData(res.data.data);
    } catch {
      setHealthData(null);
    } finally {
      setIsHealthLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      await dispatch(
        updateProfile({
          name,
          businessName,
          phone: phone || undefined,
          currency: currency || "₹",
        })
      ).unwrap();

      dispatch(
        addToast({
          type: "success",
          title: "Profile Updated",
          message: "Your kitchen details have been updated.",
        })
      );
    } catch (err: any) {
      dispatch(addToast({ type: "error", title: "Update Failed", message: err }));
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingPassword(true);
    try {
      await dispatch(changePassword({ currentPassword, newPassword })).unwrap();
      dispatch(
        addToast({
          type: "success",
          title: "Password Changed",
          message: "Your login credentials have been updated.",
        })
      );
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      dispatch(addToast({ type: "error", title: "Change Password Failed", message: err }));
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <AppShell>
      <div className="flex flex-col gap-6 pb-16 max-w-4xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[#2F2924] tracking-tight">
            Kitchen Settings & Profile
          </h1>
          <p className="text-sm text-[#766B62] mt-1">
            Manage your artisan profile, password security, currency preferences and system status.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* 1. Vendor Profile */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Kitchen Profile & Business Details</CardTitle>
                <CardDescription>Displayed on recipe sheets and batch production logs</CardDescription>
              </div>
              <Badge variant="success" size="md">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Chef</span>
              </Badge>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Chef / Owner Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    icon={<User className="w-4 h-4" />}
                  />

                  <Input
                    label="Kitchen / Business Name"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    required
                    icon={<Store className="w-4 h-4" />}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Email Address"
                    value={vendor?.email || ""}
                    disabled
                    helper="Email cannot be changed"
                  />

                  <Input
                    label="Phone / Mobile"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    icon={<Phone className="w-4 h-4" />}
                  />

                  <Input
                    label="Currency Symbol"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    helper="Default: ₹ (Rupees)"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" variant="primary" isLoading={isUpdatingProfile}>
                    Save Profile Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* 2. Security & Password */}
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Ensure your kitchen account uses a secure pass phrase</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Current Password"
                    type="password"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    icon={<Lock className="w-4 h-4" />}
                  />

                  <Input
                    label="New Password"
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    icon={<Lock className="w-4 h-4" />}
                    helper="Minimum 8 characters with 1 number and 1 capital"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" variant="outline" isLoading={isUpdatingPassword}>
                    Update Password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* 3. Backend System Health Monitor */}
          <Card className="border-[#EADBCE] bg-[#FDFBF7]">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2 text-[#8B5E3C]">
                <HeartPulse className="w-5 h-5 text-[#6F8F5F]" />
                <CardTitle>Backend & Database Health</CardTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchHealth}
                isLoading={isHealthLoading}
                className="text-xs h-7 px-2.5"
              >
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              {healthData ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-white border border-[#EADBCE]">
                    <span className="text-[#766B62] block">NestJS Service API:</span>
                    <div className="flex items-center gap-1.5 mt-1 font-bold text-[#6F8F5F] text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{healthData.status.toUpperCase()}</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-[#EADBCE]">
                    <span className="text-[#766B62] block">MongoDB Connection:</span>
                    <div className="flex items-center gap-1.5 mt-1 font-bold text-[#6F8F5F] text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{healthData.database.toUpperCase()}</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-[#EADBCE]">
                    <span className="text-[#766B62] block">Server Uptime:</span>
                    <div className="mt-1 font-bold text-[#2F2924] text-sm">
                      {Math.floor(healthData.uptimeSeconds / 60)} min {healthData.uptimeSeconds % 60} sec
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[#FEF4F2] border border-[#D97745]/30 text-xs text-[#9C3825] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>Cannot reach backend service on http://localhost:5000/api/health</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
