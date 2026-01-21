# Files & Media Reference

Technical reference for Bknd v0.20.0 media module, storage adapters, file uploads, and content delivery.

## Media Module Overview

The media module provides adapter-based file storage with:
- Multiple storage backends (S3, R2, Cloudinary, local)
- Entity field attachments
- Automatic image dimension detection
- Event-driven upload processing

---

## Storage Adapters

### Built-in Adapters

| Adapter | Type | Use Case |
|---------|------|----------|
| `s3` | S3-compatible | AWS S3, Cloudflare R2, DigitalOcean Spaces, MinIO |
| `cloudinary` | Media-optimized | Image/video transformations |
| `local` | Filesystem | Development only (Node.js) |

### S3 Adapter Configuration

```typescript
import { defineConfig } from "bknd";

export default defineConfig({
  media: {
    enabled: true,
    adapter: {
      type: "s3",
      config: {
        access_key: process.env.S3_ACCESS_KEY,
        secret_access_key: process.env.S3_SECRET_KEY,
        url: "https://bucket.s3.region.amazonaws.com",
      },
    },
  },
});
```

**URL Formats:**
- AWS S3: `https://{bucket}.s3.{region}.amazonaws.com`
- Cloudflare R2: `https://{account_id}.r2.cloudflarestorage.com/{bucket}`
- DigitalOcean Spaces: `https://{bucket}.{region}.digitaloceanspaces.com`

### Local Adapter (Development)

```typescript
import { registerLocalMediaAdapter } from "bknd/adapter/node";

const local = registerLocalMediaAdapter();

export default defineConfig({
  media: {
    enabled: true,
    adapter: local({ path: "./uploads" }),
  },
});
```

Files served at `/api/media/file/{filename}`.

### Cloudinary Adapter

```typescript
export default defineConfig({
  media: {
    enabled: true,
    adapter: {
      type: "cloudinary",
      config: {
        cloud_name: "your-cloud-name",
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      },
    },
  },
});
```

---

## Storage Configuration

```typescript
type StorageConfig = {
  body_max_size?: number;  // Max upload size in bytes (default: unlimited)
};

export default defineConfig({
  media: {
    enabled: true,
    body_max_size: 10 * 1024 * 1024,  // 10MB
    adapter: { ... },
  },
});
```

---

## MediaApi (SDK)

### Upload File

```typescript
// From File object
const { ok, data } = await api.media.upload(file);

// From URL
const { ok, data } = await api.media.upload("https://example.com/image.png");

// From Request/Response
const response = await fetch("https://example.com/image.png");
const { ok, data } = await api.media.upload(response);

// With custom filename
const { ok, data } = await api.media.upload(file, {
  filename: "custom-name.png",
});
```

### Upload Response

```typescript
type FileUploadedEventData = {
  name: string;           // Stored filename
  meta: {
    type: string;         // MIME type
    size: number;         // File size in bytes
    width?: number;       // Image width (if image)
    height?: number;      // Image height (if image)
  };
  etag: string;           // Storage ETag
  state: {
    name: string;
    path: string;
  };
};
```

### Upload to Entity Field

Attach file directly to an entity record:

```typescript
// Upload and attach to entity
const { ok, data } = await api.media.uploadToEntity(
  "posts",           // entity name
  123,               // record ID
  "cover_image",     // field name
  file,
  { overwrite: true }  // replace existing
);

// data contains both upload info and updated record
console.log(data.result);  // Updated entity record
```

### List Files

```typescript
const { ok, data } = await api.media.listFiles();
// data: FileListObject[]

type FileListObject = {
  key: string;           // Filename/path
  last_modified: Date;
  size: number;
};
```

### Get/Download File

```typescript
// Get as stream
const stream = await api.media.getFileStream("image.png");

// Download as File object
const file = await api.media.download("image.png");
```

### Delete File

```typescript
await api.media.deleteFile("image.png");
```

### Get Upload URL

For direct client-side uploads:

```typescript
// Direct upload URL
const url = api.media.getFileUploadUrl();
// "/api/media/upload"

// With path
const url = api.media.getFileUploadUrl({ path: "avatars/user-123.png" });
// "/api/media/upload/avatars/user-123.png"

// Entity upload URL
const url = api.media.getEntityUploadUrl("users", 123, "avatar");
// "/api/media/entity/users/123/avatar"
```

---

## REST API Endpoints

| Method | Path | Description | Permission |
|--------|------|-------------|------------|
| GET | `/api/media/files` | List all files | `mediaRead` |
| GET | `/api/media/file/:filename` | Download file | `mediaRead` |
| POST | `/api/media/upload` | Upload file | `mediaCreate` |
| POST | `/api/media/upload/:path` | Upload with path | `mediaCreate` |
| POST | `/api/media/entity/:entity/:id/:field` | Upload to entity | `mediaCreate` |
| DELETE | `/api/media/file/:filename` | Delete file | `mediaDelete` |

### Direct Upload (REST)

```bash
# Upload with filename in path
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: image/png" \
  --data-binary @image.png \
  https://api.example.com/api/media/upload/image.png

# Upload to entity field
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: image/jpeg" \
  --data-binary @photo.jpg \
  "https://api.example.com/api/media/entity/users/123/avatar?overwrite=true"
```

---

## Media Field Type

Attach files to entities using the `media` field type:

```typescript
import { em, entity, text, media } from "bknd";

const schema = em({
  posts: entity({
    title: text(),
    cover_image: media(),  // Stores file reference
  }),

  users: entity({
    name: text(),
    avatar: media(),
  }),
});
```

Media fields store reference to the uploaded file, not the file itself.

---

## Browser File Upload

### HTML Form

```html
<input type="file" id="fileInput" accept="image/*" />
<button onclick="uploadFile()">Upload</button>

<script>
async function uploadFile() {
  const input = document.getElementById('fileInput');
  const file = input.files[0];

  const { ok, data } = await api.media.upload(file);

  if (ok) {
    console.log('Uploaded:', data.name);
  }
}
</script>
```

### React Component

```tsx
function FileUpload({ onUploaded }) {
  const { api } = useApp();
  const [uploading, setUploading] = useState(false);

  const handleChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { ok, data } = await api.media.upload(file);
      if (ok) {
        onUploaded(data);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <input
      type="file"
      onChange={handleChange}
      disabled={uploading}
    />
  );
}
```

### Upload with Progress

For large files, use XHR for progress tracking:

```typescript
function uploadWithProgress(file: File, onProgress: (pct: number) => void) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const url = api.media.getFileUploadUrl({ path: file.name });

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        onProgress((e.loaded / e.total) * 100);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error(xhr.statusText));
      }
    });

    xhr.open("POST", url);
    xhr.setRequestHeader("Content-Type", file.type);

    // Add auth header if using header transport
    const token = api.getAuthState().token;
    if (token) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    }

    xhr.send(file);
  });
}
```

---

## Storage Events

### FileUploadedEvent

Emitted after successful upload:

```typescript
import { Flow, EventTrigger, FunctionTask } from "bknd";

const onFileUploaded = new Flow("on-file-uploaded", [
  new FunctionTask({
    name: "process",
    handler: async (input) => {
      // input.name - filename
      // input.meta - { type, size, width?, height? }
      console.log(`File uploaded: ${input.name}`);
    },
  }),
]);

onFileUploaded.setTrigger(
  new EventTrigger({ event: "media:uploaded" })
);
```

### FileDeletedEvent

Emitted after file deletion:

```typescript
new EventTrigger({ event: "media:deleted" })
// input.name - deleted filename
```

---

## Custom Storage Adapter

Implement `StorageAdapter` interface:

```typescript
import { StorageAdapter } from "bknd/media";

class MyStorageAdapter extends StorageAdapter {
  getName(): string {
    return "my-storage";
  }

  async listObjects(prefix?: string): Promise<FileListObject[]> {
    // Return list of files
  }

  async putObject(key: string, body: FileBody): Promise<string> {
    // Upload file, return etag
  }

  async deleteObject(key: string): Promise<void> {
    // Delete file
  }

  async objectExists(key: string): Promise<boolean> {
    // Check if file exists
  }

  async getObject(key: string, headers: Headers): Promise<Response> {
    // Return file as Response
  }

  getObjectUrl(key: string): string {
    // Return public URL for file
  }

  async getObjectMeta(key: string): Promise<FileMeta> {
    // Return file metadata { type, size }
  }

  getSchema() {
    // Return config schema (optional)
    return undefined;
  }

  toJSON(secrets?: boolean) {
    return { type: this.getName() };
  }
}
```

---

## File Serving

### Direct from Storage

S3/R2 files can be served directly from their public URLs:

```typescript
const adapter = api.media.getAdapter();
const url = adapter.getObjectUrl("image.png");
// "https://bucket.s3.region.amazonaws.com/image.png"
```

### Via API (Proxied)

Files served through Bknd API:

```
GET /api/media/file/image.png
```

Supports standard HTTP headers:
- `Accept` - Content negotiation
- `If-None-Match` - ETag caching
- `If-Modified-Since` - Conditional requests

---

## Permissions

Media operations require permissions:

| Permission | Description |
|------------|-------------|
| `media.read` | List and download files |
| `media.create` | Upload files |
| `media.delete` | Delete files |

Configure in Guard:

```typescript
export default defineConfig({
  auth: {
    guard: {
      roles: {
        user: {
          permissions: {
            "media.read": true,
            "media.create": true,
          },
        },
        admin: {
          permissions: {
            "media.read": true,
            "media.create": true,
            "media.delete": true,
          },
        },
      },
    },
  },
});
```

---

## Common Patterns

### Image Upload with Preview

```tsx
function ImageUpload({ value, onChange }) {
  const { api } = useApp();
  const [preview, setPreview] = useState(value);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    setPreview(URL.createObjectURL(file));

    const { ok, data } = await api.media.upload(file);
    if (ok) {
      onChange(data.name);
    }
  };

  return (
    <div>
      {preview && <img src={preview} alt="Preview" />}
      <input type="file" accept="image/*" onChange={handleUpload} />
    </div>
  );
}
```

### Avatar Upload to User

```typescript
async function updateAvatar(userId: number, file: File) {
  const { ok, data } = await api.media.uploadToEntity(
    "users",
    userId,
    "avatar",
    file,
    { overwrite: true }
  );

  if (ok) {
    return data.result;  // Updated user record
  }
  throw new Error("Failed to upload avatar");
}
```

### Cleanup Orphaned Files

```typescript
// In a scheduled flow or admin action
async function cleanupOrphanedFiles() {
  const { data: files } = await api.media.listFiles();
  const { data: posts } = await api.data.readMany("posts", {
    select: ["cover_image"],
  });

  const usedFiles = new Set(posts.map(p => p.cover_image));

  for (const file of files) {
    if (!usedFiles.has(file.key)) {
      await api.media.deleteFile(file.key);
    }
  }
}
```

---

## Troubleshooting

### Upload Fails with 413

**Cause:** File exceeds `body_max_size`.

**Fix:** Increase limit in config:
```typescript
media: {
  body_max_size: 50 * 1024 * 1024,  // 50MB
}
```

### S3 403 Forbidden

**Causes:**
1. Invalid credentials
2. Bucket policy doesn't allow access
3. URL format incorrect

**Fix:** Verify credentials and bucket URL format.

### Local Adapter 404

**Cause:** Directory doesn't exist or wrong path.

**Fix:** Ensure upload directory exists and path is relative to project root:
```typescript
adapter: local({ path: "./public/uploads" })
```

### CORS Errors on Upload

**Cause:** S3 bucket missing CORS configuration.

**Fix:** Add CORS policy to bucket:
```json
{
  "CORSRules": [{
    "AllowedOrigins": ["https://yourapp.com"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedHeaders": ["*"]
  }]
}
```

### Missing Image Dimensions

**Cause:** Non-image file or unsupported format.

**Note:** Dimensions only detected for standard image formats (PNG, JPEG, GIF, WebP).

---

## Best Practices

1. **Use S3/R2 for production** - Local adapter is dev-only
2. **Set reasonable size limits** - Prevent abuse with `body_max_size`
3. **Use entity uploads** - `uploadToEntity` maintains referential integrity
4. **Handle upload errors** - Always check `ok` in response
5. **Use CDN for static assets** - S3/R2 integrate with CDNs naturally
6. **Secure with permissions** - Don't allow anonymous uploads in production
