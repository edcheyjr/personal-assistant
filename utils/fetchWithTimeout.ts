interface RequestInitMS extends RequestInit {
  timeout?: number
  signals?: Array<AbortSignal>
}
/**
 * Fetch with Timeout
 * @param {RequestInfo | URL} input request made
 * @param {RequestInitMS} initMS Request initialization extended with abort signals and timeout
 * @param {RequestInitMS} initMS.timeout time in milliseconds
 * @param {RequestInitMS} initMS.signals abort signals
 * @returns promise with response
 */
export const fetchWithTimeout = async (
  input: RequestInfo | URL,
  initMS?: RequestInitMS
) => {
  // if no options are provided, do regular fetch
  if (!initMS) return await fetch(input)
  let { timeout, signals, ...init } = initMS
  // if no timeout or signals is provided, do regular fetch with options
  if (!timeout && !signals) return await fetch(input, init)
  signals ||= []
  // if signal is empty and signals only has one item,
  // set signal to it and do regular fetch
  if (signals.length === 1 && !init.signal)
    return await fetch(input, { ...init, signal: signals[0] })
  // if signal is set, push to signals array
  init.signal && signals.push(init.signal)
  const controller = new AbortController()
  // timeout setup
  let timeoutId: ReturnType<typeof setTimeout>
  if (timeout) {
    const reason = new DOMException(
      `signal timed out (${timeout}ms)`,
      "TimeoutError"
    )
    timeoutId = setTimeout(() => controller.abort(reason), timeout)
  }
  // add event listener
  for (let i = 0, len = signals.length; i < len; i++) {
    // if signal is already aborted, abort timeout signal
    if (signals[i].aborted) {
      controller.abort(signals[i].reason)
      break
    }
    // else add on signal abort: abort timeout signal
    signals[i].addEventListener(
      "abort",
      () => {
        controller.abort(signals![i].reason)
        timeout && clearTimeout(timeoutId)
      },
      { signal: controller.signal }
    )
  }
  let res
  try {
    res = await fetch(input, {
      ...init,
      signal: controller.signal,
    })
  } finally {
    timeout && clearTimeout(timeoutId!)
  }
  return res
}
