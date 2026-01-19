# Bknd v0.20.0 API Verification Results

## Critical Issues Found

### 1. ❌ `primary` field type NOT exported
**Location:** `plugins/bknd-skills/skills/data-schema/SKILL.md:61`

**Incorrect code shown:**
```typescript
import { primary } from "bknd";

entity("users", {
  id: primary({ format: "uuid" }), // ERROR: primary is not exported
  email: text().required(),
})
```

**What actually exists:**
- `PrimaryField` class is exported (line 11 in data/fields/index.ts)
- `primaryFieldTypes` and `PrimaryFieldConfig` types are exported
- But there's NO `primary()` function exported from "bknd"

**Correct approach:**
```typescript
import { entity, text } from "bknd";

// Primary key is automatically added (default integer or uuid)
entity("users", {
  email: text().required(),
  // id field is auto-generated
})

// To customize primary key format, use entity config:
entity("users", {
  email: text().required(),
}, {
  primary_format: "uuid"  // "integer" | "uuid"
})
```

---

### 2. ❌ `em.repo()` / `em.repository()` NOT available on `em()` return
**Location:** `plugins/bknd-skills/skills/query/SKILL.md:24-25`

**Incorrect code shown:**
```typescript
const userRepo = em.repository('User');
const userRepo = em.repo('User');
await em.repo('comments').findMany({...});
```

**What `em()` actually returns:**
```typescript
{
  DB: Schema<Entities>,
  entities: Entities,
  relations: EntityRelation[],
  indices: EntityIndex[],
  proto: EntityManagerPrototype<Entities>,
  toJSON: () => Pick<ModuleConfigs["data"], "entities" | "relations" | "indices">
}
```

**The EntityManager methods (repo, repository, mutator) are on `schema.proto`:**
```typescript
const schema = em({
  users: entity("users", { name: text().required() }),
});

// WRONG: schema.repo('users')
// RIGHT: schema.proto.repo('users')

// But this only works for queries, not for schema definition
```

**For schema definition (Code Mode), only `toJSON()` is used:**
```typescript
const schema = em({
  users: entity("users", { name: text().required() }),
});

export default {
  config: {
    data: schema.toJSON(),  // ✅ Correct
  },
} satisfies BkndConfig;
```

**For runtime queries (inside App), use app.em:**
```typescript
const app = createApp(config);
await app.build();

// Then use app.em for queries:
const { data: users } = await app.em.repo('users').findMany();
```

---

### 3. ✅ `verifyAuth()` - CORRECT but only available on Api class
**Location:** `plugins/bknd-skills/skills/nextjs/SKILL.md:76`

**The code shown IS correct:**
```typescript
export async function getApi(opts?: { verify?: boolean }) {
  const app = await getApp();
  if (opts?.verify) {
    const api = app.getApi();
    await api.verifyAuth();  // ✅ This IS correct
    return api;
  }
  return app.getApi();
}
```

**Method signature (from Api.ts:229):**
```typescript
async verifyAuth() {
  try {
    const { ok, data } = await this.auth.me();
    const user = data?.user;
    if (!ok || !user) {
      throw new Error();
    }
    this.user = user;
  } catch (e) {
    this.updateToken(undefined);
  } finally {
    this.markAuthVerified(true);
  }
}
```

---

### 4. ✅ `getUser()` - CORRECT
**Location:** `plugins/bknd-skills/skills/nextjs/SKILL.md:128, 152`

**The code shown IS correct:**
```typescript
const api = await getApi({ verify: true });
const user = api.getUser();  // ✅ This IS correct

// Method signature (from Api.ts:245):
getUser(): TApiUser | null {
  return this.user || null;
}
```

---

## Verified CORRECT APIs

### ✅ `em()` function and `schema.toJSON()`
**From:** `plugins/bknd-skills/skills/getting-started/SKILL.md`

```typescript
import { em, entity, text, boolean } from "bknd";

const schema = em({
  todos: entity("todos", {
    title: text().required(),
    done: boolean(),
  }),
});

export default {
  config: {
    data: schema.toJSON(),  // ✅ Correct
  },
} satisfies ViteBkndConfig;
```

### ✅ `getApi()` helper function
**From:** `plugins/bknd-skills/skills/nextjs/SKILL.md:72-80`

```typescript
export async function getApp() {
  return await getBkndApp(config, process.env);
}

export async function getApi(opts?: { verify?: boolean }) {
  const app = await getApp();
  if (opts?.verify) {
    const api = app.getApi();
    await api.verifyAuth();
    return api;
  }
  return app.getApi();
}
```

### ✅ `api.data.readMany()`, `api.data.createOne()`, etc.
**From:** `plugins/bknd-skills/skills/api-sdk/SKILL.md`

All DataApi methods are correct based on `DataApi.ts`.

### ✅ `npx bknd types` command
**Verified:** Command exists and has options:
```
Options:
  -o, --outfile <outfile>  output file (default: "bknd-types.d.ts")
  --dump                   dump types to console
```

### ✅ Field types: `text()`, `number()`, `boolean()`, `date()`, `enumm()`, `json()`
All exported from `data/prototype/index.ts` and re-exported from main `index.ts`.

---

## Summary of Issues

| Issue | Severity | Files Affected | Impact |
|-------|-----------|----------------|---------|
| `primary` not exported | 🔴 CRITICAL | data-schema | Code won't compile |
| `em.repo()` not accessible on schema | 🔴 CRITICAL | query | Code won't compile |
| `em.repository()` not accessible on schema | 🔴 CRITICAL | query | Code won't compile |

## Action Required

1. **Fix data-schema/SKILL.md**:
   - Remove `import { primary } from "bknd"`
   - Remove example showing `id: primary({ format: "uuid" })`
   - Document that primary key is auto-generated
   - Show `entity(..., { primary_format: "uuid" })` for customization

2. **Fix query/SKILL.md**:
   - Remove all examples showing `em.repo('Entity')` or `em.repository('Entity')`
   - Add disclaimer that `em()` returns schema definition, not a queryable EntityManager
   - For runtime queries, show using `app.em.repo()` after `app.build()`
   - Or clarify that queries are done via API endpoints in Code Mode
