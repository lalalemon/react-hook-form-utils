/**
 * Pre-built validation rules for React Hook Form.
 *
 * Each validator returns a `Validate` function compatible with
 * `register("field", { validate: ... })` or `useForm` resolver.
 *
 * @example
 * ```tsx
 * import { email, min, compose } from "react-hook-form-utils";
 *
 * <input {...register("email", { validate: email("Invalid email") })} />
 * <input {...register("age", { validate: min(18, "Must be 18+") })} />
 * <input {...register("username", {
 *   validate: compose(
 *     minLength(3, "Too short"),
 *     maxLength(20, "Too long"),
 *   )
 * })} />
 * ```
 */

export type ValidatorRule = (value: unknown) => true | string;

/**
 * Validate email format.
 */
export function email(message = "Invalid email address"): ValidatorRule {
  return (value: unknown) => {
    if (!value || typeof value !== "string") return true;
    // RFC 5322 simplified
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(value) || message;
  };
}

/**
 * Validate phone number (international format).
 */
export function phone(message = "Invalid phone number"): ValidatorRule {
  return (value: unknown) => {
    if (!value || typeof value !== "string") return true;
    const re = /^\+?[\d\s\-().]{7,20}$/;
    return re.test(value) || message;
  };
}

/**
 * Validate URL format.
 */
export function url(message = "Invalid URL"): ValidatorRule {
  return (value: unknown) => {
    if (!value || typeof value !== "string") return true;
    try {
      new URL(value);
      return true;
    } catch {
      return message;
    }
  };
}

/**
 * Validate minimum numeric value (inclusive).
 */
export function min(minimum: number, message?: string): ValidatorRule {
  return (value: unknown) => {
    if (value === undefined || value === null || value === "") return true;
    const num = Number(value);
    if (isNaN(num)) return true;
    return num >= minimum || message || `Must be at least ${minimum}`;
  };
}

/**
 * Validate maximum numeric value (inclusive).
 */
export function max(maximum: number, message?: string): ValidatorRule {
  return (value: unknown) => {
    if (value === undefined || value === null || value === "") return true;
    const num = Number(value);
    if (isNaN(num)) return true;
    return num <= maximum || message || `Must be at most ${maximum}`;
  };
}

/**
 * Validate minimum string/array length.
 */
export function minLength(length: number, message?: string): ValidatorRule {
  return (value: unknown) => {
    if (!value) return true;
    const str = String(value);
    return str.length >= length || message || `Must be at least ${length} characters`;
  };
}

/**
 * Validate maximum string/array length.
 */
export function maxLength(length: number, message?: string): ValidatorRule {
  return (value: unknown) => {
    if (!value) return true;
    const str = String(value);
    return str.length <= length || message || `Must be at most ${length} characters`;
  };
}

/**
 * Validate against a regex pattern.
 */
export function pattern(re: RegExp, message = "Invalid format"): ValidatorRule {
  return (value: unknown) => {
    if (!value || typeof value !== "string") return true;
    return re.test(value) || message;
  };
}

/**
 * Compose multiple validators into one. Runs in order, returns first failure.
 */
export function compose(...validators: ValidatorRule[]): ValidatorRule {
  return (value: unknown) => {
    for (const validator of validators) {
      const result = validator(value);
      if (result !== true) return result;
    }
    return true;
  };
}

/**
 * Require a non-empty value.
 */
export function required(message = "This field is required"): ValidatorRule {
  return (value: unknown) => {
    if (value === undefined || value === null || value === "") return message;
    if (typeof value === "string" && value.trim() === "") return message;
    return true;
  };
}
