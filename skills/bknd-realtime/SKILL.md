---
name: bknd-realtime
description: Use when implementing real-time features, live updates, or data subscriptions in Bknd. Covers current limitations, polling patterns, SWR/React Query revalidation, server-sent events workaround, push notification alternatives, and event-driven patterns with Flows.
---

# Real-Time Data Patterns

Implement live data updates and real-time features in Bknd applications.

## Prerequisites

- Running Bknd instance
- Frontend application (React, Vue, etc.)
- Understanding of polling vs push-based patterns

## Current State (v0.20.0)

**Bknd does not currently have native real-time support** (WebSockets, SSE, or subscriptions). This is a requested feature (GitHub issue #236).

### Available Patterns

| Pattern | Latency | Complexity | Use Case |
|---------|---------|------------|----------|
| **Polling** | 1-30s | Low | Dashboard refreshes, status updates |
| **SWR Revalidation** | 1-30s | Low | React apps with cache |
| **Manual Refresh** | User-triggered | Lowest | Infrequent updates |
| **Custom SSE Endpoint** | ~0s | High | Chat, live feeds (requires custom server) |
| **External Service** | ~0s | Medium | Pusher, Ably, Supabase Realtime |

---

## When to Use UI Mode

Real-time configuration requires code. No UI approach available.

## When to Use Code Mode

- Building dashboards that need periodic data refresh
- Implementing polling for status updates
- Integrating with external real-time services
- Building custom SSE endpoints via plugins

---

## Pattern 1: Polling with SWR (Recommended for React)

### Step 1: Basic Interval Polling

```typescript
import useSWR from "swr";
import { Api } from "bknd";

const api = new Api({ host: "http://localhost:7654" });

function usePolledData(entity: string, interval = 5000) {
  const fetcher = async () => {
    const { ok, data } = await api.data.readMany(entity, {
      sort: { created_at: "desc" },
      limit: 50,
    });
    if (!ok) throw new Error("Fetch failed");
    return data;
  };

  return useSWR(["polled", entity], fetcher, {
    refreshInterval: interval,
    revalidateOnFocus: true,
    dedupingInterval: 2000,
  });
}

// Usage
function OrdersDashboard() {
  const { data: orders, isLoading, mutate } = usePolledData("orders", 3000);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <button onClick={() => mutate()}>Refresh Now</button>
      {orders?.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}
```

### Step 2: Conditional Polling

```typescript
function useConditionalPolling(entity: string, isActive: boolean) {
  return useSWR(
    isActive ? ["polled", entity] : null,  // null key disables polling
    async () => {
      const { data } = await api.data.readMany(entity);
      return data;
    },
    { refreshInterval: isActive ? 5000 : 0 }
  );
}

// Usage - only poll when tab is visible
function LiveFeed() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleVisibility = () => setIsVisible(!document.hidden);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  const { data } = useConditionalPolling("messages", isVisible);
  // ...
}
```

### Step 3: Smart Polling with Change Detection

```typescript
function useSmartPolling(entity: string) {
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [hasNewData, setHasNewData] = useState(false);

  const fetcher = async () => {
    const { data } = await api.data.readMany(entity, {
      sort: { updated_at: "desc" },
      limit: 1,
    });

    const latestUpdate = data?.[0]?.updated_at;

    if (lastUpdate && latestUpdate !== lastUpdate) {
      setHasNewData(true);
    }
    setLastUpdate(latestUpdate);

    return data;
  };

  const swr = useSWR(["smart-poll", entity], fetcher, {
    refreshInterval: 10000,
  });

  const acknowledge = () => {
    setHasNewData(false);
    swr.mutate();  // Full refresh
  };

  return { ...swr, hasNewData, acknowledge };
}

// Usage
function NotificationBadge() {
  const { hasNewData, acknowledge } = useSmartPolling("notifications");

  return (
    <button onClick={acknowledge}>
      Notifications {hasNewData && <span className="badge">New!</span>}
    </button>
  );
}
```

---

## Pattern 2: React Query Polling

```typescript
import { useQuery } from "@tanstack/react-query";
import { Api } from "bknd";

const api = new Api({ host: "http://localhost:7654" });

function usePolledQuery(entity: string, interval = 5000) {
  return useQuery({
    queryKey: ["polled", entity],
    queryFn: async () => {
      const { ok, data } = await api.data.readMany(entity);
      if (!ok) throw new Error("Fetch failed");
      return data;
    },
    refetchInterval: interval,
    refetchIntervalInBackground: false,
    staleTime: interval / 2,
  });
}
```

---

## Pattern 3: Manual setInterval Polling (Vanilla JS)

```typescript
import { Api } from "bknd";

const api = new Api({ host: "http://localhost:7654" });

class DataPoller {
  private intervalId: number | null = null;
  private listeners: Set<(data: any) => void> = new Set();

  constructor(
    private entity: string,
    private interval = 5000
  ) {}

  subscribe(callback: (data: any) => void) {
    this.listeners.add(callback);
    if (!this.intervalId) this.start();
    return () => this.unsubscribe(callback);
  }

  unsubscribe(callback: (data: any) => void) {
    this.listeners.delete(callback);
    if (this.listeners.size === 0) this.stop();
  }

  private async poll() {
    const { ok, data } = await api.data.readMany(this.entity);
    if (ok) {
      this.listeners.forEach((cb) => cb(data));
    }
  }

  start() {
    this.poll();  // Initial fetch
    this.intervalId = setInterval(() => this.poll(), this.interval) as any;
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

// Usage
const ordersPoller = new DataPoller("orders", 3000);

const unsubscribe = ordersPoller.subscribe((orders) => {
  console.log("Updated orders:", orders);
  renderOrders(orders);
});

// Cleanup
// unsubscribe();
```

---

## Pattern 4: Custom SSE Endpoint (Advanced)

Build a Server-Sent Events endpoint using Bknd plugins. This requires maintaining the connection server-side.

### Step 1: SSE Plugin

```typescript
import { createPlugin, App } from "bknd";
import type { Context } from "hono";

const ssePlugin = createPlugin({
  name: "sse-realtime",

  onServerInit: (server) => {
    // Track active connections
    const connections = new Map<string, Set<ReadableStreamController>>();

    // SSE endpoint
    server.get("/api/sse/:entity", async (c: Context) => {
      const entity = c.req.param("entity");

      // Set SSE headers
      c.header("Content-Type", "text/event-stream");
      c.header("Cache-Control", "no-cache");
      c.header("Connection", "keep-alive");

      // Create stream
      const stream = new ReadableStream({
        start(controller) {
          // Register connection
          if (!connections.has(entity)) {
            connections.set(entity, new Set());
          }
          connections.get(entity)!.add(controller);

          // Send initial ping
          controller.enqueue(`event: connected\ndata: ${JSON.stringify({ entity })}\n\n`);

          // Cleanup on close
          c.req.raw.signal.addEventListener("abort", () => {
            connections.get(entity)?.delete(controller);
          });
        },
      });

      return new Response(stream);
    });

    // Broadcast function (called from event listeners)
    (globalThis as any).__sseBroadcast = (entity: string, event: string, data: any) => {
      const clients = connections.get(entity);
      if (!clients) return;

      const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

      for (const controller of clients) {
        try {
          controller.enqueue(message);
        } catch {
          clients.delete(controller);
        }
      }
    };
  },
});
```

### Step 2: Broadcast on Data Changes

```typescript
import { App } from "bknd";

const app = new App({
  // ... config
  plugins: [ssePlugin],

  listeners: [
    {
      event: "DataRecordMutatedEvent",
      handler: async ({ em, event }) => {
        const payload = event.payload;
        const entityName = payload.entity?.name;

        if (entityName) {
          const broadcast = (globalThis as any).__sseBroadcast;
          broadcast?.(entityName, payload.operation, payload.record);
        }
      },
    },
  ],
});
```

### Step 3: Client-Side SSE Consumer

```typescript
class SSEClient {
  private eventSource: EventSource | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  connect(entity: string) {
    this.eventSource = new EventSource(`http://localhost:7654/api/sse/${entity}`);

    this.eventSource.addEventListener("connected", (e) => {
      console.log("SSE connected:", JSON.parse(e.data));
    });

    this.eventSource.addEventListener("insert", (e) => {
      this.emit("insert", JSON.parse(e.data));
    });

    this.eventSource.addEventListener("update", (e) => {
      this.emit("update", JSON.parse(e.data));
    });

    this.eventSource.addEventListener("delete", (e) => {
      this.emit("delete", JSON.parse(e.data));
    });

    this.eventSource.onerror = () => {
      console.error("SSE connection error");
    };
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  private emit(event: string, data: any) {
    this.listeners.get(event)?.forEach((cb) => cb(data));
  }

  disconnect() {
    this.eventSource?.close();
  }
}

// Usage
const sse = new SSEClient();
sse.connect("orders");

sse.on("insert", (order) => {
  console.log("New order:", order);
  addOrderToUI(order);
});

sse.on("update", (order) => {
  console.log("Order updated:", order);
  updateOrderInUI(order);
});
```

### Step 4: React Hook for SSE

```typescript
function useSSE(entity: string) {
  const [data, setData] = useState<any[]>([]);
  const [status, setStatus] = useState<"connecting" | "connected" | "error">("connecting");

  useEffect(() => {
    const eventSource = new EventSource(`/api/sse/${entity}`);

    eventSource.addEventListener("connected", () => setStatus("connected"));
    eventSource.onerror = () => setStatus("error");

    eventSource.addEventListener("insert", (e) => {
      const record = JSON.parse(e.data);
      setData((prev) => [record, ...prev]);
    });

    eventSource.addEventListener("update", (e) => {
      const record = JSON.parse(e.data);
      setData((prev) =>
        prev.map((item) => (item.id === record.id ? record : item))
      );
    });

    eventSource.addEventListener("delete", (e) => {
      const record = JSON.parse(e.data);
      setData((prev) => prev.filter((item) => item.id !== record.id));
    });

    return () => eventSource.close();
  }, [entity]);

  return { data, status };
}
```

---

## Pattern 5: External Real-Time Service Integration

Integrate Bknd with Pusher, Ably, or similar services.

### Step 1: Pusher Integration

```typescript
import Pusher from "pusher";
import { App, Flow, Task, EventTrigger } from "bknd";
import { s } from "bknd/utils";

// Server-side: Push on data changes
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
});

class PusherBroadcastTask extends Task<typeof PusherBroadcastTask.schema> {
  override type = "pusher-broadcast";

  static override schema = s.strictObject({
    channel: s.string(),
  });

  override async execute(input: any) {
    const entity = input.entity?.name;
    const event = input.operation || "update";
    const data = input.record || input.changed;

    await pusher.trigger(this.params.channel, `${entity}:${event}`, data);

    return { pushed: true };
  }
}

const pusherTask = new PusherBroadcastTask("broadcast", {
  channel: "app-updates",
});

const pusherFlow = new Flow("pusher-broadcast", [pusherTask]);
pusherFlow.setTrigger(
  new EventTrigger({
    event: "mutator-insert-after",
    mode: "async",
  })
);
```

### Step 2: Client-Side Pusher

```typescript
import PusherJS from "pusher-js";

const pusher = new PusherJS(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
});

const channel = pusher.subscribe("app-updates");

channel.bind("orders:insert", (order: any) => {
  console.log("New order via Pusher:", order);
});

channel.bind("orders:update", (order: any) => {
  console.log("Order updated via Pusher:", order);
});
```

---

## Pattern 6: Optimistic Updates with Background Sync

For perceived real-time without actual real-time infrastructure:

```typescript
import { Api } from "bknd";
import useSWR, { mutate } from "swr";

const api = new Api({ host: "http://localhost:7654" });

function useOptimisticOrders() {
  const { data: orders, mutate: mutateOrders } = useSWR("orders", async () => {
    const { data } = await api.data.readMany("orders");
    return data;
  });

  const createOrder = async (orderData: any) => {
    // Optimistic update with temp ID
    const tempId = `temp-${Date.now()}`;
    const optimisticOrder = { ...orderData, id: tempId, _pending: true };

    mutateOrders(
      (current) => [optimisticOrder, ...(current || [])],
      false  // Don't revalidate yet
    );

    try {
      const { ok, data } = await api.data.createOne("orders", orderData);

      if (ok) {
        // Replace temp with real
        mutateOrders(
          (current) =>
            current?.map((o) => (o.id === tempId ? data : o)),
          false
        );
      }
    } catch {
      // Rollback on error
      mutateOrders(
        (current) => current?.filter((o) => o.id !== tempId),
        false
      );
    }
  };

  return { orders, createOrder };
}
```

---

## Choosing the Right Pattern

| Requirement | Recommended Pattern |
|-------------|---------------------|
| Dashboard refresh every 5-30s | SWR/React Query polling |
| Near-instant updates required | External service (Pusher/Ably) |
| Full control, no external deps | Custom SSE endpoint |
| Simple status checks | Manual polling with setInterval |
| Reduce perceived latency | Optimistic updates |

---

## Common Pitfalls

### Polling Too Frequently

**Problem:** High server load, rate limiting

**Fix:** Use reasonable intervals:

```typescript
// DON'T
refreshInterval: 500  // 2 requests/second per client

// DO
refreshInterval: 5000  // Reasonable for most dashboards
refreshInterval: 30000  // For background data
```

### Memory Leaks in Polling

**Problem:** Interval not cleared on unmount

**Fix:** Always cleanup:

```typescript
useEffect(() => {
  const id = setInterval(poll, 5000);
  return () => clearInterval(id);  // REQUIRED
}, []);
```

### Polling in Background Tabs

**Problem:** Wasted resources when tab not visible

**Fix:** Use visibility-aware polling:

```typescript
useSWR(key, fetcher, {
  refreshInterval: 5000,
  refreshWhenHidden: false,  // Disable when tab hidden
  revalidateOnFocus: true,   // Refresh when returning
});
```

### SSE Connection Limits

**Problem:** Browsers limit concurrent SSE connections (~6 per domain)

**Fix:** Use single multiplexed connection:

```typescript
// DON'T - one connection per entity
useSSE("orders");
useSSE("products");
useSSE("users");

// DO - single connection with routing
useSSE("*");  // Server sends all, client filters
```

---

## DOs and DON'Ts

**DO:**
- Use SWR/React Query for React apps (built-in caching, deduplication)
- Pause polling when tab is hidden
- Implement optimistic updates for perceived speed
- Consider external services for true real-time needs
- Clean up intervals and connections on unmount
- Use reasonable polling intervals (5-30s for most cases)

**DON'T:**
- Poll faster than necessary (wastes resources)
- Forget to handle connection errors
- Assume native WebSocket support exists in Bknd
- Create multiple SSE connections to same server
- Skip optimistic updates when user experience matters
- Ignore browser connection limits

---

## Related Skills

- **bknd-webhooks** - Server-side event triggers on data changes
- **bknd-api-discovery** - Understand available API endpoints
- **bknd-client-setup** - Configure Bknd SDK in frontend
- **bknd-crud-read** - Query data for polling
