import 'mocha'
import chaiAsPromised from 'chai-as-promised'
import { expect, use } from 'chai'
use(chaiAsPromised)

import { AutoRetryable } from './AutoRetryable'

describe('AutoRetryable', () => {
  describe('First attempt', () => {
    it('returns a success report if the function succeeds', () => {
      const tryMe = (): Promise<string> =>
        new Promise(resolve =>
          setTimeout(() => {
            resolve('Resolved value')
          }, 10)
        )

      const result = new AutoRetryable(tryMe).run()
      return expect(result)
        .to.eventually.include({ success: true, value: 'Resolved value' })
        .and.not.have.property('error')
    })

    it('returns a failure report if the Promise rejects', () => {
      const tryMe = (): Promise<Error> =>
        new Promise((_, reject) =>
          setTimeout(() => {
            reject(new Error())
          }, 10)
        )

      const result = new AutoRetryable(tryMe).run()
      return expect(result)
        .to.eventually.include({
          success: false
        })
        .and.have.property('error')
        .that.is.an.instanceOf(Error)
    })
  })

  describe('Retries', () => {
    it('retries a function at least once', done => {
      let tried = false

      function tryMe(): Promise<void> {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            // Reject the first attempt
            if (!tried) reject((tried = true))
            else {
              // Second attempt. Resolve the promise to stop retries and pass the test.
              resolve()
              done()
            }
          }, 10)
        })
      }

      new AutoRetryable(tryMe, { maxTries: 2 }).run()
    })

    it('stops retrying after reaching the max number of tries', done => {
      let tries = 0

      // Always reject. This increases the tries counter once per attempt.
      // At the end of it, the number of tries should be equal to maxTries.
      function tryMe(): Promise<never> {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            tries++
            reject()
          }, 10)
        })
      }

      // Every request fires on a 10ms timeout. After three requests, the number of tries should equal maxTries and stop.
      // The extra time is there to guarantee that the test waits long enough for the possibility that the request fires more than three times.
      setTimeout(() => {
        expect(tries).to.equal(3)
        done()
      }, 80)

      new AutoRetryable(tryMe, { maxTries: 3 }).run()
    })

    it('waits for a specified interval between retries', done => {
      const interval = 50,
        maxTries = 5

      // Keep track of how much time has elapsed since the last request
      let lastIteration = Date.now()
      let tries = 0

      function tryMe(): Promise<void> {
        return new Promise((resolve, reject) => {
          tries++

          // Resolve and pass the test if we reach the fifth try without failing
          if (tries === maxTries) {
            resolve()
            done()
          } else {
            const now = Date.now()

            // Ignore the first attempt as it's fired immediately on .start and doesn't wait for the interval
            // We're expecting each iteration to wait for at least the 50ms
            // And give some padding time to allow for sync process time
            if (tries > 1) expect(now - lastIteration).to.be.within(interval, interval + 5)

            lastIteration = now

            reject()
          }
        })
      }

      new AutoRetryable(tryMe, { interval, maxTries }).run()
    })
  })

  describe('Event handlers', () => {
    it('calls the onFailure handler after failing', done => {
      const tryMe = (): Promise<never> =>
        new Promise((_, reject) => {
          reject()
        })

      // Only need to ensure onFailure gets called
      new AutoRetryable(tryMe, {
        onFailure: (): void => done()
      }).run()
    })

    it('calls the onSuccess handler when it succeeds', done => {
      const tryMe = (): Promise<void> =>
        new Promise(resolve => {
          resolve()
        })

      // Only need to ensure onSuccess gets called
      new AutoRetryable(tryMe, {
        onSuccess: (): void => done()
      }).run()
    })

    it('stops trying if shouldRetry returns false', done => {
      let tries = 0

      const tryMe = (): Promise<void> =>
        new Promise((_, reject) => {
          tries++
          reject()
        })

      setTimeout(() => {
        expect(tries).to.equal(1)
        done()
      }, 10)

      // shouldRetry immediately returns false. This means that the first attempt must run, but the second gets immediately cancelled.
      new AutoRetryable(tryMe, { shouldRetry: (): false => false }).run()
    })

    it('stops trying if shouldSetRetry returns false', done => {
      let tries = 0

      const tryMe = (): Promise<void> =>
        new Promise((_, reject) => {
          tries++
          reject()
        })

      setTimeout(() => {
        expect(tries).to.equal(1)
        done()
      }, 10)

      // shouldSetRetry immediately returns false. This means that the first attempt must run, but the second gets immediately cancelled.
      new AutoRetryable(tryMe, { shouldSetRetry: (): false => false }).run()
    })
  })
})
