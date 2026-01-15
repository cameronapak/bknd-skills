# Bknd Field Types Reference

Complete configuration options for all field types available in Bknd schemas.

## Text Field

Text/string fields with validation and formatting.

```typescript
email: text({
  default_value: "user@example.com",
  minLength: 5,
  maxLength: 100,
  pattern: "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,}$",
  description: "User email address",
  label: "Email",
  html_config: { type: "email" }
})
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `default_value` | string | undefined | Static default value (functions not supported) |
| `minLength` | number | undefined | Minimum character length |
| `maxLength` | number | undefined | Maximum character length |
| `pattern` | string | undefined | Regex pattern for validation (e.g., email pattern) |
| `html_config` | object | undefined | Custom HTML input configuration |
| `required` | boolean | false | Field is required (NOT NULL) |
| `description` | string | undefined | Field description for docs/UI |
| `label` | string | undefined | Display label for admin UI |
| `fillable` | boolean \| string[] | true | When field can be modified (roles/operations) |
| `hidden` | boolean \| string[] | false | When field is hidden from UI |
| `virtual` | boolean | false | Field is not persisted to database |

---

## Number Field

Numeric fields with constraints and validation.

```typescript
age: number({
  default_value: 0,
  minimum: 0,
  maximum: 120,
  exclusiveMaximum: true,
  multipleOf: 5
})
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `default_value` | number | undefined | Static default value |
| `minimum` | number | undefined | Minimum allowed value (inclusive) |
| `maximum` | number | undefined | Maximum allowed value (inclusive) |
| `exclusiveMinimum` | number | undefined | Minimum (exclusive, value > this) |
| `exclusiveMaximum` | number | undefined | Maximum (exclusive, value < this) |
| `multipleOf` | number | undefined | Value must be a multiple of this |

---

## Date Field

Date and datetime fields with timezone support.

```typescript
joinedAt: date({
  default_value: new Date(),
  type: "datetime",
  timezone: "UTC",
  min_date: "2020-01-01",
  max_date: "2099-12-31"
})
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `default_value` | Date | undefined | Static default value (Date object, not function) |
| `type` | "date" \| "datetime" \| "week" | "date" | Date type variant |
| `timezone` | string | undefined | Timezone string (e.g., "UTC", "America/Chicago") |
| `min_date` | string | undefined | Minimum date (ISO format: YYYY-MM-DD) |
| `max_date` | string | undefined | Maximum date (ISO format: YYYY-MM-DD) |

**Type variants:**
- `"date"` - Calendar date only (YYYY-MM-DD)
- `"datetime"` - Date and time (ISO 8601)
- `"week"` - ISO week format (YYYY-Www)

---

## Boolean Field

Boolean/true-false fields with optional defaults.

```typescript
isActive: boolean({
  default_value: true,
  description: "User account is active"
})
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `default_value` | boolean | undefined | Default value (true or false) |
| `description` | string | undefined | Field description |
| `label` | string | undefined | Display label |

---

## Enum Field

Fields with predefined option values.

```typescript
role: enumm({
  enum: [
    { label: "Administrator", value: "admin" },
    { label: "Regular User", value: "user" },
    { label: "Guest", value: "guest" }
  ],
  type: "objects",
  default_value: "user"
})
```

**String-based enum (simpler):**
```typescript
status: enumm({
  enum: ["active", "inactive", "pending"],
  type: "strings"
})
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enum` | array | required | Array of options (strings or label/value objects) |
| `type` | "strings" \| "objects" | "strings" | Option value format |
| `default_value` | string | undefined | Default selected option |

**Option formats:**

Strings: `["admin", "user", "guest"]`

Objects: `[{ label: "Admin", value: "admin" }, ...]`

---

## JSON Field

Generic JSON fields with optional type hints.

```typescript
metadata: json<{
  preferences: { theme: string; notifications: boolean };
  lastLogin: string;
}>({
  default_value: { theme: "dark", notifications: true }
})
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `default_value` | object | undefined | Default JSON object |

**Type-Safe Usage:**
```typescript
// With TypeScript generics
metadata: json<{
  theme: "light" | "dark";
  notifications: boolean;
}>({ default_value: { theme: "light", notifications: true } })
```

---

## Media Fields

File and media attachment fields.

### media() - Multiple Files

Accepts multiple files with no limit on item count.

```typescript
attachments: media({
  // Media-specific options
})
```

Use when: User can upload multiple documents, photos, etc.

### medium() - Single File

Single file only, automatically enforces `max_items: 1`.

```typescript
profilePhoto: medium()
```

Use when: One profile picture, one document, etc.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `max_items` | number | ∞ for media, 1 for medium | Max files allowed |
| `accepted_formats` | string[] | undefined | MIME types (e.g., `["image/*", "application/pdf"]`) |
| `max_file_size` | number | undefined | Max size per file in bytes |

---

## Common Patterns

### Email with Validation
```typescript
email: text({
  required: true,
  pattern: "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,}$",
  maxLength: 100
})
```

### URL Field
```typescript
website: text({
  pattern: "^https?://",
  maxLength: 255
})
```

### Slug (URL-safe)
```typescript
slug: text({
  required: true,
  pattern: "^[a-z0-9-]+$",
  maxLength: 100
})
```

### Age with Constraints
```typescript
age: number({
  minimum: 0,
  maximum: 150
})
```

### Rating
```typescript
rating: number({
  minimum: 0,
  maximum: 5,
  multipleOf: 0.5
})
```

### DateTime with Timezone
```typescript
eventAt: date({
  type: "datetime",
  timezone: "America/New_York",
  min_date: "2024-01-01"
})
```

### JSON with Type Safety
```typescript
settings: json<{
  emailNotifications: boolean;
  theme: "light" | "dark";
  language: string;
}>({
  default_value: {
    emailNotifications: true,
    theme: "light",
    language: "en"
  }
})
```
