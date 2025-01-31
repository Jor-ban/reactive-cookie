import { __createReactiveCache__, EMPTY_SYMBOL } from "@reactive-cache/core";
import Cookies from 'js-cookie';
import { tap } from "rxjs";
export function reactiveCookie(name, updateResource, expires) {
    const { rc } = __createReactiveCache__(updateResource, { name }, (v) => {
        if (v !== EMPTY_SYMBOL) {
            setCookie(v, expires);
        }
    });
    let timer = undefined;
    const cookieValue = Cookies.get(name);
    let parsedValue = '';
    try {
        parsedValue = JSON.parse(cookieValue !== null && cookieValue !== void 0 ? cookieValue : '');
    }
    catch (_ignored) { }
    if (typeof parsedValue === 'object' &&
        parsedValue !== null &&
        'x' in parsedValue &&
        'd' in parsedValue &&
        typeof parsedValue.x === 'number' &&
        Date.now() < parsedValue.x) {
        rc.next(parsedValue.d);
        clearTimeout(timer);
        timer = setTimeout(() => {
            rc.resetState();
        }, parsedValue.x - Date.now() - 500);
    }
    return Object.assign(rc, {
        getValue,
        set,
        refresh,
        reset: () => {
            clearTimeout(timer);
            rc.resetState();
        }
    });
    function set(value, expires, options) {
        rc.next(value);
        return setCookie(value, expires, options);
    }
    function getValue() {
        const cookieValue = Cookies.get(name);
        let parsedValue;
        try {
            parsedValue = JSON.parse(cookieValue !== null && cookieValue !== void 0 ? cookieValue : '');
        }
        catch (_ignored) { }
        if (typeof parsedValue === 'object' && parsedValue !== null && 'x' in parsedValue && 'd' in parsedValue) {
            return parsedValue.d;
        }
        return undefined;
    }
    function setCookie(value, cExpires, options) {
        var _a, _b;
        const exp = cExpires !== null && cExpires !== void 0 ? cExpires : expires;
        const expiresDate = exp ? new Date(exp instanceof Date ? exp : Date.now() + exp * 24 * 60 * 60 * 1000) : undefined;
        Cookies.set(name, JSON.stringify({
            d: value,
            x: (_a = expiresDate === null || expiresDate === void 0 ? void 0 : expiresDate.getTime()) !== null && _a !== void 0 ? _a : 0,
        }), Object.assign(Object.assign({}, options), { expires: expiresDate }));
        clearTimeout(timer);
        if (expiresDate) {
            timer = setTimeout(() => {
                rc.resetState();
            }, expiresDate.getTime() - Date.now() - ((_b = options === null || options === void 0 ? void 0 : options["clearingOffsetMs"]) !== null && _b !== void 0 ? _b : 500));
        }
        return Cookies.get(name);
    }
    function refresh(updExpires, updOptions) {
        return rc.update().pipe(tap((value) => {
            setCookie(value, updExpires !== null && updExpires !== void 0 ? updExpires : expires, updOptions);
        }));
    }
}
reactiveCookie.temporal = function (name, updateResource) {
    const { rc } = __createReactiveCache__(updateResource, { name });
    let timer = undefined;
    return Object.assign(rc, {
        getValue,
        set,
        refresh,
        reset: () => {
            clearTimeout(timer);
            rc.resetState();
        }
    });
    function set(value, expires, options) {
        var _a;
        rc.next(value);
        return setCookie(value, expires, (_a = options === null || options === void 0 ? void 0 : options["clearingOffsetMs"]) !== null && _a !== void 0 ? _a : 500);
    }
    function getValue() {
        const cookieValue = Cookies.get(name);
        let parsedValue;
        try {
            parsedValue = JSON.parse(cookieValue !== null && cookieValue !== void 0 ? cookieValue : '');
        }
        catch (_ignored) { }
        if (typeof parsedValue === 'object' && parsedValue !== null && 'x' in parsedValue && 'd' in parsedValue) {
            return parsedValue.d;
        }
        return undefined;
    }
    function setCookie(value, expires, clearingOffsetMs = 500) {
        const expiresDate = expires ? new Date(expires instanceof Date ? expires : Date.now() + expires * 24 * 60 * 60 * 1000) : undefined;
        clearTimeout(timer);
        if (expiresDate) {
            timer = setTimeout(() => {
                rc.resetState();
            }, expiresDate.getTime() - Date.now() - clearingOffsetMs);
        }
        return undefined;
    }
    function refresh() {
        return rc.update();
    }
};
