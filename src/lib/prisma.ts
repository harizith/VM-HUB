import { PrismaClient } from "@prisma/client";

// Global cache for PrismaClient in development
declare global {
  var prismaGlobal: PrismaClient | undefined;
  var memoryStoreGlobal: InMemoryStore | undefined;
}

// In-Memory Database Store for environments without direct PostgreSQL access
class InMemoryStore {
  users: any[] = [];
  userModes: any[] = [];
  studentProfiles: any[] = [];
  facultyProfiles: any[] = [];
  hodProfiles: any[] = [];
  departments: any[] = [];
  subjects: any[] = [];
  notices: any[] = [];
  systemSettings: any[] = [];
  auditLogs: any[] = [];
  timetableEntries: any[] = [];
  timetableHistory: any[] = [];
  attendance: any[] = [];

  constructor() {
    this.seed();
  }

  seed() {
    // 1. Departments - Empty (only user-created departments will exist)
    this.departments = [];

    // 2. Secret Admin Account ONLY
    const secretAdmin = {
      id: "admin-secret-root",
      vmNo: "ADM-SECRET-01",
      email: "admin@vtmt.org",
      name: "System Administrator",
      password: "$2a$10$wK1Ww8zJ0q6bH5yN.Gj2A.6sXG.u/9f8c6jR7m5g2L0p1y3x4z5a6", // administrator
      role: "ADMIN",
      status: "ACTIVE",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users = [secretAdmin];
    this.userModes = [
      { vmno: "ADM-SECRET-01", emailid: "admin@vtmt.org", password: "administrator", usermode: "ADMIN", createdAt: new Date() },
    ];
    this.studentProfiles = [];
    this.facultyProfiles = [];
    this.hodProfiles = [];

    // 3. Subjects - Empty
    this.subjects = [];

    // 4. Timetable Entries - Empty
    this.timetableEntries = [];

    // 5. Notices - Empty
    this.notices = [];

    // 6. System Settings
    this.systemSettings = [
      { id: "ss-1", key: "DAY_ORDER_BASE_INDEX", value: "2", updatedAt: new Date() },
      { id: "ss-2", key: "DAY_ORDER_BASE_DATE", value: "2026-09-13T00:00:00", updatedAt: new Date() },
      { id: "ss-3", key: "HOLIDAYS", value: "[]", updatedAt: new Date() },
      { id: "ss-4", key: "WORKING_WEEKENDS", value: "[]", updatedAt: new Date() },
    ];
  }
}

const memoryStore = globalThis.memoryStoreGlobal ?? new InMemoryStore();
if (process.env.NODE_ENV !== "production") {
  globalThis.memoryStoreGlobal = memoryStore;
}

// Helper to filter array by Prisma-style where clause
function matchWhere(item: any, where?: any): boolean {
  if (!where) return true;
  for (const [key, cond] of Object.entries(where)) {
    if (key === "OR" && Array.isArray(cond)) {
      const orMatched = cond.some((subCond) => matchWhere(item, subCond));
      if (!orMatched) return false;
      continue;
    }
    if (key === "AND" && Array.isArray(cond)) {
      const andMatched = cond.every((subCond) => matchWhere(item, subCond));
      if (!andMatched) return false;
      continue;
    }
    if (cond && typeof cond === "object") {
      const c = cond as any;
      const val = item[key];
      if (c.equals !== undefined) {
        if (c.mode === "insensitive") {
          if (String(val).toLowerCase() !== String(c.equals).toLowerCase()) return false;
        } else if (val !== c.equals) {
          return false;
        }
      }
      if (c.contains !== undefined) {
        const needle = String(c.contains).toLowerCase();
        const haystack = String(val || "").toLowerCase();
        if (!haystack.includes(needle)) return false;
      }
      if (c.in !== undefined && Array.isArray(c.in)) {
        if (!c.in.includes(val)) return false;
      }
    } else {
      if (item[key] !== cond) return false;
    }
  }
  return true;
}

// Generate in-memory model handlers
function createModelHandler(collectionName: keyof InMemoryStore) {
  const getList = (): any[] => (memoryStore as any)[collectionName] || [];

  return {
    findMany: async (args?: any) => {
      let results = getList().filter((item) => matchWhere(item, args?.where));
      // Populate relations if requested
      if (collectionName === "users") {
        results = results.map((u) => ({
          ...u,
          studentProfile: memoryStore.studentProfiles.find((sp) => sp.userEmail === u.email) || null,
          facultyProfile: memoryStore.facultyProfiles.find((fp) => fp.vmNo === u.vmNo) || null,
          hodProfile: memoryStore.hodProfiles.find((hp) => hp.vmNo === u.vmNo) || null,
        }));
      }
      if (collectionName === "notices") {
        results = results.map((n) => {
          const author = n.authorId ? memoryStore.users.find((u) => u.id === n.authorId) : null;
          return {
            ...n,
            author: author ? { id: author.id, name: author.name, role: author.role, email: author.email } : null,
          };
        });
      }
      if (args?.distinct && Array.isArray(args.distinct)) {
        const seen = new Set<string>();
        results = results.filter((item) => {
          const key = args.distinct.map((k: string) => item[k]).join("|");
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      }
      if (args?.take && typeof args.take === "number") {
        results = results.slice(0, args.take);
      }
      return results;
    },

    findFirst: async (args?: any) => {
      let results = getList().filter((item) => matchWhere(item, args?.where));
      const found = results[0] || null;
      if (found && collectionName === "users") {
        return {
          ...found,
          studentProfile: memoryStore.studentProfiles.find((sp) => sp.userEmail === found.email) || null,
          facultyProfile: memoryStore.facultyProfiles.find((fp) => fp.vmNo === found.vmNo) || null,
          hodProfile: memoryStore.hodProfiles.find((hp) => hp.vmNo === found.vmNo) || null,
        };
      }
      return found;
    },

    findUnique: async (args?: any) => {
      let results = getList().filter((item) => matchWhere(item, args?.where));
      const found = results[0] || null;
      if (found && collectionName === "users") {
        return {
          ...found,
          studentProfile: memoryStore.studentProfiles.find((sp) => sp.userEmail === found.email) || null,
          facultyProfile: memoryStore.facultyProfiles.find((fp) => fp.vmNo === found.vmNo) || null,
          hodProfile: memoryStore.hodProfiles.find((hp) => hp.vmNo === found.vmNo) || null,
        };
      }
      return found;
    },

    create: async (args?: any) => {
      const item = { id: args?.data?.id || `id-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`, createdAt: new Date(), ...args?.data };
      getList().unshift(item);
      return item;
    },

    createMany: async (args?: any) => {
      const data = args?.data || [];
      const list = getList();
      data.forEach((d: any) => {
        list.push({ id: d.id || `id-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`, createdAt: new Date(), ...d });
      });
      return { count: data.length };
    },

    update: async (args?: any) => {
      const list = getList();
      const idx = list.findIndex((item) => matchWhere(item, args?.where));
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...args?.data, updatedAt: new Date() };
        return list[idx];
      }
      return args?.data ?? {};
    },

    updateMany: async (args?: any) => {
      const list = getList();
      let count = 0;
      for (let i = 0; i < list.length; i++) {
        if (matchWhere(list[i], args?.where)) {
          list[i] = { ...list[i], ...args?.data, updatedAt: new Date() };
          count++;
        }
      }
      return { count };
    },

    delete: async (args?: any) => {
      const list = getList();
      const idx = list.findIndex((item) => matchWhere(item, args?.where));
      if (idx !== -1) {
        const removed = list.splice(idx, 1)[0];
        return removed;
      }
      return {};
    },

    deleteMany: async (args?: any) => {
      const list = getList();
      let count = 0;
      for (let i = list.length - 1; i >= 0; i--) {
        if (matchWhere(list[i], args?.where)) {
          list.splice(i, 1);
          count++;
        }
      }
      return { count };
    },

    upsert: async (args?: any) => {
      const list = getList();
      const idx = list.findIndex((item) => matchWhere(item, args?.where));
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...args?.update, updatedAt: new Date() };
        return list[idx];
      } else {
        const newItem = { id: `id-${Date.now()}`, createdAt: new Date(), ...args?.create };
        list.unshift(newItem);
        return newItem;
      }
    },

    count: async (args?: any) => {
      return getList().filter((item) => matchWhere(item, args?.where)).length;
    },
  };
}

const modelMapping: Record<string, keyof InMemoryStore> = {
  user: "users",
  userMode: "userModes",
  studentProfile: "studentProfiles",
  facultyProfile: "facultyProfiles",
  hodProfile: "hodProfiles",
  department: "departments",
  subject: "subjects",
  notice: "notices",
  systemSetting: "systemSettings",
  auditLog: "auditLogs",
  timetableEntry: "timetableEntries",
  timetableHistory: "timetableHistory",
  attendance: "attendance",
};

// Export in-memory store instance
export const inMemoryPrisma = new Proxy(
  {},
  {
    get: (_, prop: string) => {
      const collectionKey = modelMapping[prop] || (modelMapping[prop.toLowerCase()] as keyof InMemoryStore);
      if (collectionKey) {
        return createModelHandler(collectionKey);
      }
      return {
        findMany: async () => [],
        findFirst: async () => null,
        findUnique: async () => null,
        create: async (d: any) => d?.data ?? {},
        update: async (d: any) => d?.data ?? {},
        delete: async () => ({}),
        deleteMany: async () => ({ count: 0 }),
        updateMany: async () => ({ count: 0 }),
        upsert: async (d: any) => d?.create ?? {},
        count: async () => 0,
      };
    },
  }
) as unknown as PrismaClient;

// Format database URL with connection pooling and timeout settings
function getPooledDatabaseUrl(): string | undefined {
  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl || rawUrl.includes("localhost")) return rawUrl;

  try {
    const url = new URL(rawUrl);
    if (!url.searchParams.has("connection_limit")) {
      url.searchParams.set("connection_limit", "3");
    }
    if (!url.searchParams.has("pool_timeout")) {
      url.searchParams.set("pool_timeout", "20");
    }
    if (!url.searchParams.has("connect_timeout")) {
      url.searchParams.set("connect_timeout", "15");
    }
    if (url.port === "6543" && !url.searchParams.has("pgbouncer")) {
      url.searchParams.set("pgbouncer", "true");
    }
    return url.toString();
  } catch {
    return rawUrl;
  }
}

// Initialize native PrismaClient with global caching across all environments
let realPrisma: PrismaClient | null = null;
try {
  const pooledUrl = getPooledDatabaseUrl();
  if (pooledUrl && !pooledUrl.includes("localhost")) {
    realPrisma =
      globalThis.prismaGlobal ??
      new PrismaClient({
        datasources: {
          db: {
            url: pooledUrl,
          },
        },
      });
    globalThis.prismaGlobal = realPrisma;
  }
} catch (err: any) {
  console.warn("[AI Studio] Real database connection failed. Falling back to in-memory store. Error:", err?.message || err);
}

// Proxied prisma export: tries real prisma first if initialized, falls back to in-memory store seamlessly
export const prisma: PrismaClient = new Proxy(
  {},
  {
    get: (_, prop: string) => {
      if (prop === "$disconnect") {
        return async () => {};
      }
      if (prop === "$queryRaw" || prop === "$queryRawUnsafe") {
        return async (query: any) => {
          if (realPrisma) {
            try {
              return await (realPrisma as any)[prop](query);
            } catch {
              // fallback
            }
          }
          return [];
        };
      }
      if (prop === "$executeRaw" || prop === "$executeRawUnsafe") {
        return async (query: any) => {
          if (realPrisma) {
            try {
              return await (realPrisma as any)[prop](query);
            } catch {
              // fallback
            }
          }
          return 1;
        };
      }

      // Check model name
      const collectionKey = modelMapping[prop] || (modelMapping[prop.toLowerCase()] as keyof InMemoryStore);
      if (collectionKey) {
        const handler = createModelHandler(collectionKey);
        if (realPrisma && (realPrisma as any)[prop]) {
          return new Proxy((realPrisma as any)[prop], {
            get: (target, method: string) => {
              return async (...args: any[]) => {
                try {
                  const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("Supabase Database connection timed out after 15s")), 15000)
                  );
                  return await Promise.race([(target as any)[method](...args), timeoutPromise]);
                } catch (err: any) {
                  console.error(`[DB Query Error on ${String(prop)}.${method}]:`, err?.message || err);
                  // Only fallback if realPrisma is not available or explicitly disconnected
                  if (!process.env.DATABASE_URL) {
                    return (handler as any)[method](...args);
                  }
                  throw err;
                }
              };
            },
          });
        }
        return handler;
      }

      return {
        findMany: async () => [],
        findFirst: async () => null,
        findUnique: async () => null,
        create: async (d: any) => d?.data ?? {},
        update: async (d: any) => d?.data ?? {},
        delete: async () => ({}),
        deleteMany: async () => ({ count: 0 }),
        updateMany: async () => ({ count: 0 }),
        upsert: async (d: any) => d?.create ?? {},
        count: async () => 0,
      };
    },
  }
) as unknown as PrismaClient;

export default prisma;
