"use client";

import { create } from "zustand";
import type { User } from "../../../entities/user/model/types";
import {
  postEmailLogin,
  postEmailRegister,
  postSessionLogin,
  postLogout,
  getMe,
} from "../../../shared/lib/api";
import { auth, loginWithGoogle } from "../../../shared/lib/firebase";
import { signOut } from "firebase/auth";
import { toast } from "../../../shared/hooks/use-toast";

const getErr = (e: any) =>
  e?.response?.data?.detail?.error?.message ??
  e?.response?.data?.detail?.message ??
  e?.response?.data?.error?.message ??
  e?.response?.data?.message ??
  e?.message ??
  "Unexpected error";

interface AuthState {
  user: User | null;
  loading: boolean;
  error?: string;
  loginEmail: (form: { email: string; password: string }) => Promise<void>;
  registerEmail: (form: {
    email: string;
    password: string;
    displayName?: string;
  }) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  fetchMe: () => Promise<void>;
  logout: () => Promise<void>;
  clearAuth: () => void;
  setError: (error: string) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  error: undefined,

  loginEmail: async (form) => {
    set({ loading: true, error: undefined });
    console.log("[auth] loginEmail start", form.email);
    try {
      const res = await postEmailLogin(form);
      console.log("[auth] loginEmail response:", res);

      await get().fetchMe();
      set({ error: undefined });
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
    } catch (e: any) {
      console.error("[auth] loginEmail error:", e);
      const msg = getErr(e) || "Login failed";
      set({ error: msg });
      toast({ variant: "destructive", title: "Login failed", description: msg });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  registerEmail: async (form) => {
    set({ loading: true, error: undefined });
    console.log("[auth] registerEmail start", form.email);
    try {
      const res = await postEmailRegister(form);
      console.log("[auth] registerEmail response:", res);

      await get().fetchMe();
      set({ error: undefined });
      toast({
        title: "Account created!",
        description: "Welcome to PromoBuilder. Let's get started!",
      });
    } catch (e: any) {
      console.error("[auth] registerEmail error:", e);
      const msg = getErr(e) || "Registration failed";
      set({ error: msg });
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: msg,
      });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  loginWithGoogle: async () => {
    set({ loading: true, error: undefined });
    console.log("[auth] loginWithGoogle start");
    try {
      const idToken = await loginWithGoogle();
      console.log("[auth] Google idToken:", idToken?.slice?.(0, 12), "...");

      const res = await postSessionLogin({ id_token: idToken });
      console.log("[auth] session/login response:", res);

      await get().fetchMe();
      set({ error: undefined });
      toast({
        title: "Welcome!",
        description: "You have successfully signed in with Google.",
      });
    } catch (e: any) {
      console.error("[auth] loginWithGoogle error:", e);
      const msg = getErr(e) || "Google login failed";
      set({ error: msg });
      toast({
        variant: "destructive",
        title: "Google login failed",
        description: msg,
      });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  fetchMe: async () => {
    set({ loading: true, error: undefined });
    console.log("[auth] fetchMe start");
    try {
      const userData = await getMe(); // null si 401
      console.log("[auth] fetchMe response:", userData);
      set({ user: userData ?? null });
    } catch (e: any) {
      const status = e?.response?.status;
      console.error("[auth] fetchMe error:", e?.response || e);
      if (status === 401) {
        console.log("[auth] fetchMe → 401, setting user = null");
        set({ user: null });
      } else {
        set({ error: getErr(e) || "Failed to fetch user" });
      }
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    set({ loading: true });
    console.log("[auth] logout start");
    try {
      const res = await postLogout();
      console.log("[auth] logout response:", res);

      try {
        await signOut(auth);
        console.log("[auth] Firebase signOut done");
      } catch (err) {
        console.warn("[auth] Firebase signOut failed", err);
      }

      set({ user: null, error: undefined });
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (e) {
      console.error("[auth] logout error:", e);
    } finally {
      set({ loading: false });
    }
  },

  clearAuth: () => {
    console.log("[auth] clearAuth");
    set({ user: null, error: undefined });
  },

  setError: (error: string) => {
    console.log("[auth] setError:", error);
    set({ error });
  },

  clearError: () => {
    console.log("[auth] clearError");
    set({ error: undefined });
  },
}));
