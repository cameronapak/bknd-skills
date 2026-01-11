---
title: "Email OTP Authentication"
description: "Complete guide for passwordless authentication using one-time passwords sent via email."
---

# Email OTP Authentication

Email OTP (One-Time Password) provides a passwordless authentication method where users receive a temporary code via email to log in or register. This approach improves security by eliminating password storage while providing a smooth user experience.

## Overview

Email OTP authentication uses time-limited, single-use codes delivered to users' email addresses. Users request a code, receive it in their inbox, then enter it to complete authentication.

### Benefits

- **No passwords to manage**: Eliminates password reset flows and security risks from weak passwords
- **Improved security**: Codes expire after a short time and can only be used once
- **Better user experience**: Users don't need to remember passwords
- **Reduced attack surface**: No password hashing/salting vulnerabilities to exploit
- **Easy integration**: Works with any email provider (Resend, Plunk, etc.)

### How It Works

1. **Request OTP**: User submits email to `/api/auth/otp/login` or `/api/auth/otp/register`
2. **Generate Code**: Bknd generates a random 6-digit code (customizable)
3. **Send Email**: Code is sent to user's email via configured email driver
4. **Verify Code**: User submits code back to the same endpoint
5. **Create Session**: Valid code creates a JWT token and user session
6. **Invalidate Code**: Code is marked as used and cannot be reused

## Configuration

### Basic Setup

Enable Email OTP in your `bknd.config.ts`:

```typescript
import { emailOTP } from "bknd/plugins";
import { resendEmail } from "bknd";

export default {
  config: {
    auth: {
      enabled: true,
      // ... other auth config
    },
  },
  options: {
    drivers: {
      email: resendEmail({
        apiKey: process.env.RESEND_API_KEY,
        from: "noreply@example.com",
      }),
    },
    plugins: [
      emailOTP({
        generateEmail: (otp) => ({
          subject: "Your Login Code",
          body: `Your code is: ${otp.code}`,
        }),
      }),
    ],
  },
} satisfies BkndConfig;
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|----------|-------------|
| `generateCode` | `(user: Pick<DB["users"], "email">) => string` | Random 6-digit code | Custom function to generate OTP codes |
| `apiBasePath` | string | `"/api/auth/otp"` | Base path for OTP API endpoints |
| `ttl` | number | `600` (10 minutes) | Code expiration time in seconds |
| `entity` | string | `"users_otp"` | Name of OTP entity in database |
| `entityConfig` | `EntityConfig` | `undefined` | Additional entity configuration |
| `generateEmail` | `(otp) => { subject, body }` | Default template | Custom email content generator |
| `showActualErrors` | boolean | `false` | Show detailed error messages instead of generic ones |
| `allowExternalMutations` | boolean | `false` | Allow direct OTP entity mutations |
| `sendEmail` | boolean | `true` | Enable/disable email sending |

### Custom Code Generation

Override the default 6-digit code generator:

```typescript
emailOTP({
  generateCode: (user) => {
    // 8-character alphanumeric code
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return Array.from({ length: 8 }, () => 
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join("");
  },
})
```

### Custom TTL

Adjust code expiration time:

```typescript
emailOTP({
  ttl: 300, // 5 minutes (more secure)
  // or
  ttl: 1800, // 30 minutes (more user-friendly)
})
```

### Custom Entity Name

Use a different entity name:

```typescript
emailOTP({
  entity: "user_otp_codes",
  entityConfig: {
    name: "User OTP Codes",
    sort_dir: "desc",
  },
})
```

## Email Provider Setup

### Using Resend

```typescript
import { resendEmail } from "bknd";

export default {
  options: {
    drivers: {
      email: resendEmail({
        apiKey: process.env.RESEND_API_KEY,
        from: "your-app <noreply@yourapp.com>",
      }),
    },
    plugins: [
      emailOTP({
        generateEmail: (otp) => ({
          subject: "Your Verification Code",
          body: {
            text: `Enter this code to sign in: ${otp.code}`,
            html: `
              <h1>Your Verification Code</h1>
              <p>Enter this code to sign in:</p>
              <h2 style="font-size: 32px; letter-spacing: 4px;">${otp.code}</h2>
              <p>This code expires in 10 minutes.</p>
            `,
          },
        }),
      }),
    ],
  },
}
```

### Using Plunk

```typescript
import { plunkEmail } from "bknd";

export default {
  options: {
    drivers: {
      email: plunkEmail({
        apiKey: process.env.PLUNK_API_KEY,
        from: "noreply@example.com",
      }),
    },
    plugins: [
      emailOTP({
        generateEmail: (otp) => ({
          subject: "Login Code",
          body: `Your code: ${otp.code}`,
        }),
      }),
    ],
  },
}
```

See [Plunk Email Provider Guide](/integrations/plunk-email) for more configuration options.

## User Flow

### Login Flow

#### 1. Request OTP

Send email to request code:

```bash
POST /api/auth/otp/login
Content-Type: application/json

{
  "email": "user@example.com"
}
```

Response:

```json
{
  "sent": true,
  "data": {
    "email": "user@example.com",
    "action": "login",
    "expires_at": "2026-01-09T12:30:00.000Z"
  }
}
```

#### 2. Verify OTP and Login

Submit code to authenticate:

```bash
POST /api/auth/otp/login
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "123456"
}
```

Response:

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 3. Use Token

Include JWT in subsequent requests:

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Registration Flow

#### 1. Request OTP

```bash
POST /api/auth/otp/register
Content-Type: application/json

{
  "email": "newuser@example.com"
}
```

#### 2. Verify OTP and Register

```bash
POST /api/auth/otp/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "code": "123456"
}
```

User is created automatically and authenticated in one step.

### Redirect After Login

Use `redirect` query parameter to control post-login redirect:

```bash
POST /api/auth/otp/login?redirect=/dashboard
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "123456"
}
```

## API Endpoints

### Login Endpoint

**URL**: `POST /api/auth/otp/login`

**Request Body** (Request phase):

```typescript
{
  email: string;  // User's email address
}
```

**Request Body** (Verify phase):

```typescript
{
  email: string;  // User's email address
  code?: string;  // OTP code (optional)
}
```

**Query Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `redirect` | string | URL to redirect after successful login |

**Response** (Request phase):

```json
{
  "sent": true,
  "data": {
    "email": string,
    "action": "login" | "register",
    "expires_at": string
  }
}
```

**Response** (Verify phase):

```json
{
  "user": { id, email, role, ... },
  "token": string
}
```

### Register Endpoint

**URL**: `POST /api/auth/otp/register`

**Request Body**: Same as login endpoint

**Behavior**:
- Validates email doesn't exist before sending code
- Creates user with random password on successful verification
- Returns JWT token and user data

### Error Responses

**Generic Errors** (default):

```json
{
  "message": "Invalid credentials"
}
```

**Detailed Errors** (with `showActualErrors: true`):

```json
{
  "message": "Code expired"
}
```

**Error Types**:

| Error | Description |
|--------|-------------|
| `Invalid code` | Code doesn't match database |
| `Code expired` | Code TTL has passed |
| `Code already used` | Code was already verified |
| `User not found` | Email not registered (login flow) |
| `User already exists` | Email already registered (register flow) |
| `Failed to generate code` | Code generation failed |

## SDK Integration

### Using React SDK

```typescript
import { useApi } from "bknd/react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [phase, setPhase] = useState<"request" | "verify">("request");
  const api = useApi();

  const requestCode = async () => {
    const response = await fetch("/api/auth/otp/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    if (data.sent) {
      setPhase("verify");
    }
  };

  const verifyCode = async () => {
    const response = await fetch("/api/auth/otp/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });
    const data = await response.json();
    if (data.token) {
      // Store token and redirect
      localStorage.setItem("token", data.token);
      window.location.href = "/dashboard";
    }
  };

  return (
    <div>
      {phase === "request" ? (
        <form onSubmit={requestCode}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
          <button type="submit">Send Code</button>
        </form>
      ) : (
        <form onSubmit={verifyCode}>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter 6-digit code"
            maxLength={6}
          />
          <button type="submit">Verify</button>
        </form>
      )}
    </div>
  );
}
```

## Security Considerations

### Code Strength

- **Default**: 6-digit numeric code (100,000 - 999,999)
- **Entropy**: ~16.6 bits (brute force requires ~65,536 attempts)
- **Recommendation**: Keep default or use 8-digit alphanumeric for higher security

### TTL Configuration

| TTL | Security | UX | Use Case |
|-----|----------|-----|----------|
| 300 (5 min) | High | Low | High-security apps (banking) |
| 600 (10 min) | Medium | Medium | Default balance |
| 1800 (30 min) | Low | High | Low-risk apps |

### Rate Limiting

Email OTP implements **automatic code invalidation**:

- New code invalidates all previous unused codes for the same email
- Prevents code hoarding attacks
- Only the most recent code can be used

```typescript
// Implemented in invalidateAndGenerateCode()
await invalidateAllUserCodes(app, entityName, user.email, ttl);
```

### Mutation Protection

By default, OTP entity is **protected from external mutations**:

- `InsertBefore` event listener blocks direct insertions
- `UpdateBefore` event listener blocks direct updates
- Only plugin's `invalidateAndGenerateCode()` can modify OTP records

Enable with caution:

```typescript
emailOTP({
  allowExternalMutations: true,  // Security risk!
})
```

### Error Messages

- **Default**: Generic "Invalid credentials" prevents email enumeration
- **Debug mode**: `showActualErrors: true` reveals specific errors (dev only)

### Validation Checks

Code verification requires:
1. ✅ Email matches
2. ✅ Code matches
3. ✅ Action type matches (login/register)
4. ✅ Not expired (`expires_at > now`)
5. ✅ Not already used (`used_at` is null)

## Customization

### Email Templates

#### Plain Text Template

```typescript
emailOTP({
  generateEmail: (otp) => ({
    subject: "Your Verification Code",
    body: `Use this code to sign in: ${otp.code}\n\nValid for 10 minutes.`,
  }),
})
```

#### HTML Template

```typescript
emailOTP({
  generateEmail: (otp) => ({
    subject: "Verify Your Email",
    body: {
      text: `Your code is: ${otp.code}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            .code { font-size: 32px; letter-spacing: 4px; font-weight: bold; }
          .container { padding: 40px; text-align: center; }
          .expiry { color: #666; margin-top: 20px; }
          .footer { margin-top: 40px; font-size: 12px; color: #999; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Verify Your Email</h1>
            <p>Enter this code to complete sign in:</p>
            <div class="code">${otp.code}</div>
            <p class="expiry">This code expires in 10 minutes.</p>
            <div class="footer">
              If you didn't request this code, ignore this email.
            </div>
          </div>
        </body>
        </html>
      `,
    },
  }),
})
```

#### Template with Branding

```typescript
emailOTP({
  generateEmail: (otp) => ({
    subject: `${process.env.APP_NAME} - Verification Code`,
    body: {
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #f4f4f4; padding: 40px;">
            <div style="background: white; padding: 30px; border-radius: 8px;">
              <h1 style="color: ${process.env.BRAND_COLOR};">
                ${process.env.APP_NAME}
              </h1>
              <p>Your verification code is:</p>
              <h2 style="font-size: 36px; letter-spacing: 6px; color: #333;">
                ${otp.code}
              </h2>
              <p style="color: #666;">Expires in 10 minutes</p>
            </div>
          </div>
        </div>
      `,
    },
  }),
})
```

### OTP Length and Characters

#### 8-Digit Alphanumeric

```typescript
emailOTP({
  generateCode: (user) => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";  // No I, O, 0, 1
    return Array.from({ length: 8 }, () => 
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join("");
  },
})
```

#### Words-Based Code

```typescript
emailOTP({
  generateCode: (user) => {
    const words = ["apple", "banana", "cherry", "delta", "echo", "foxtrot"];
    return Array.from({ length: 3 }, () => 
      words[Math.floor(Math.random() * words.length)]
    ).join("-");
  },
})
```

### Disable Email Sending

For testing or custom sending:

```typescript
emailOTP({
  sendEmail: false,  // Code logged to console only
})
```

Console output:

```
[OTP Code] 123456
```

## Troubleshooting

### OTP Not Received

**Checklist**:

1. ✅ Email driver is configured
2. ✅ API key is valid
3. ✅ From address is verified (Resend/Plunk)
4. ✅ Check spam folder
5. ✅ Email address is correct
6. ✅ Email provider is operational

**Debug**:

```typescript
emailOTP({
  sendEmail: false,  // Disable sending
  showActualErrors: true,  // Show detailed errors
})
```

Check console for `[OTP Code]` output.

### Code Expired

**Issue**: User receives code but takes too long to enter

**Solution**: Increase TTL or remind user:

```typescript
emailOTP({
  ttl: 1800,  // 30 minutes
  generateEmail: (otp) => ({
    subject: "Verification Code",
    body: `Your code expires in 30 minutes: ${otp.code}`,
  }),
})
```

### Rate Limiting Issues

**Issue**: "Invalid credentials" even with correct code

**Cause**: User generated multiple codes, only latest is valid

**Solution**: Use latest code or implement resend countdown:

```typescript
// Frontend example
const [cooldown, setCooldown] = useState(0);

const requestCode = async () => {
  if (cooldown > 0) return;
  await fetch("/api/auth/otp/login", { ... });
  setCooldown(60);  // 60 second cooldown
};
```

### Email Provider Down

**Solution**: Implement fallback or retry logic:

```typescript
import { resendEmail, plunkEmail } from "bknd";

export default {
  options: {
    drivers: {
      email: process.env.EMAIL_PROVIDER === "plunk"
        ? plunkEmail({ apiKey: process.env.PLUNK_API_KEY })
        : resendEmail({ apiKey: process.env.RESEND_API_KEY }),
    },
  },
}
```

## Best Practices

### Security Best Practices

1. **Keep TTL short**: 5-10 minutes reduces attack window
2. **Use strong codes**: 6+ digits or alphanumeric
3. **Enable rate limiting**: Automatic invalidation prevents abuse
4. **Keep error messages generic**: Prevent email enumeration
5. **Never store codes**: One-time use only, mark as used
6. **Disable external mutations**: Default setting protects data integrity
7. **Validate input**: Email format and code length on both client and server
8. **Use HTTPS**: Protect OTP in transit
9. **Log security events**: Track failed attempts, suspicious patterns
10. **Implement CAPTCHA**: Prevent automated requests at scale

### User Experience Best Practices

1. **Clear instructions**: Tell users what to expect
2. **Auto-focus input**: Focus code field when user switches to verify screen
3. **6-digit input**: Use separate boxes or input masking
4. **Show countdown**: Display remaining time before expiration
5. **Resend button**: Allow requesting new code after cooldown
6. **Copy-paste support**: Easy to paste code from email
7. **Mobile-friendly**: Large touch targets, responsive design
8. **Loading states**: Show spinner during request/verify
9. **Clear error messages**: Explain what went wrong
10. **Success feedback**: Confetti or checkmark on successful login

### Email Deliverability Best Practices

1. **Verify sender domain**: SPF, DKIM, DMARC records
2. **Use consistent from address**: Build sender reputation
3. **Avoid spam triggers**: No all caps, excessive exclamation marks
4. **Test across providers**: Gmail, Outlook, Apple Mail
5. **Monitor bounce rates**: Track delivery failures
6. **Use plain text fallback**: Ensure accessibility
7. **Keep email size small**: < 100KB recommended
8. **Include unsubscribe**: Even for transactional emails
9. **Warm up new domains**: Gradually increase sending volume
10. **Handle bounces**: Clean invalid email addresses

### Configuration Best Practices

1. **Use environment variables**: Never commit API keys
2. **Separate environments**: Different settings for dev/staging/prod
3. **Set reasonable TTL**: Balance security and UX
4. **Customize templates**: Match your brand
5. **Test in development**: Use `sendEmail: false` first
6. **Monitor usage**: Track OTP generation and verification rates
7. **Set up alerts**: Notify on abnormal patterns
8. **Document customizations**: Comment non-standard code
9. **Version control configuration**: Track changes over time
10. **Use type safety**: Leverage TypeScript for config

### Performance Best Practices

1. **Index OTP table**: By email, expires_at, code (auto-created)
2. **Use async email sending**: Don't block OTP generation
3. **Cache email templates**: Pre-render HTML templates
4. **Monitor generation rate**: Detect performance bottlenecks
5. **Queue high-volume requests**: Use message queue for scale
6. **Optimize database queries**: Ensure efficient lookups
7. **Use connection pooling**: For database access
8. **Implement retry logic**: Handle transient failures
9. **Set timeouts**: Prevent hanging requests
10. **Monitor response times**: Track API performance

### Testing Strategies

1. **Unit tests**: Test code generation, validation logic
2. **Integration tests**: Mock email driver, test flow
3. **E2E tests**: Test complete user journey
4. **Load tests**: Test high-volume OTP generation
5. **Security tests**: Test brute force, timing attacks
6. **Deliverability tests**: Send to test inboxes
7. **Accessibility tests**: Screen reader compatibility
8. **Cross-browser tests**: Chrome, Firefox, Safari
9. **Mobile tests**: iOS, Android devices
10. **A/B tests**: Test different code lengths, TTL values

### Monitoring and Logging

1. **Track metrics**: Generation rate, verification rate, error rate
2. **Log security events**: Failed attempts, suspicious patterns
3. **Set up alerts**: Unusual activity, high failure rates
4. **Monitor email provider**: Delivery rates, bounce rates
5. **Track user behavior**: Average time to verify, retry rate
6. **Audit trails**: Keep logs for compliance
7. **Don't log actual codes**: Security best practice
8. **Aggregate logs**: Use log management tool (Sentry, LogRocket)
9. **Retention policy**: Delete logs after N days
10. **Regular reviews**: Analyze patterns, improve UX

## Cross-References

- [Auth Module Reference](/../reference/auth-module) - Full auth configuration options
- [Create First User](/create-first-user) - User management guide
- [Plunk Email Provider Guide](/integrations/plunk-email) - Detailed Plunk setup
- [Configuration Reference](/../reference/configuration) - Complete configuration options
- [Release Notes v0.20.0](/../releases/v0.20.0-release-notes) - OTP plugin release details
