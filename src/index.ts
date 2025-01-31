
import { __createReactiveCache__, EMPTY_SYMBOL, ReactiveCacheObservable, UpdateRecourseType } from "@reactive-cache/core";
import Cookies from 'js-cookie';
import { BehaviorSubject, Observable, tap } from "rxjs";

export type ReactiveCookieAttributes = Cookies.CookieAttributes & {
  clearingOffsetMs?: number
}
export type ReactiveCookie<T> = Observable<T> & {
  set(value: T, expires ?: Date | number, options?: Omit<ReactiveCookieAttributes, 'expires'>): string | undefined;
  getValue(): T | undefined;
  refresh(expires ?: Date | number, options?: Omit<ReactiveCookieAttributes, 'expires'>): Observable<T>;
  reset(): void;
}

export type ReactiveCookieExpectedStoredType<T> = {
  d: T,
  x: number
}

export function reactiveCookie<T>(name: string, updateResource: UpdateRecourseType<T>, expires?: Date | number): ReactiveCookie<T> {
  const { rc } = __createReactiveCache__<T>(updateResource, { name }, (v) => {
    if(v !== EMPTY_SYMBOL) {
      setCookie(v as T, expires);
    }
  }) as { rc: ReactiveCacheObservable<T>, state$: BehaviorSubject<T> };
  let timer: any = undefined;
  const cookieValue = Cookies.get(name);
  let parsedValue: unknown = ''

  try {
    parsedValue = JSON.parse(cookieValue ?? '') as unknown
  } catch (_ignored) { /* empty */ }

  if(
    typeof parsedValue === 'object' &&
    parsedValue !== null &&
    'x' in parsedValue &&
    'd' in parsedValue &&
    typeof parsedValue.x === 'number' &&
    Date.now() < parsedValue.x
  ) {
    rc.next(parsedValue.d as T);
    clearTimeout(timer)
    timer = setTimeout(() => {
      rc.resetState();
    }, parsedValue.x - Date.now() - 500)
  }

  return Object.assign(rc, {
    getValue,
    set,
    refresh,
    reset: () => {
      clearTimeout(timer);
      rc.resetState()
    }
  })

  function set(value: T, expires?: Date | number, options?: Omit<ReactiveCookieAttributes, 'expires'>): string | undefined {
    rc.next(value);

    return setCookie(value, expires, options);
  }

  function getValue(): T | undefined {
    const cookieValue = Cookies.get(name);
    let parsedValue: unknown

    try {
      parsedValue = JSON.parse(cookieValue ?? '') as unknown
    } catch (_ignored) { /* empty */ }

    if(typeof parsedValue === 'object' && parsedValue !== null && 'x' in parsedValue && 'd' in parsedValue) {
      return parsedValue.d as T
    }

    return undefined;
  }

  function setCookie(value: T, cExpires?: Date | number, options?: Omit<ReactiveCookieAttributes, 'expires'>): string | undefined {
    const exp = cExpires ?? expires;
    const expiresDate: Date | undefined = exp ? new Date(exp instanceof Date ? exp : Date.now() + exp * 24 * 60 * 60 * 1000) : undefined;

    Cookies.set(name, JSON.stringify({
      d: value,
      x: expiresDate?.getTime() ?? 0,
    }), {
      ...options,
      expires: expiresDate,
    });
    clearTimeout(timer);
    if (expiresDate) {
      timer = setTimeout(() => {
        rc.resetState();
      }, expiresDate.getTime() - Date.now() - (options?.["clearingOffsetMs"] ?? 500))
    }

    return Cookies.get(name);
  }

  function refresh(updExpires ?: Date | number, updOptions?: Omit<ReactiveCookieAttributes, 'expires'>): Observable<T> {
    return rc.update().pipe(
      tap((value) => {
        setCookie(value, updExpires ?? expires, updOptions)
      })
    )
  }
}

reactiveCookie.temporal = function<T>(name: string, updateResource: UpdateRecourseType<T>): ReactiveCookie<T> {
  const { rc } = __createReactiveCache__<T>(updateResource, { name }) as { rc: ReactiveCacheObservable<T>, state$: BehaviorSubject<T> };
  let timer: any = undefined;

  return Object.assign(rc, {
    getValue,
    set,
    refresh,
    reset: () => {
      clearTimeout(timer);
      rc.resetState()
    }
  })

  function set(value: T, expires?: Date | number, options?: Omit<ReactiveCookieAttributes, 'expires'>): string | undefined {
    rc.next(value);

    return setCookie(value, expires, options?.["clearingOffsetMs"] ?? 500);
  }

  function getValue(): T | undefined {
    const cookieValue = Cookies.get(name);
    let parsedValue: unknown

    try {
      parsedValue = JSON.parse(cookieValue ?? '') as unknown
    } catch (_ignored) { /* empty */ }

    if(typeof parsedValue === 'object' && parsedValue !== null && 'x' in parsedValue && 'd' in parsedValue) {
      return parsedValue.d as T
    }

    return undefined;
  }

  function setCookie(value: T, expires?: Date | number, clearingOffsetMs = 500): string | undefined {
    const expiresDate: Date | undefined = expires ? new Date(expires instanceof Date ? expires : Date.now() + expires * 24 * 60 * 60 * 1000) : undefined;

    clearTimeout(timer);
    if (expiresDate) {
      timer = setTimeout(() => {
        rc.resetState();
      }, expiresDate.getTime() - Date.now() - clearingOffsetMs)
    }

    return undefined
  }

  function refresh(): Observable<T> {
    return rc.update()
  }
}
