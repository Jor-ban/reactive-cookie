import {first, Observable} from "rxjs";
import {EMPTY_SYMBOL} from "@reactive-cache/core";
import {reactiveCookie} from "./index.js";

function expectNotificationsToCome<T>(name: string, obs: Observable<T>, expectedValue: T): Promise<void> {
  return new Promise((res, rej) => {
    const sub = obs.pipe(first()).subscribe((value) => {
      if(value === expectedValue) {
        console.log(' > ' + name + ' has emitted successfully [' + value + ']');
        res()
        setTimeout(() => {
          sub.unsubscribe()
        })
      } else if(value !== EMPTY_SYMBOL) {
        rej('===== ' + name + ' has not accessed successfully [' + value + '] - expected: {' + expectedValue + '}')
      }
    })

    setTimeout(() => {
      rej('===== ' + name + ' has not completed successfully, expected to be: ' + expectedValue)
    }, 1000);
  })
}

const cookie = reactiveCookie<string>(
  'test',
  new Observable(sub => {
    setTimeout(() => {
      sub.next('test')
      sub.complete()
    }, 300)
  }),
  900
);

await expectNotificationsToCome('cookie', cookie, 'test').then(() => {
  console.log(' > test has passed successfully')
})