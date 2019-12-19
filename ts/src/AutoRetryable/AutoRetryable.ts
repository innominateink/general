interface Options {
  /** Maximum number of tries before calling the onFailure handler */
  maxTries: number
  /** Timeout to apply between requests */
  interval: number
  /** Called when the request fails with the maximum number of tries. Receives the original message body back. */
  onFailure: () => void
  /** Called after the request succeeds. */
  onSuccess: () => void
  /** Called when a request is aborted by returning false from one of the check handlers. */
  onAbort: () => void
  /** Called after a request fails and before setting the timeout for the next one. Return false to abort operation. */
  shouldSetRetry: () => boolean
  /** Called immediately before retrying a request. Return false to abort the operation. */
  shouldRetry: () => boolean
}

interface AutoRetryableReport {
  success: boolean
}

interface AutoRetryableSuccessReport extends AutoRetryableReport {
  value: any
}

interface AutoRetryableErrorReport extends AutoRetryableReport {
  error: Error | string
}

export class AutoRetryable {
  private fn: () => Promise<any>

  /** Current number of tried requests */
  private tries: number
  /** Maximum number of tries before calling the onFailure handler */
  private maxTries: number
  /** Timeout to apply between requests */
  private interval: number

  private onSuccess?: () => void
  private onFailure?: () => void
  private shouldSetRetry?: () => boolean
  private shouldRetry?: () => boolean

  /** Current state of the retryable. Undefined if start has not been called yet. */
  public state?: 'pending' | 'failed' | 'succeeded'
  public started: boolean

  constructor(
    fn: () => Promise<any>,
    { maxTries, interval, onFailure, onSuccess, shouldSetRetry, shouldRetry }: Partial<Options> = {}
  ) {
    // Request options
    this.fn = fn

    // Retry options
    this.tries = 0
    this.maxTries = maxTries || 3
    this.interval = interval || 0

    // Handlers
    this.onFailure = onFailure
    this.onSuccess = onSuccess
    this.shouldSetRetry = shouldSetRetry
    this.shouldRetry = shouldRetry

    // States
    this.started = false
  }

  public async run(): Promise<AutoRetryableSuccessReport | AutoRetryableErrorReport> {
    if (this.started)
      return {
        success: false,
        error: 'Request has already started running.'
      }

    this.state = 'pending'

    try {
      this.started = true

      let value = await this.fire()

      return {
        success: true,
        value
      }
    } catch (e) {
      // Catch the error returned by the first fire attempt
      return {
        success: false,
        value: 'woof',
        error: e
      }
    }
  }

  private async fire(): Promise<any> {
    this.tries++

    try {
      let result = await this.fn()

      // Update state and call onSuccess handler if request succeeds
      this.state = 'succeeded'
      if (this.onSuccess) this.onSuccess()

      return result
    } catch (e) {
      if (this.tries < this.maxTries) {
        // Set up next request if not at maximum number of tries and beforeSetRetry allows, if it is set
        if (!this.shouldSetRetry || this.shouldSetRetry()) {
          setTimeout(() => {
            // Call beforeRetry handler to check if the request should be retried
            if (!this.shouldRetry || this.shouldRetry()) {
              this.fire()
            }
          }, this.interval)
        }
      } else {
        // Update state to failed and call the failure handler
        this.state = 'failed'
        if (this.onFailure) this.onFailure()
      }

      // Throw the error on the first attempt so it can be caught by to this.run
      if (this.tries === 1) throw e
    }
  }
}
