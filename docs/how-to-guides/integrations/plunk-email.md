# Plunk Email Provider

Complete guide for using Plunk as your email provider with Bknd.

## Overview

Plunk is an open-source email platform for AWS that provides a modern API for transactional emails. It's designed for developers who need reliable email delivery with features like contact management, tracking, and analytics.

### Why Use Plunk?

- **Open Source**: Self-hostable and transparent email platform
- **Contact Management**: Built-in contact database and segmentation
- **Email Tracking**: Opens, clicks, and delivery tracking
- **AWS Native**: Built on AWS infrastructure for reliability
- **Developer-Friendly**: Simple API with comprehensive documentation
- **Affordable**: Competitive pricing with generous free tier

### Features

- Transactional email sending
- HTML and plain text support
- Contact management and segmentation
- Email analytics and tracking
- Custom domain support
- Webhook events
- Self-hosting option

## Installation

Plunk doesn't require a separate SDK installation - Bknd includes a built-in Plunk driver.

### Get Plunk API Key

1. Sign up at [useplunk.com](https://useplunk.com)
2. Navigate to API Keys in your dashboard
3. Generate a new API key
4. Add the API key to your environment variables

### Environment Variables

```bash
# .env
PLUNK_API_KEY=your_plunk_api_key_here
PLUNK_FROM_EMAIL=noreply@yourdomain.com
```

## Configuration

### Basic Configuration

Configure Plunk in your `bknd.config.ts`:

```typescript
import { plunkEmail } from "bknd";

export default {
  config: {
    // ... other config
  },
  options: {
    email: plunkEmail({
      apiKey: process.env.PLUNK_API_KEY!,
      from: process.env.PLUNK_FROM_EMAIL!,
    }),
    // ... other options
  },
} satisfies BkndConfig;
```

### Configuration Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `apiKey` | `string` | Yes | - | Your Plunk API key |
| `host` | `string` | No | `https://api.useplunk.com/v1/send` | Plunk API endpoint (customizable for self-hosted) |
| `from` | `string` | No | - | Default sender email address |

### Self-Hosted Plunk

If you're self-hosting Plunk, configure the host:

```typescript
options: {
  email: plunkEmail({
    apiKey: process.env.PLUNK_API_KEY!,
    host: "https://your-plunk-instance.com/v1/send",
    from: "noreply@example.com",
  }),
}
```

## Integration with Email OTP

Use Plunk for Email OTP authentication:

```typescript
import { emailOTP } from "bknd/plugins";
import { plunkEmail } from "bknd";

export default {
  config: {
    auth: {
      enabled: true,
      // ... other auth config
    },
  },
  options: {
    email: plunkEmail({
      apiKey: process.env.PLUNK_API_KEY!,
      from: "noreply@example.com",
    }),
    plugins: [
      emailOTP({
        generateEmail: (otp) => ({
          subject: "Your Login Code",
          body: `Your verification code is: ${otp.code}`,
        }),
      }),
    ],
  },
} satisfies BkndConfig;
```

### Email OTP with HTML Template

```typescript
emailOTP({
  generateEmail: (otp) => ({
    subject: "Your Login Code",
    body: {
      text: `Your code is: ${otp.code}`,
      html: `
        <h1>Your Verification Code</h1>
        <p>Your code is: <strong>${otp.code}</strong></p>
        <p>This code expires in 10 minutes.</p>
      `,
    },
  }),
})
```

## Integration with Password Auth

Use Plunk for password reset and verification emails with password strategy:

```typescript
import { passwordStrategy } from "bknd/plugins";
import { plunkEmail } from "bknd";

export default {
  config: {
    auth: {
      enabled: true,
      strategies: [
        passwordStrategy({
          hashing: "bcrypt",
          email: plunkEmail({
            apiKey: process.env.PLUNK_API_KEY!,
            from: "noreply@example.com",
          }),
          resetEmail: (user, token) => ({
            subject: "Reset Your Password",
            body: {
              html: `
                <h1>Reset Your Password</h1>
                <p>Click the link below to reset your password:</p>
                <a href="${process.env.APP_URL}/reset-password?token=${token}">
                  Reset Password
                </a>
              `,
            },
          }),
        }),
      ],
    },
  },
} satisfies BkndConfig;
```

## Email Templates

### Plain Text Email

```typescript
const response = await app.email.send(
  "user@example.com",
  "Welcome to My App",
  "Welcome to our app! We're excited to have you."
);
```

### HTML Email

```typescript
const response = await app.email.send(
  "user@example.com",
  "Welcome to My App",
  "<h1>Welcome!</h1><p>We're excited to have you.</p>"
);
```

### Text and HTML Combined

```typescript
const response = await app.email.send(
  "user@example.com",
  "Welcome to My App",
  {
    text: "Welcome to our app! We're excited to have you.",
    html: "<h1>Welcome!</h1><p>We're excited to have you.</p>",
  }
);
```

### Template Variables

When using with Email OTP, these variables are available:

| Variable | Type | Description |
|----------|------|-------------|
| `otp.code` | `string` | The OTP code |
| `otp.email` | `string` | User email address |
| `otp.expires_at` | `Date` | When the code expires |

```typescript
emailOTP({
  generateEmail: (otp) => ({
    subject: "Your Login Code",
    body: {
      text: `Your code for ${otp.email} is: ${otp.code}`,
      html: `
        <p>Your code for ${otp.email} is:</p>
        <h1 style="font-size: 32px; letter-spacing: 4px;">${otp.code}</h1>
        <p>Expires at: ${new Date(otp.expires_at).toLocaleString()}</p>
      `,
    },
  }),
})
```

### Advanced Email Options

Plunk supports additional send options:

```typescript
const response = await app.email.send(
  "user@example.com",
  "Welcome Email",
  "Welcome to our app!",
  {
    name: "John Doe",           // Contact name
    reply: "support@example.com", // Reply-to address
    headers: {
      "X-Custom-Header": "value",
    },
    subscribed: true,            // Add to contacts
  }
);
```

### Available Send Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `subscribed` | `boolean` | - | Add email to Plunk contacts |
| `name` | `string` | - | Contact name |
| `from` | `string` | - | Override default from address |
| `reply` | `string` | - | Reply-to email address |
| `headers` | `Record<string, string>` | - | Custom email headers |

## Testing

### Test Email Sending

Create a test endpoint to verify Plunk configuration:

```typescript
// src/routes/test-email.ts
import { Hono } from "hono";
import { getApp } from "../bknd.config";

const app = new Hono();

app.post("/test-email", async (c) => {
  const bknd = getApp();
  const { email } = await c.req.json();

  const response = await bknd.email.send(
    email || "test@example.com",
    "Test Email",
    "This is a test email from Bknd + Plunk"
  );

  return c.json(response);
});

export default app;
```

### Debug Email Delivery

```typescript
try {
  const response = await app.email.send(
    "user@example.com",
    "Test Email",
    "Test body"
  );

  console.log("Email sent:", response);
  // Response: { success: true, emails: [...], timestamp: "..." }
} catch (error) {
  console.error("Email failed:", error);
  // Common errors: invalid API key, invalid email, rate limit
}
```

### Test Email OTP Flow

```typescript
// Disable email sending for development
emailOTP({
  sendEmail: false,  // Don't send actual emails
  generateEmail: (otp) => {
    console.log("OTP Code:", otp.code);  // Log to console instead
    return { subject: "Test", body: "Test" };
  },
})
```

## Best Practices

### Setup and Configuration

- **Environment Variables**: Always use environment variables for API keys
- **API Key Security**: Never commit API keys to version control
- **Separate Environments**: Use different API keys for development and production
- **Organization Setup**: Use Plunk team features for multi-user access
- **Sandbox Testing**: Test with Plunk's sandbox environment before production

### Email Templates

- **Mobile-First Design**: Ensure templates render well on mobile devices
- **Dark Mode Support**: Use CSS that adapts to dark mode
- **Plain Text Fallback**: Always provide plain text version alongside HTML
- **Consistent Branding**: Use consistent colors, fonts, and logos
- **Preheader Text**: Include compelling preheader text (~50 chars)
- **Alt Text**: Add alt text to images for accessibility

### Deliverability

- **Custom Domain**: Verify your domain with SPF, DKIM, and DMARC records
- **Sender Reputation**: Maintain good sending practices to avoid spam filters
- **Domain Warming**: Warm up new domains gradually (start low, increase volume)
- **Bounce Handling**: Monitor bounce rates and remove invalid emails
- **Complaint Handling**: Process unsubscribes and complaints immediately
- **Content Quality**: Avoid spammy language and excessive links

### Performance

- **Async Sending**: Send emails asynchronously to avoid blocking requests
- **Batch Operations**: Use Plunk's batch sending for bulk emails (not built into Bknd)
- **Retry Logic**: Implement exponential backoff for failed sends
- **Queue Management**: Use a job queue for high-volume sending
- **Rate Limiting**: Respect Plunk's API rate limits

### Cost Optimization

- **Monitor Usage**: Track email volume in Plunk dashboard
- **Free Tier**: Stay within free tier limits when possible
- **Email Size**: Optimize email size to reduce bandwidth costs
- **Segmentation**: Use contact segmentation to target relevant users
- **Unsubscribe Rate**: Maintain low unsubscribe rates

### Security

- **API Key Permissions**: Use scoped API keys with minimum required permissions
- **Input Validation**: Validate email addresses before sending
- **Rate Limiting**: Implement rate limiting on email endpoints
- **Log Sanitization**: Never log sensitive data (API keys, passwords)
- **HTTPS Only**: Always use HTTPS for API requests (default in Plunk driver)
- **Email Injection**: Prevent email injection attacks by validating input

### Monitoring

- **Delivery Rate**: Track successful vs. failed sends
- **Open Rate**: Monitor email open rates for engagement
- **Click Rate**: Track link clicks for effectiveness
- **Bounce Rate**: Monitor bounce rates for list health
- **Complaint Rate**: Track spam complaints for reputation
- **Response Time**: Monitor API response times
- **Error Alerts**: Set up alerts for delivery failures

### Integration

- **Error Handling**: Implement try-catch around email sends
- **Fallback Provider**: Consider fallback to another provider (not built-in)
- **Transaction IDs**: Store Plunk response data for debugging
- **Idempotency**: Ensure repeated sends don't create duplicates
- **Webhook Processing**: Process Plunk webhooks asynchronously

### Troubleshooting

- **Check API Key**: Verify API key is valid and has correct permissions
- **Validate Emails**: Use email validation libraries before sending
- **Test Console Output**: Disable `sendEmail` for development testing
- **Check Logs**: Review Plunk dashboard for delivery status
- **Network Issues**: Verify network connectivity to Plunk API
- **Domain Health**: Check domain DNS records and reputation
- **Spam Filters**: Test emails with spam checkers (Mail Tester, GlockApps)
- **Contact Support**: Reach out to Plunk support for persistent issues

### Migration from Resend

- **Import Contacts**: Export contacts from Resend, import to Plunk
- **Update Templates**: Convert Resend templates to Plunk format
- **Test Deliverability**: Test with sample emails before full migration
- **Compare Costs**: Review pricing differences
- **Dual Sending**: Run both providers during transition period
- **Update Documentation**: Document new provider configuration

### Advanced Features

- **Webhook Events**: Set up webhooks for delivery, open, click events
- **Custom Domain**: Verify domain for DKIM/SPF authentication
- **Contact Metadata**: Add custom metadata to contacts
- **Segmentation**: Use Plunk's segmentation for targeted campaigns
- **Automations**: Set up email automations based on user behavior

### Compliance

- **GDPR**: Obtain consent for email communications
- **Unsubscribe**: Always include unsubscribe link in marketing emails
- **Data Retention**: Configure data retention policies in Plunk
- **Privacy Policy**: Update privacy policy to include email processing
- **CAN-SPAM**: Include physical mailing address in footer
- **Right to Deletion**: Process user data deletion requests

## Comparison: Plunk vs Resend

### Feature Comparison

| Feature | Plunk | Resend |
|---------|--------|--------|
| Open Source | ✅ Yes | ❌ No |
| Self-Hosted | ✅ Yes | ❌ No |
| Contact Management | ✅ Built-in | ❌ Limited |
| Analytics | ✅ Comprehensive | ✅ Basic |
| Webhooks | ✅ Yes | ✅ Yes |
| Attachments | ❌ No | ✅ Yes |
| BCC/CC | ❌ No | ✅ Yes |
| Scheduled Sends | ❌ No | ✅ Yes |
| HTML Templates | ✅ Yes | ✅ Yes |
| Custom Domain | ✅ Yes | ✅ Yes |
| AWS Native | ✅ Yes | ❌ No |

### Pricing Comparison (as of 2024)

| Plan | Plunk | Resend |
|------|--------|--------|
| Free Tier | 3,000 emails/month | 3,000 emails/month |
| Paid Plans | $9/10k emails | $20/50k emails |
| Enterprise | Custom | Custom |

### When to Use Each

**Choose Plunk if:**
- You need self-hosting capabilities
- You want built-in contact management
- You prefer open-source solutions
- You need AWS-native infrastructure
- You're building a SaaS product with user management

**Choose Resend if:**
- You need email attachments
- You require BCC/CC functionality
- You need scheduled email sends
- You prefer a managed service
- You're already using other Resend features

## Examples

### Complete Email OTP Integration

```typescript
// bknd.config.ts
import { emailOTP } from "bknd/plugins";
import { plunkEmail } from "bknd";

export default {
  connection: {
    url: "file:data.db",
  },
  config: {
    data: {
      users: {
        schema: {
          email: text().required(),
          name: text(),
        },
      },
    },
    auth: {
      enabled: true,
      jwt: {
        secret: process.env.JWT_SECRET!,
      },
    },
  },
  options: {
    email: plunkEmail({
      apiKey: process.env.PLUNK_API_KEY!,
      from: process.env.PLUNK_FROM_EMAIL || "noreply@example.com",
    }),
    plugins: [
      emailOTP({
        ttl: 600, // 10 minutes
        apiBasePath: "/api/auth/otp",
        generateEmail: (otp) => ({
          subject: "Your Verification Code",
          body: {
            text: `Your code is: ${otp.code}\n\nThis code expires in 10 minutes.`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px;">
                <h2 style="color: #333;">Your Verification Code</h2>
                <p>Use the code below to complete your login:</p>
                <div style="background: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
                  <span style="font-size: 32px; letter-spacing: 4px; font-weight: bold;">
                    ${otp.code}
                  </span>
                </div>
                <p style="color: #666; font-size: 14px;">
                  This code expires in 10 minutes.
                </p>
              </div>
            `,
          },
        }),
      }),
    ],
  },
} satisfies BkndConfig;
```

### Welcome Email Sequence

```typescript
// After user registration
const sendWelcomeEmail = async (userEmail: string, userName: string) => {
  const response = await app.email.send(
    userEmail,
    "Welcome to Our App!",
    {
      text: `Hi ${userName},\n\nWelcome to our app! We're excited to have you.\n\nBest,\nThe Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h1 style="color: #166E3F;">Welcome to Our App!</h1>
          <p>Hi <strong>${userName}</strong>,</p>
          <p>We're excited to have you on board!</p>
          <p>Here are some resources to get started:</p>
          <ul>
            <li><a href="/docs">Documentation</a></li>
            <li><a href="/tutorials">Tutorials</a></li>
            <li><a href="/support">Support</a></li>
          </ul>
          <p>Best,<br>The Team</p>
        </div>
      `,
    },
    {
      name: userName,
      subscribed: true,
    }
  );

  return response;
};
```

### Password Reset Email

```typescript
const sendPasswordResetEmail = async (email: string, resetToken: string) => {
  const resetUrl = `${process.env.APP_URL}/reset-password?token=${resetToken}`;

  const response = await app.email.send(
    email,
    "Reset Your Password",
    {
      text: `Click the link below to reset your password:\n\n${resetUrl}\n\nThis link expires in 1 hour.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2 style="color: #333;">Reset Your Password</h2>
          <p>Click the button below to reset your password:</p>
          <a href="${resetUrl}" style="display: inline-block; background: #166E3F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
            Reset Password
          </a>
          <p style="color: #666; font-size: 14px; margin-top: 20px;">
            This link expires in 1 hour. If you didn't request this, ignore this email.
          </p>
        </div>
      `,
    }
  );

  return response;
};
```

## Related Documentation

- [Email OTP Guide](/how-to-guides/auth/email-otp) - Using Plunk with Email OTP authentication
- [Auth Module Reference](/reference/auth-module) - Authentication configuration options
- [Password Strategy](/reference/auth-module#password-strategy) - Password reset emails
- [Configuration Reference](/reference/configuration) - Complete configuration options
- [Resend Documentation](https://resend.com/docs) - Alternative email provider

## Troubleshooting

### Email Not Sending

**Issue**: Email API call fails or returns error

**Solutions**:
1. Verify API key is correct: `console.log(process.env.PLUNK_API_KEY)`
2. Check API key has correct permissions in Plunk dashboard
3. Ensure network connectivity to `api.useplunk.com`
4. Test with Plunk's API playground in dashboard
5. Check for rate limiting errors

### Email Not Received

**Issue**: API call succeeds but email never arrives

**Solutions**:
1. Check email address is valid
2. Verify sender domain is properly configured
3. Check spam/junk folder
4. Verify SPF, DKIM, DMARC records for sender domain
5. Test with deliverability tools (Mail Tester)
6. Check Plunk dashboard for delivery status

### Invalid API Key Error

**Issue**: `Error: Plunk API error: Unauthorized`

**Solutions**:
1. Regenerate API key in Plunk dashboard
2. Verify environment variable is loaded correctly
3. Check for extra spaces or characters in API key
4. Ensure API key is not expired

### Rate Limit Exceeded

**Issue**: `Error: Plunk API error: Rate limit exceeded`

**Solutions**:
1. Monitor email volume in Plunk dashboard
2. Implement rate limiting in your application
3. Queue emails for delayed sending
4. Upgrade to higher tier if needed
5. Use batch sending for bulk operations

### HTML Not Rendering

**Issue**: HTML email shows as raw HTML text

**Solutions**:
1. Ensure body is passed as object: `{ html: "..." }`
2. Check for unclosed HTML tags
3. Test HTML in browser validator
4. Use inline CSS styles (no `<style>` tags in body)
5. Verify email client supports HTML

### Contact Not Created

**Issue**: Email sent but contact not in Plunk contacts

**Solutions**:
1. Ensure `subscribed: true` is set in send options
2. Check contact management settings in Plunk dashboard
3. Verify email address is valid
4. Check for duplicate contact handling settings

## Support

- **Plunk Documentation**: [docs.useplunk.com](https://docs.useplunk.com)
- **Plunk Discord**: [useplunk.com/discord](https://useplunk.com/discord)
- **GitHub Issues**: [github.com/useplunk](https://github.com/useplunk)
- **Bknd Documentation**: [docs.bknd.io](https://docs.bknd.io)
