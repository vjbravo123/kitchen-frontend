"use client";

import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "@/lib/redux/store";
import { useAppDispatch } from "@/lib/redux/hooks";
import { getMe } from "@/lib/redux/slices/authSlice";
import ToastContainer from "@/components/ui/ToastContainer";

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const token = localStorage.getItem("kitchen_token");
    if (token) {
      dispatch(getMe());
    }
  }, [dispatch]);

  return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthInitializer>
        {children}
        <ToastContainer />
      </AuthInitializer>
    </Provider>
  );
}
