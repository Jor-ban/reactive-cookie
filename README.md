# @reactive-cache/cookie

Reactive cookies for Angular and RxJS projects. This library provides Observable-based cookie management with automatic expiration handling and state synchronization.

<a href="https://www.npmjs.com/package/@reactive-cache/cookie">
    <img src="https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white" />
</a>

## Installation

```bash
npm install @reactive-cache/cookie
```

## Features

- **Reactive Cookies**: Cookies exposed as RxJS Observables for seamless integration with Angular and RxJS projects
- **Automatic Expiration**: Built-in timer-based state reset before cookie expiration
- **Lazy Loading**: Values are fetched only when needed using an update resource function
- **Temporal Mode**: In-memory reactive state without cookie persistence
- **Type-Safe**: Full TypeScript support with generics

## API

### `reactiveCookie<T>(name, updateResource, expires?)`

Creates a reactive cookie that persists data to browser cookies.

**Parameters:**
- `name` - Cookie name
- `updateResource` - Observable or function that provides the value when refreshed
- `expires` - Optional expiration in days (number) or Date

**Returns:** `ReactiveCookie<T>` - An Observable with additional methods

### `reactiveCookie.temporal<T>(name, updateResource)`

Creates a temporal reactive state that behaves like a cookie but stores data only in memory.

## Methods

| Method | Description |
|--------|-------------|
| `set(value, expires?, options?)` | Sets the cookie value and updates subscribers |
| `getValue()` | Synchronously retrieves the current cookie value |
| `refresh(expires?, options?)` | Triggers the update resource and refreshes the cookie |
| `reset()` | Clears the cookie and resets the state |

## Usage Examples

### Basic Usage

```typescript
import { reactiveCookie } from '@reactive-cache/cookie';
import { of } from 'rxjs';

// Create a reactive cookie with a default value fetcher
const userToken = reactiveCookie<string>(
  'auth_token',
  of('default-token'),  // Update resource
  7  // Expires in 7 days
);

// Subscribe to value changes
userToken.subscribe(token => {
  console.log('Token:', token);
});

// Set a new value
userToken.set('new-token-value', 7);

// Get current value synchronously
const currentToken = userToken.getValue();
```

### With Async Data Fetching

```typescript
import { reactiveCookie } from '@reactive-cache/cookie';
import { Observable } from 'rxjs';

interface UserProfile {
  id: string;
  name: string;
}

const userProfile = reactiveCookie<UserProfile>(
  'user_profile',
  new Observable(subscriber => {
    // Fetch user profile from API
    fetch('/api/profile')
      .then(res => res.json())
      .then(data => {
        subscriber.next(data);
        subscriber.complete();
      });
  }),
  1  // Expires in 1 day
);

// The cookie will automatically fetch the profile when subscribed
userProfile.subscribe(profile => {
  console.log('User:', profile.name);
});

// Manually refresh from the API
userProfile.refresh().subscribe(updatedProfile => {
  console.log('Refreshed:', updatedProfile.name);
});
```

### Temporal (In-Memory) Mode

```typescript
import { reactiveCookie } from '@reactive-cache/cookie';
import { of } from 'rxjs';

// Create a temporal reactive state (no cookie persistence)
const sessionData = reactiveCookie.temporal<{ active: boolean }>(
  'session',
  of({ active: true })
);

// Set value with expiration timer
sessionData.set({ active: true }, 0.01);  // Expires in ~15 minutes

// State automatically resets when timer expires
sessionData.subscribe(data => {
  if (data) {
    console.log('Session active');
  } else {
    console.log('Session expired');
  }
});
```

### Angular Service Example

```typescript
import { Injectable } from '@angular/core';
import { reactiveCookie, ReactiveCookie } from '@reactive-cache/cookie';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly token: ReactiveCookie<string>;

  constructor(private http: HttpClient) {
    this.token = reactiveCookie<string>(
      'access_token',
      this.http.get<string>('/api/token'),
      1  // 1 day expiration
    );
  }

  login(credentials: { email: string; password: string }) {
    return this.http.post<string>('/api/login', credentials).pipe(
      tap(token => this.token.set(token, 7))  // Store for 7 days
    );
  }

  logout() {
    this.token.reset();
  }
}
```

## Cookie Options

The `set()` and `refresh()` methods accept optional cookie attributes:

```typescript
interface ReactiveCookieAttributes {
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  clearingOffsetMs?: number;  // Offset before expiration to trigger reset (default: 500ms)
}
```

Example with options:

```typescript
userToken.set('token-value', 7, {
  secure: true,
  sameSite: 'strict',
  path: '/',
  clearingOffsetMs: 1000  // Reset state 1 second before expiration
});
```

## How It Works

1. **Storage Format**: Values are stored as JSON with expiration timestamp:
   ```json
   { "d": "your-data", "x": 1234567890000 }
   ```

2. **Auto-Reset**: A timer is set to reset the state slightly before the cookie expires (configurable via `clearingOffsetMs`)

3. **Lazy Loading**: When subscribed, if the cookie is empty or expired, the update resource is called to fetch fresh data

## Dependencies

- [rxjs](https://rxjs.dev/) - Reactive extensions
- [js-cookie](https://github.com/js-cookie/js-cookie) - Cookie manipulation
- [@reactive-cache/core](https://www.npmjs.com/package/@reactive-cache/core) - Reactive cache foundation

## License

ISC
