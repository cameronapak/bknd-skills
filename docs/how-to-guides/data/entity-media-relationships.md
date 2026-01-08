# Entity-Media Relationships

Associate media files (images, videos, documents) with your entities using Bknd's polymorphic media relations.

## Overview

Bknd's media system uses **polymorphic relationships** to connect media to any entity in your schema. This allows flexible associations like:
- One-to-one: Single cover image for a post
- One-to-many: Gallery of images for a product
- Many-to-many: Shared media across multiple entity types

## Prerequisites

- Media module enabled and configured with storage adapter
- Basic understanding of [Bknd configuration](/getting-started/build-your-first-api.md)
- Knowledge of [entity relationships](/reference/data-module#relationship-mutations)

## How Media Relations Work

The media entity is a **system entity** with a polymorphic relation that can connect to any entity:

- **Virtual fields**: Add `medium()` or `media()` to your entity definition
- **Polymorphic relation**: Connect entity to media entity using `polyToOne()` or `polyToMany()`
- **Automatic tracking**: Media tracks which entity owns it via `entity_id` and `reference` fields

## Step 1: Enable Media Module

First, enable media with a storage adapter:

```typescript
import { serve } from "bknd/adapter/node";

export default serve({
  config: {
    media: {
      enabled: true,
      adapter: {
        provider: "local",
        url: "./uploads",
      },
    },
  },
});
```

## One-to-One Relations

Use for single media items like avatars, cover images, or thumbnails.

### Define Entity

```typescript
import { em, entity, text, systemEntity, medium } from "bknd";

const schema = em({
  posts: entity("posts", {
    title: text().required(),
    content: text(),
    // Virtual field for single media
    cover: medium(),
  }),
  media: systemEntity("media", {}),
}, ({ relation }, { posts, media }) => {
  // Map virtual field to polymorphic relation
  relation(posts).polyToOne(media, { mappedBy: "cover" });
});

type Database = (typeof schema)["DB"];
declare module "bknd" {
  interface DB extends Database {}
}
```

### Usage

```typescript
// Create post with cover image
const post = await em.mutator("posts").insertOne({
  title: "My Post",
  content: "...",
  cover: { $create: { file: uploadedFile } },
});

// Update cover
await em.mutator("posts").updateOne(1, {
  cover: { $set: { id: mediaId } },
});

// Query with cover
const postWithCover = await em.repository("posts").findOne({
  where: { id: 1 },
  with: { cover: true },
});
```

## One-to-Many Relations

Use for multiple media items like galleries, attachments, or related images.

### Define Entity

```typescript
const schema = em({
  products: entity("products", {
    name: text().required(),
    description: text(),
    // Virtual field for multiple media
    images: media(),
  }),
  media: systemEntity("media", {}),
}, ({ relation }, { products, media }) => {
  // Map virtual field to polymorphic many-to-many
  relation(products).polyToMany(media, { mappedBy: "images" });
});
```

### Usage

```typescript
// Create product with images
const product = await em.mutator("products").insertOne({
  name: "Awesome Product",
  description: "...",
  images: {
    $create: [
      { file: image1 },
      { file: image2 },
      { file: image3 },
    ],
  },
});

// Add images to existing product
await em.mutator("products").updateOne(1, {
  images: { $attach: [mediaId1, mediaId2] },
});

// Remove specific images
await em.mutator("products").updateOne(1, {
  images: { $detach: [mediaId3] },
});

// Replace all images
await em.mutator("products").updateOne(1, {
  images: { $set: [mediaId1, mediaId4] },
});

// Query with images
const productWithImages = await em.repository("products").findOne({
  where: { id: 1 },
  with: { images: { orderBy: { created_at: "desc" } } },
});
```

## Many-to-Many Relations

Media inherently supports many-to-many through polymorphic relations. The same media can be referenced by multiple entities.

### Example: Shared Media Across Entities

```typescript
const schema = em({
  posts: entity("posts", {
    title: text().required(),
    images: media(),
  }),
  pages: entity("pages", {
    slug: text().required(),
    content: text(),
    images: media(),
  }),
  media: systemEntity("media", {}),
}, ({ relation }, { posts, pages, media }) => {
  relation(posts).polyToMany(media, { mappedBy: "images" });
  relation(pages).polyToMany(media, { mappedBy: "images" });
});
```

### Shared Media Usage

```typescript
// Upload media once
const media = await app.module.media.upload(file);

// Reference in multiple entities
await em.mutator("posts").updateOne(1, {
  images: { $attach: [media.id] },
});

await em.mutator("pages").updateOne(1, {
  images: { $attach: [media.id] },
});

// Media is tracked to both entities
const mediaUsage = await em.repository("media").findOne({
  where: { id: media.id },
  with: { reference: true },
});
```

## Relation Operations

### Create ($create)

Create new media and associate in one operation:

```typescript
await em.mutator("posts").updateOne(1, {
  cover: { $create: { file: uploadedFile } },
  images: {
    $create: [
      { file: file1 },
      { file: file2 },
    ],
  },
});
```

### Set ($set)

Replace existing media with new media (for one-to-one):

```typescript
await em.mutator("posts").updateOne(1, {
  cover: { $set: { id: mediaId } },
});
```

For one-to-many, replace all media:

```typescript
await em.mutator("products").updateOne(1, {
  images: { $set: [mediaId1, mediaId2, mediaId3] },
});
```

### Attach ($attach)

Add media without removing existing (one-to-many only):

```typescript
await em.mutator("products").updateOne(1, {
  images: { $attach: [mediaId1, mediaId2] },
});
```

### Detach ($detach)

Remove specific media (one-to-many only):

```typescript
await em.mutator("products").updateOne(1, {
  images: { $detach: [mediaId3, mediaId4] },
});
```

**UNKNOWN**: I do not have documentation on whether `$detach` is supported for polyToMany relations or if there are additional constraints specific to media operations.

## Complete Example: E-Commerce Product

```typescript
import { em, entity, text, number, systemEntity, medium, media } from "bknd";

const schema = em({
  products: entity("products", {
    name: text().required(),
    description: text(),
    price: number(),
    // One-to-one: Single thumbnail
    thumbnail: medium(),
    // One-to-many: Multiple product images
    gallery: media(),
    // One-to-many: Document attachments
    documents: media(),
  }),
  media: systemEntity("media", {}),
}, ({ relation }, { products, media }) => {
  relation(products).polyToOne(media, { mappedBy: "thumbnail" });
  relation(products).polyToMany(media, { mappedBy: "gallery" });
  relation(products).polyToMany(media, { mappedBy: "documents" });
});

export default {
  config: {
    data: schema.toJSON(),
    media: {
      enabled: true,
      adapter: {
        provider: "local",
        url: "./uploads",
      },
    },
  },
};
```

### Usage

```typescript
// Create product with all media
const product = await em.mutator("products").insertOne({
  name: "Laptop",
  description: "Powerful laptop",
  price: 999,
  thumbnail: { $create: { file: thumbFile } },
  gallery: {
    $create: [
      { file: image1 },
      { file: image2 },
      { file: image3 },
    ],
  },
  documents: {
    $create: [
      { file: manualFile },
      { file: warrantyFile },
    ],
  },
});

// Query product with all media
const fullProduct = await em.repository("products").findOne({
  where: { id: product.id },
  with: {
    thumbnail: true,
    gallery: { orderBy: { created_at: "desc" } },
    documents: { where: { mime_type: { $startsWith: "application/" } } },
  },
});
```

## Best Practices

1. **Use appropriate relation type**: One-to-one for single items, one-to-many for collections
2. **Order media**: Use `orderBy` when querying galleries for consistent display
3. **Filter media**: Filter by type or other fields when needed
4. **Validate uploads**: Ensure file types match expected usage (e.g., images for gallery, PDFs for documents)
5. **Handle deletions**: Consider what happens when entities are deleted and media becomes orphaned
6. **Use descriptive field names**: `cover`, `thumbnail`, `avatar`, `gallery` for clarity

## Troubleshooting

### Media not appearing in queries

**Cause**: Not using `with` parameter

**Solution**:
```typescript
// Wrong
const post = await em.repository("posts").findOne({ where: { id: 1 } });

// Correct
const post = await em.repository("posts").findOne({
  where: { id: 1 },
  with: { cover: true },
});
```

### Relation not working

**Cause**: Missing or incorrect relation mapping

**Solution**:
```typescript
// Ensure relation is defined
relation(posts).polyToOne(media, { mappedBy: "cover" });

// Ensure virtual field matches mappedBy property
cover: medium(), // Virtual field
```

### Can't attach/detach media

**Cause**: Using wrong operation for relation type

**Solution**: 
- Use `$attach`/`$detach` only for one-to-many (`media()`)
- Use `$set` for one-to-one (`medium()`)

## Related Resources

- [Media Storage Configuration](/reference/media-module) - Setting up media adapters
- [Polymorphic Relations](/reference/data-module#polymorphic-relations) - Deep dive into polymorphic relationships
- [File Upload with React](/reference/react-sdk#media-dropzone) - React components for media upload
- [Data Module Reference](/reference/data-module) - Complete data module documentation
