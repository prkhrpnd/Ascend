"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "./client";
import { Profile } from "./types";

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  isLiveDb: boolean;
  signUp: (params: {
    email: string;
    password: string;
    displayName: string;
    institution: string;
    courseProgram?: string;
    graduationYear?: number;
    dateOfBirth?: string;
  }) => Promise<{ error: any }>;
  signIn: (params: { email: string; password: string }) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
  deleteAccount: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error loading user profile:", error);
      }
      if (data) {
        setProfile(data as Profile);
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function initSession() {
      try {
        const { data } = await supabase.auth.getSession();
        if (mounted) {
          if (data.session) {
            setSession(data.session);
            setUser(data.session.user);
            await fetchProfile(data.session.user.id);
          } else {
            setSession(null);
            setUser(null);
            setProfile(null);
          }
        }
      } catch (err) {
        console.error("Session initialization error:", err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    initSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event: string, currentSession: Session | null) => {
        if (!mounted) return;
        setSession(currentSession);
        setUser(currentSession?.user || null);
        if (currentSession?.user) {
          await fetchProfile(currentSession.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [fetchProfile]);

  const signUp = async ({
    email,
    password,
    displayName,
    institution,
    courseProgram,
    graduationYear,
    dateOfBirth,
  }: {
    email: string;
    password: string;
    displayName: string;
    institution: string;
    courseProgram?: string;
    graduationYear?: number;
    dateOfBirth?: string;
  }) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
            institution,
            course_program: courseProgram,
            graduation_year: graduationYear,
            date_of_birth: dateOfBirth,
          },
        },
      });

      if (error) {
        setLoading(false);
        return { error };
      }

      if (data.user) {
        // Ensure profile record is inserted if not automatically by trigger
        const profileRecord: Partial<Profile> = {
          id: data.user.id,
          email: data.user.email || email,
          display_name: displayName,
          institution,
          course_program: courseProgram || null,
          graduation_year: graduationYear || null,
          date_of_birth: dateOfBirth || null,
          enrollment_status: "pending",
          role: "student",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        await supabase.from("profiles").insert(profileRecord);
        await fetchProfile(data.user.id);
      }

      setLoading(false);
      return { error: null };
    } catch (err: any) {
      setLoading(false);
      return { error: err };
    }
  };

  const signIn = async ({ email, password }: { email: string; password: string }) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setLoading(false);
        return { error };
      }

      if (data.user) {
        await fetchProfile(data.user.id);
      }
      setLoading(false);
      return { error: null };
    } catch (err: any) {
      setLoading(false);
      return { error: err };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: { message: "User not authenticated" } };
    try {
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

      if (!error) {
        await fetchProfile(user.id);
      }
      return { error };
    } catch (err: any) {
      return { error: err };
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const deleteAccount = async () => {
    if (!user) return { error: { message: "User not authenticated" } };
    try {
      // Delete user scoped records in order
      await supabase.from("transactions").delete().eq("user_id", user.id);
      await supabase.from("statement_uploads").delete().eq("user_id", user.id);
      await supabase.from("bank_connections").delete().eq("user_id", user.id);
      await supabase.from("consents").delete().eq("user_id", user.id);
      await supabase.from("financial_analyses").delete().eq("user_id", user.id);
      await supabase.from("credit_simulations").delete().eq("user_id", user.id);
      await supabase.from("repayment_records").delete().eq("user_id", user.id);
      await supabase.from("report_shares").delete().eq("user_id", user.id);
      await supabase.from("profiles").delete().eq("id", user.id);

      await signOut();
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        isLiveDb: supabase.isConfiguredLive,
        signUp,
        signIn,
        signOut,
        updateProfile,
        refreshProfile,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
