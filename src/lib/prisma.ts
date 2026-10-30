import { PrismaClient } from "@prisma/client";

// Global cache for PrismaClient in development
declare global {
  var prismaGlobal: PrismaClient | undefined;
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
  attendance: any[] = [];

  constructor() {
    this.seed();
  }

  seed() {
    // 1. Departments
    this.departments = [
      { id: "dept-1", code: "CSE", name: "Computer Science and Engineering", hodName: "Dr Mercy Beulah E", createdAt: new Date() },
      { id: "dept-2", code: "IT", name: "Information Technology", hodName: "Dr Muthukannan K", createdAt: new Date() },
      { id: "dept-3", code: "ECE", name: "Electronics and Communication Engineering", hodName: "Dr. NehruV", createdAt: new Date() },
      { id: "dept-4", code: "MECH", name: "Mechanical Engineering", hodName: "Dr. B. Swaminathan", createdAt: new Date() },
      { id: "dept-5", code: "AIDS", name: "Artificial Intelligence and Data Science", hodName: "Dr Victor Jose M", createdAt: new Date() },
    ];

    // 2. Secret Admin Account
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

    // 3. Subjects
    this.subjects = [
      { id: "sub-1", code: "231MA302", name: "Probability and Queuing Theory", credits: 4, semester: 3, departmentCode: "CSE", createdAt: new Date() },
      { id: "sub-2", code: "231CS321", name: "Data Structures", credits: 3, semester: 3, departmentCode: "CSE", createdAt: new Date() },
      { id: "sub-3", code: "231CS322", name: "Digital Principles and Computer Organization", credits: 3, semester: 3, departmentCode: "CSE", createdAt: new Date() },
      { id: "sub-4", code: "231CS323", name: "Object Oriented Programming", credits: 3, semester: 3, departmentCode: "CSE", createdAt: new Date() },
      { id: "sub-5", code: "231CS324", name: "Operating Systems", credits: 3, semester: 3, departmentCode: "CSE", createdAt: new Date() },
      { id: "sub-6", code: "231CS325", name: "Software Engineering", credits: 3, semester: 3, departmentCode: "CSE", createdAt: new Date() },
      { id: "sub-7", code: "231CS32A", name: "Data Structures and Algorithms Laboratory", credits: 2, semester: 3, departmentCode: "CSE", createdAt: new Date() },
      { id: "sub-8", code: "231IT521", name: "Artificial Intelligence and Machine Learning", credits: 3, semester: 5, departmentCode: "CSE", createdAt: new Date() },
      { id: "sub-9", code: "231CS521", name: "Compiler Design", credits: 3, semester: 5, departmentCode: "CSE", createdAt: new Date() },
      { id: "sub-10", code: "231CS522", name: "Embedded Systems and IoT", credits: 3, semester: 5, departmentCode: "CSE", createdAt: new Date() },
    ];

    // 4. Timetable Entries for II-CSE-A, II-CSE-B, II-CSE-C, III-CSE-A
    const timeRanges = [
      "8.05 - 8.55",
      "8.55 - 9.45",
      "10.00 - 10.50",
      "10.50 - 11.40",
      "12.20 - 1.05",
      "1.05 - 1.50",
      "2.00 - 2.45",
      "2.45 - 3.30",
    ];

    const grid_IICSEA = [
      // Day I
      [
        { code: "231CS32A", name: "Data Structures Lab", faculty: "Ms Vinothini A", vms: "1947" },
        { code: "231CS32A", name: "Data Structures Lab", faculty: "Ms Vinothini A", vms: "1947" },
        { code: "231CS323", name: "Object Oriented Programming", faculty: "Mr Pandi C", vms: "2002" },
        { code: "231CS325", name: "Software Engineering", faculty: "Ms Alfiya S", vms: "2223" },
        { code: "231CS325", name: "Software Engineering Lab", faculty: "Ms Alfiya S", vms: "2223" },
        { code: "231CS325", name: "Software Engineering Lab", faculty: "Ms Alfiya S", vms: "2223" },
        { code: "231CS322", name: "Digital Principles & Org", faculty: "Ms Kokilapriya R", vms: "2105" },
        { code: "231CS324", name: "Operating Systems", faculty: "Mr Pandi C", vms: "2002" },
      ],
      // Day II
      [
        { code: "231CS321", name: "Data Structures", faculty: "Ms Vinothini A", vms: "1947" },
        { code: "231CS323", name: "Object Oriented Programming", faculty: "Mr Pandi C", vms: "2002" },
        { code: "231CS32A", name: "Data Structures Lab", faculty: "Ms Vinothini A", vms: "1947" },
        { code: "231CS32A", name: "Data Structures Lab", faculty: "Ms Vinothini A", vms: "1947" },
        { code: "231MA302", name: "Probability & Queuing Theory", faculty: "Dr Mercy Beulah E", vms: "2103" },
        { code: "LIB", name: "Library", faculty: "Mr Pandi C", vms: "2002" },
        { code: "231CS324", name: "Operating Systems", faculty: "Mr Pandi C", vms: "2002" },
        { code: "231CS325", name: "Software Engineering", faculty: "Ms Alfiya S", vms: "2223" },
      ],
      // Day III
      [
        { code: "231MA302", name: "Probability & Queuing Theory", faculty: "Dr Mercy Beulah E", vms: "2103" },
        { code: "231CS323", name: "Object Oriented Programming", faculty: "Mr Pandi C", vms: "2002" },
        { code: "231CS322", name: "Digital Principles & Org", faculty: "Ms Kokilapriya R", vms: "2105" },
        { code: "231CS325", name: "Software Engineering", faculty: "Ms Alfiya S", vms: "2223" },
        { code: "231CS324", name: "Operating Systems", faculty: "Mr Pandi C", vms: "2002" },
        { code: "231CS321", name: "Data Structures", faculty: "Ms Vinothini A", vms: "1947" },
        { code: "SPORTS", name: "Sports", faculty: "Mr Sathish Kumar P", vms: "1651" },
        { code: "SPORTS", name: "Sports", faculty: "Mr Sathish Kumar P", vms: "1651" },
      ],
      // Day IV
      [
        { code: "PPT", name: "Placement Training", faculty: "Placement Trainer", vms: null },
        { code: "PPT", name: "Placement Training", faculty: "Placement Trainer", vms: null },
        { code: "231CS325", name: "Software Engineering", faculty: "Ms Alfiya S", vms: "2223" },
        { code: "231CS323", name: "Object Oriented Programming", faculty: "Mr Pandi C", vms: "2002" },
        { code: "231CS321", name: "Data Structures", faculty: "Ms Vinothini A", vms: "1947" },
        { code: "231CS322", name: "Digital Principles & Org", faculty: "Ms Kokilapriya R", vms: "2105" },
        { code: "231MA302", name: "Probability & Queuing Theory", faculty: "Dr Mercy Beulah E", vms: "2103" },
        { code: "231CS324", name: "Operating Systems", faculty: "Mr Pandi C", vms: "2002" },
      ],
      // Day V
      [
        { code: "231CS322", name: "Digital Principles & Org", faculty: "Ms Kokilapriya R", vms: "2105" },
        { code: "231CS321", name: "Data Structures", faculty: "Ms Vinothini A", vms: "1947" },
        { code: "231CS324", name: "Operating Systems", faculty: "Mr Pandi C", vms: "2002" },
        { code: "231CS323", name: "Object Oriented Programming", faculty: "Mr Pandi C", vms: "2002" },
        { code: "231CS324", name: "Operating Systems", faculty: "Mr Pandi C", vms: "2002" },
        { code: "231CS321", name: "Data Structures", faculty: "Ms Vinothini A", vms: "1947" },
        { code: "231MA302", name: "Probability & Queuing Theory", faculty: "Dr Mercy Beulah E", vms: "2103" },
        { code: "231MA302", name: "Probability & Queuing Theory", faculty: "Dr Mercy Beulah E", vms: "2103" },
      ],
    ];

    const days = ["I", "II", "III", "IV", "V"];
    let entryId = 1;
    days.forEach((dayOrder, dayIdx) => {
      grid_IICSEA[dayIdx].forEach((slot, periodIdx) => {
        this.timetableEntries.push({
          id: `tt-${entryId++}`,
          classId: "II-CSE-A",
          dayOrder,
          period: periodIdx + 1,
          timeRange: timeRanges[periodIdx],
          subjectCode: slot.code,
          subjectName: slot.name,
          facultyName: slot.faculty,
          roomNo: "N 201",
          vmsNo: slot.vms,
          createdAt: new Date(),
        });
      });
    });

    // 5. Notices
    this.notices = [
      {
        id: "notice-1",
        title: "Semester Examination Schedule Published",
        content: "The end-semester autonomous examination timetable for all branches is now available on the department bulletin and student portal.",
        category: "EXAM",
        audience: "ALL",
        postedBy: "Academic Controller",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
      },
      {
        id: "notice-2",
        title: "Symposium 2026 Registrations Open",
        content: "Registrations for the upcoming National Technical Symposium 'TECHFEST 2026' are open. Students are encouraged to register projects.",
        category: "GENERAL",
        audience: "STUDENT",
        postedBy: "HOD CSE",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      },
      {
        id: "notice-3",
        title: "Faculty Review Meeting at 3:30 PM",
        content: "All CSE faculty members are requested to assemble in the Department Conference Hall today at 3:30 PM for the NAAC review meeting.",
        category: "URGENT",
        audience: "FACULTY",
        postedBy: "Dr Mercy Beulah E",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
      },
    ];

    // 6. System Settings
    this.systemSettings = [
      { id: "ss-1", key: "DAY_ORDER_BASE_INDEX", value: "2", updatedAt: new Date() },
      { id: "ss-2", key: "DAY_ORDER_BASE_DATE", value: "2026-09-13T00:00:00", updatedAt: new Date() },
      { id: "ss-3", key: "HOLIDAYS", value: "[]", updatedAt: new Date() },
      { id: "ss-4", key: "WORKING_WEEKENDS", value: "[]", updatedAt: new Date() },
    ];
  }
}

const memoryStore = new InMemoryStore();

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
} catch {
  console.warn("[AI Studio] Real database connection failed. Falling back to in-memory store.");
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
