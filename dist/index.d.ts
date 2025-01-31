
import {CookieAttributes} from 'js-cookie';
import {Observable} from "rxjs";
import {UpdateRecourseType} from "@reactive-cache/core";

export type ReactiveCookieAttributes = CookieAttributes & {
  clearingOffsetMs?: number
}
export type ReactiveCookie<T> = Observable<T> & {
  set(value: T, expires ?: Date | number, options?: Omit<ReactiveCookieAttributes, 'expires'>): string | undefined;
  getValue(): T | undefined;
  refresh(expires ?: Date | number, options?: Omit<ReactiveCookieAttributes, 'expires'>): Observable<T>;
  reset(): void;
}

export function reactiveCookie<T>(name: string, updateResource: UpdateRecourseType<T>, expires?: Date | number): ReactiveCookie<T> {}
reactiveCookie.temporal = function<T>(name: string, updateResource: UpdateRecourseType<T>): ReactiveCookie<T> {}