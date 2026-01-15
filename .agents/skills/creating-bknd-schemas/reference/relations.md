# Bknd Relations Reference

Complete guide to defining relationships between entities in Bknd schemas.

## Relation Types

### Many-to-One (Foreign Key)

One entity belongs to another. Most common relationship.

```typescript
const schema = em(
  {
    users: entity("users", { name: text().required() }),
    posts: entity("posts", { title: text().required() }),
  },
  ({ relation }, { users, posts }) => {
    relation(posts).manyToOne(users, {
      local_key: "author_id",      // Column on posts table
      foreign_key: "id",            // Column on users table
      cascade: ["delete"]            // Delete posts if user deleted
    });
  }
);
```

**Result:**
- Adds `author_id` (foreign key) column to `posts` table
- Links to `users.id`
- Cascade deletes posts when user is deleted
- Query: `post.author` returns the related user

**Configuration options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `local_key` | string | Auto-generated | Column name on child table (e.g., `author_id`) |
| `foreign_key` | string | `"id"` | Column name on parent table |
| `cascade` | string[] | `[]` | Cascade actions: `["delete"]` or `["update"]` |

---

### One-to-One

One entity has exactly one related entity (with unique constraint).

```typescript
const schema = em(
  {
    users: entity("users", { name: text().required() }),
    profiles: entity("profiles", { bio: text() }),
  },
  ({ relation }, { users, profiles }) => {
    relation(users).oneToOne(profiles, {
      local_key: "profile_id",
      foreign_key: "id"
    });
  }
);
```

**Result:**
- One user has one profile
- Query: `user.profile` returns the single related profile

**Use when:** Entities have 1:1 correspondence (user ↔ profile, person ↔ license)

---

### Many-to-Many

Both entities can have multiple related entities (with implicit junction table).

```typescript
const schema = em(
  {
    posts: entity("posts", { title: text().required() }),
    tags: entity("tags", { name: text().required() }),
  },
  ({ relation }, { posts, tags }) => {
    relation(posts).manyToMany(tags, {
      connectionTable: "post_tags"  // Junction table name
    });
  }
);
```

**Result:**
- Automatic `post_tags` junction table created
- Many posts can have many tags
- Many tags can appear on many posts
- Query: `post.tags` returns all related tags

**Default junction table name:** `{entity1}_{entity2}` (alphabetical)

---

### Many-to-Many with Extra Fields

Add metadata to the junction table (e.g., pivot fields).

```typescript
const schema = em(
  {
    projects: entity("projects", { name: text().required() }),
    users: entity("users", { name: text().required() }),
  },
  ({ relation }, { projects, users }) => {
    relation(projects).manyToMany(users,
      {
        connectionTable: "project_members"
      },
      {
        // Extra fields on junction table
        role: enumm({ enum: ["owner", "member", "viewer"] }),
        joinedAt: date({ type: "datetime", default_value: new Date() })
      }
    );
  }
);
```

**Result:**
- Junction table includes `role` and `joinedAt` columns
- Query: `project.users` with pivot data

---

### Polymorphic Relations (One-to-Many with Multiple Types)

One entity can belong to different entity types.

```typescript
const schema = em(
  {
    posts: entity("posts", { title: text().required() }),
    videos: entity("videos", { title: text().required() }),
    comments: entity("comments", { content: text().required() }),
  },
  ({ relation }, { posts, videos, comments }) => {
    relation(comments).polyToMany([posts, videos], {
      type_field: "commentable_type",   // Column storing entity type
      id_field: "commentable_id"        // Column storing entity ID
    });
  }
);
```

**Result:**
- `comments` table has:
  - `commentable_type` - "posts" or "videos"
  - `commentable_id` - ID of the post or video
- One comment can belong to either a post OR a video
- Query: `comment.commentable` returns the post or video

**Use when:** Comments on posts, comments on videos, etc.

---

## Relation Configuration Reference

### All Relation Options

```typescript
relation(source)
  .manyToOne(target, {
    local_key: "user_id",           // Foreign key column name
    foreign_key: "id",              // Target primary key
    cascade: ["delete"],            // Cascade actions
    // onDelete: "cascade",          // DB-level constraint
    // onUpdate: "cascade"           // DB-level constraint
  })
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `local_key` | string | `{target_singular}_id` | Column on source table |
| `foreign_key` | string | `"id"` | Column on target table |
| `cascade` | string[] | `[]` | Actions: `["delete"]`, `["update"]`, or both |

### Cascade Delete Example

```typescript
// When a user is deleted, all their posts are also deleted
relation(posts).manyToOne(users, {
  cascade: ["delete"]
});

// Instead of soft delete, posts cascade delete
```

---

## Complete Multi-Relation Example

```typescript
import { em, entity, text, number, boolean, date, enumm } from "bknd/data";

const schema = em(
  {
    organizations: entity("organizations", {
      name: text().required(),
    }),
    
    users: entity("users", {
      name: text().required(),
      email: text().required(),
      role: enumm({ enum: ["admin", "member"] }),
    }),
    
    projects: entity("projects", {
      title: text().required(),
      description: text(),
    }),
    
    tasks: entity("tasks", {
      title: text().required(),
      completed: boolean({ default_value: false }),
    }),
    
    comments: entity("comments", {
      content: text().required(),
    }),
    
    tags: entity("tags", {
      name: text().required(),
    }),
  },
  ({ relation }, { organizations, users, projects, tasks, comments, tags }) => {
    // Org > Users
    relation(users).manyToOne(organizations, {
      cascade: ["delete"]
    });
    
    // Org > Projects
    relation(projects).manyToOne(organizations, {
      cascade: ["delete"]
    });
    
    // Project > Tasks
    relation(tasks).manyToOne(projects, {
      cascade: ["delete"]
    });
    
    // Polymorphic: Comments on tasks or projects
    relation(comments).polyToMany([tasks, projects], {
      type_field: "commentable_type",
      id_field: "commentable_id"
    });
    
    // Many-to-many: Projects have members
    relation(projects).manyToMany(users, 
      { connectionTable: "project_members" },
      { role: enumm({ enum: ["owner", "editor", "viewer"] }) }
    );
    
    // Many-to-many: Tasks have tags
    relation(tasks).manyToMany(tags);
  }
);
```

**Resulting Relations:**

| Source | Type | Target | Via |
|--------|------|--------|-----|
| users → organizations | Many-to-One | organizations | `user.organization_id` |
| projects → organizations | Many-to-One | organizations | `project.organization_id` |
| tasks → projects | Many-to-One | projects | `task.project_id` |
| comments → tasks/projects | Polymorphic | either | `comment.commentable_type/id` |
| projects ↔ users | Many-to-Many | users | `project_members` junction |
| tasks ↔ tags | Many-to-Many | tags | `tasks_tags` junction |

---

## Common Relation Patterns

### User → Posts → Comments
```typescript
relation(posts).manyToOne(users, { cascade: ["delete"] });
relation(comments).manyToOne(posts, { cascade: ["delete"] });
// user.posts, post.user, post.comments, comment.post
```

### Students → Courses (Many-to-Many)
```typescript
relation(students).manyToMany(courses, 
  { connectionTable: "enrollments" },
  { enrolledAt: date({ default_value: new Date() }) }
);
// student.courses, course.students, with pivot data
```

### Comments on Any Entity
```typescript
relation(comments).polyToMany([posts, articles, videos], {
  type_field: "targetType",
  id_field: "targetId"
});
// comment.target returns correct entity type
```

### Tree Structure (Self-referential)
```typescript
relation(categories).manyToOne(categories, {
  local_key: "parent_id",
  foreign_key: "id",
  cascade: ["delete"]
});
// category.parent, category.children
```
