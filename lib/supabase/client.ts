import { createClient as createSupabaseClient, SupabaseClient, User, Session, AuthChangeEvent } from "@supabase/supabase-js";
import { Database, Profile } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const isRealSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith("http") &&
  !supabaseUrl.includes("your-project.supabase.co") &&
  !supabaseAnonKey.includes("your-anon-key")
);

// In-browser mock storage keys
const STORAGE_PREFIX = "ascend_supabase_";
const USERS_KEY = `${STORAGE_PREFIX}users`;
const CURRENT_SESSION_KEY = `${STORAGE_PREFIX}current_session`;

interface StoredUserRecord {
  id: string;
  email: string;
  passwordHash: string;
  user_metadata: Record<string, any>;
  created_at: string;
}

// In-memory fallback for Node/SSR/Vitest testing environments
const inMemoryTables: Record<string, any[]> = {};
let inMemoryUsers: StoredUserRecord[] = [];
let inMemorySession: Session | null = null;

function getStoredUsers(): StoredUserRecord[] {
  if (typeof window === "undefined") return inMemoryUsers;
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : inMemoryUsers;
  } catch {
    return inMemoryUsers;
  }
}

function saveStoredUsers(users: StoredUserRecord[]) {
  inMemoryUsers = users;
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (err) {
    console.error("Failed to save users", err);
  }
}

function getStoredTable(tableName: string): any[] {
  if (typeof window === "undefined") return inMemoryTables[tableName] || [];
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}tbl_${tableName}`);
    return raw ? JSON.parse(raw) : (inMemoryTables[tableName] || []);
  } catch {
    return inMemoryTables[tableName] || [];
  }
}

function saveStoredTable(tableName: string, data: any[]) {
  inMemoryTables[tableName] = data;
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${STORAGE_PREFIX}tbl_${tableName}`, JSON.stringify(data));
  } catch (err) {
    console.error("Failed to save table data", err);
  }
}

function createMockSession(userRecord: StoredUserRecord): Session {
  const user: User = {
    id: userRecord.id,
    app_metadata: { provider: "email" },
    user_metadata: userRecord.user_metadata,
    aud: "authenticated",
    created_at: userRecord.created_at,
    email: userRecord.email,
    phone: "",
    role: "authenticated",
    updated_at: userRecord.created_at,
  };

  return {
    access_token: `mock_jwt_${userRecord.id}_${Date.now()}`,
    refresh_token: `mock_refresh_${userRecord.id}`,
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: "bearer",
    user,
  };
}

class MockQueryBuilder {
  private tableName: string;
  private filters: Array<{ col: string; op: "eq" | "neq" | "in"; val: any }> = [];
  private orderCol: string | null = null;
  private orderAsc: boolean = true;
  private limitCount: number | null = null;
  private isSingle: boolean = false;
  private mutationType: "select" | "insert" | "update" | "delete" = "select";
  private mutationPayload: any = null;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  select(columns: string = "*") {
    this.mutationType = "select";
    return this;
  }

  insert(values: any | any[]) {
    this.mutationType = "insert";
    this.mutationPayload = Array.isArray(values) ? values : [values];
    return this;
  }

  update(values: any) {
    this.mutationType = "update";
    this.mutationPayload = values;
    return this;
  }

  delete() {
    this.mutationType = "delete";
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push({ col: column, op: "eq", val: value });
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orderCol = column;
    this.orderAsc = options?.ascending !== false;
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  private applyFilters(items: any[]): any[] {
    return items.filter((item) => {
      for (const f of this.filters) {
        if (f.op === "eq" && item[f.col] !== f.val) return false;
      }
      return true;
    });
  }

  async then(resolve: (value: { data: any; error: any }) => void) {
    try {
      const items = getStoredTable(this.tableName);

      if (this.mutationType === "insert") {
        const toInsert = this.mutationPayload.map((val: any) => ({
          id: val.id || `mock_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
          created_at: val.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...val,
        }));
        const updated = [...items, ...toInsert];
        saveStoredTable(this.tableName, updated);
        const result = this.isSingle ? toInsert[0] : toInsert;
        resolve({ data: result, error: null });
        return;
      }

      if (this.mutationType === "update") {
        const filtered = this.applyFilters(items);
        const filteredIds = new Set(filtered.map((f) => f.id));
        const updated = items.map((item) => {
          if (filteredIds.has(item.id)) {
            return { ...item, ...this.mutationPayload, updated_at: new Date().toISOString() };
          }
          return item;
        });
        saveStoredTable(this.tableName, updated);
        const updatedItems = updated.filter((item) => filteredIds.has(item.id));
        resolve({ data: this.isSingle ? updatedItems[0] || null : updatedItems, error: null });
        return;
      }

      if (this.mutationType === "delete") {
        const filtered = this.applyFilters(items);
        const toDeleteIds = new Set(filtered.map((f) => f.id));
        const updated = items.filter((item) => !toDeleteIds.has(item.id));
        saveStoredTable(this.tableName, updated);
        resolve({ data: filtered, error: null });
        return;
      }

      // SELECT
      let result = this.applyFilters(items);
      if (this.orderCol) {
        result.sort((a, b) => {
          const valA = a[this.orderCol!];
          const valB = b[this.orderCol!];
          if (valA < valB) return this.orderAsc ? -1 : 1;
          if (valA > valB) return this.orderAsc ? 1 : -1;
          return 0;
        });
      }

      if (this.limitCount !== null) {
        result = result.slice(0, this.limitCount);
      }

      if (this.isSingle) {
        if (result.length === 0) {
          resolve({ data: null, error: { message: "Row not found", code: "PGRST116" } });
          return;
        }
        resolve({ data: result[0], error: null });
        return;
      }

      resolve({ data: result, error: null });
    } catch (err: any) {
      resolve({ data: null, error: { message: err?.message || "Storage error" } });
    }
  }
}

// In-browser mock storage manager
class MockStorageClient {
  from(bucket: string) {
    const bucketKey = `${STORAGE_PREFIX}storage_${bucket}`;
    return {
      upload: async (path: string, file: Blob | File | string) => {
        try {
          const existing = JSON.parse(localStorage.getItem(bucketKey) || "{}");
          existing[path] = {
            name: path,
            uploaded_at: new Date().toISOString(),
            size: typeof file === "string" ? file.length : (file as any).size || 0,
            type: typeof file === "string" ? "text/plain" : (file as any).type || "application/octet-stream",
          };
          localStorage.setItem(bucketKey, JSON.stringify(existing));
          return { data: { path }, error: null };
        } catch (err: any) {
          return { data: null, error: err };
        }
      },
      list: async (prefix?: string) => {
        try {
          const existing = JSON.parse(localStorage.getItem(bucketKey) || "{}");
          const items = Object.values(existing).filter((item: any) =>
            prefix ? item.name.startsWith(prefix) : true
          );
          return { data: items, error: null };
        } catch (err: any) {
          return { data: null, error: err };
        }
      },
      remove: async (paths: string[]) => {
        try {
          const existing = JSON.parse(localStorage.getItem(bucketKey) || "{}");
          for (const p of paths) {
            delete existing[p];
          }
          localStorage.setItem(bucketKey, JSON.stringify(existing));
          return { data: paths, error: null };
        } catch (err: any) {
          return { data: null, error: err };
        }
      },
      getPublicUrl: (path: string) => {
        return { data: { publicUrl: `mock://storage/${bucket}/${path}` } };
      },
      createSignedUrl: async (path: string, expiresIn: number) => {
        return { data: { signedUrl: `mock://storage/${bucket}/${path}?token=mock_sign` }, error: null };
      },
    };
  }
}

// In-browser mock auth provider
class MockAuthClient {
  private listeners: Array<(event: AuthChangeEvent, session: Session | null) => void> = [];

  constructor() {
    // Check if session exists in storage
  }

  private notify(event: AuthChangeEvent, session: Session | null) {
    for (const listener of this.listeners) {
      listener(event, session);
    }
  }

  async getSession(): Promise<{ data: { session: Session | null }; error: any }> {
    if (typeof window === "undefined") return { data: { session: null }, error: null };
    try {
      const raw = localStorage.getItem(CURRENT_SESSION_KEY);
      if (!raw) return { data: { session: null }, error: null };
      const session = JSON.parse(raw);
      return { data: { session }, error: null };
    } catch {
      return { data: { session: null }, error: null };
    }
  }

  async getUser(): Promise<{ data: { user: User | null }; error: any }> {
    const { data } = await this.getSession();
    return { data: { user: data.session?.user || null }, error: null };
  }

  async signUp({
    email,
    password,
    options,
  }: {
    email: string;
    password: string;
    options?: { data?: Record<string, any> };
  }): Promise<{ data: { user: User | null; session: Session | null }; error: any }> {
    const users = getStoredUsers();
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return {
        data: { user: null, session: null },
        error: { message: "User with this email already exists" },
      };
    }

    const newUser: StoredUserRecord = {
      id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      email,
      passwordHash: btoa(password),
      user_metadata: options?.data || {},
      created_at: new Date().toISOString(),
    };

    users.push(newUser);
    saveStoredUsers(users);

    // Also insert into profiles table
    const profiles = getStoredTable("profiles");
    const newProfile: Profile = {
      id: newUser.id,
      email: newUser.email,
      display_name: options?.data?.display_name || email.split("@")[0],
      institution: options?.data?.institution || "Unspecified Institution",
      course_program: options?.data?.course_program || null,
      graduation_year: options?.data?.graduation_year || null,
      date_of_birth: options?.data?.date_of_birth || null,
      enrollment_status: "pending",
      role: (options?.data?.role as any) || "student",
      created_at: newUser.created_at,
      updated_at: newUser.created_at,
    };
    profiles.push(newProfile);
    saveStoredTable("profiles", profiles);

    const session = createMockSession(newUser);
    localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(session));
    this.notify("SIGNED_IN", session);

    return { data: { user: session.user, session }, error: null };
  }

  async signInWithPassword({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<{ data: { user: User | null; session: Session | null }; error: any }> {
    const users = getStoredUsers();
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.passwordHash === btoa(password)
    );

    if (!user) {
      return {
        data: { user: null, session: null },
        error: { message: "Invalid email or password" },
      };
    }

    const session = createMockSession(user);
    localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(session));
    this.notify("SIGNED_IN", session);

    return { data: { user: session.user, session }, error: null };
  }

  async signOut(): Promise<{ error: any }> {
    if (typeof window !== "undefined") {
      localStorage.removeItem(CURRENT_SESSION_KEY);
    }
    this.notify("SIGNED_OUT", null);
    return { error: null };
  }

  async resetPasswordForEmail(email: string): Promise<{ data: any; error: any }> {
    const users = getStoredUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return { data: null, error: { message: "No account found with this email" } };
    }
    return { data: {}, error: null };
  }

  onAuthStateChange(
    callback: (event: AuthChangeEvent, session: Session | null) => void
  ): { data: { subscription: { unsubscribe: () => void } } } {
    this.listeners.push(callback);
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            this.listeners = this.listeners.filter((l) => l !== callback);
          },
        },
      },
    };
  }
}

// Universal Client Interface
class UniversalSupabaseClient {
  public auth: any;
  public storage: any;
  private isLive: boolean;
  private realClient: SupabaseClient<Database> | null = null;

  constructor() {
    this.isLive = isRealSupabaseConfigured;
    if (this.isLive) {
      this.realClient = createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey);
      this.auth = this.realClient.auth;
      this.storage = this.realClient.storage;
    } else {
      this.auth = new MockAuthClient();
      this.storage = new MockStorageClient();
    }
  }

  from(tableName: keyof Database["public"]["Tables"] | string): any {
    if (this.isLive && this.realClient) {
      return this.realClient.from(tableName as any);
    }
    return new MockQueryBuilder(tableName);
  }

  get isConfiguredLive(): boolean {
    return this.isLive;
  }
}

// Singleton client instance
export const supabase = new UniversalSupabaseClient();
