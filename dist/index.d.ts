
import Cookies from 'js-cookie';
import {Observable} from "rxjs";
import {UpdateRecourseType} from "@reactive-cache/core";

export type ReactiveCookieAttributes = Cookies.CookieAttributes & {
  clearingOffsetMs?: number
}
export type ReactiveCookie<T> = Observable<T> & {
  set(value: T, expires ?: Date | number, options?: Omit<ReactiveCookieAttributes, 'expires'>): string | undefined;
  getValue(): T | undefined;
  refresh(expires ?: Date | number, options?: Omit<ReactiveCookieAttributes, 'expires'>): Observable<T>;
  reset(): void;
}

export declare function reactiveCookie<T>(name: string, updateResource: UpdateRecourseType<T>, expires?: Date | number): ReactiveCookie<T>;

export declare namespace reactiveCookie {
  function temporal<T>(name: string, updateResource: UpdateRecourseType<T>): ReactiveCookie<T>;
}