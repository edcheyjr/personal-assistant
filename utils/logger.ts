type LogTypes = "error" | "info" | "warning" | "table"
/**
 * Logs messages to the console based on the specified log type.
 * Logging is disabled in production (`APP_ENV === "production"`).
 *
 * @param {any} item - The message or object to be logged.
 * @param {string} [label=""] - Optional label to provide context for the log message.
 * @param {LogTypes} [type="info"] - The type of log:
 *   - `"info"`: Logs information using `console.log`.
 *   - `"error"`: Logs errors using `console.error`.
 *   - `"warning"`: Logs warnings using `console.warn`.
 * @param {boolean} [showFlag=false] - whether to show also in production.
 * @throws {Error} Throws an error if the log type is invalid.
 *
 * @example
 * logger("just a message!");
 *
 * @example
 * // Logs an info message
 * logger({ key: "value" }, "Object Info", "info");
 *
 * @example
 * // Logs an error message
 * logger("Something went wrong", "Error", "error");
 *
 * @example
 * // Logs a warning message
 * logger("This is a warning", "Warning", "warning");
 *
 * @example
 * // Logs a table message
 * logger(table);
 *
 * @example
 * // Allow to be seen in production
 * logger("This is seen in production", "Warning", "warning",true); //showFlag is true
 *
 */
export function logger(
  item: any,
  label: string = "",
  type: LogTypes = "info",
  showFlag: boolean = false
) {
  if (!showFlag || process.env.APP_ENV != "production") {
    switch (type) {
      case "info":
        console.log(label, item)
        break
      case "error":
        console.error(label, item)
        break
      case "warning":
        console.warn(label, item)
        break
      case "table":
        console.table(item)
        break
      default:
        throw Error("unknown type, please select only valid types")
    }
  }
}
