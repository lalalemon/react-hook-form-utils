import { describe, it, expect } from "vitest";
import {
  email,
  phone,
  url,
  min,
  max,
  minLength,
  maxLength,
  pattern,
  compose,
  required,
} from "../src/validators";

describe("email", () => {
  const validate = email();

  it("accepts valid emails", () => {
    expect(validate("user@example.com")).toBe(true);
    expect(validate("a.b+c@domain.co")).toBe(true);
  });

  it("rejects invalid emails", () => {
    expect(typeof validate("not-an-email")).toBe("string");
    expect(typeof validate("missing@")).toBe("string");
    expect(typeof validate("@no-local.com")).toBe("string");
  });

  it("accepts empty/optional values", () => {
    expect(validate("")).toBe(true);
    expect(validate(null)).toBe(true);
    expect(validate(undefined)).toBe(true);
  });

  it("uses custom message", () => {
    const v = email("bad email");
    expect(v("nope")).toBe("bad email");
  });
});

describe("phone", () => {
  const validate = phone();

  it("accepts valid phone numbers", () => {
    expect(validate("+1234567890")).toBe(true);
    expect(validate("+44 20 7946 0958")).toBe(true);
    expect(validate("(555) 123-4567")).toBe(true);
  });

  it("rejects invalid phone numbers", () => {
    expect(typeof validate("abc")).toBe("string");
    expect(typeof validate("12")).toBe("string");
  });

  it("accepts empty values", () => {
    expect(validate("")).toBe(true);
    expect(validate(null)).toBe(true);
  });
});

describe("url", () => {
  const validate = url();

  it("accepts valid URLs", () => {
    expect(validate("https://example.com")).toBe(true);
    expect(validate("http://localhost:3000/path?q=1")).toBe(true);
    expect(validate("ftp://files.example.com")).toBe(true);
  });

  it("rejects invalid URLs", () => {
    expect(typeof validate("not a url")).toBe("string");
    expect(typeof validate("://missing")).toBe("string");
  });

  it("accepts empty values", () => {
    expect(validate("")).toBe(true);
    expect(validate(undefined)).toBe(true);
  });
});

describe("min", () => {
  const validate = min(18);

  it("accepts values >= min", () => {
    expect(validate(18)).toBe(true);
    expect(validate(25)).toBe(true);
    expect(validate("20")).toBe(true);
  });

  it("rejects values < min", () => {
    expect(typeof validate(17)).toBe("string");
    expect(typeof validate(0)).toBe("string");
    expect(typeof validate("10")).toBe("string");
  });

  it("accepts empty values", () => {
    expect(validate("")).toBe(true);
    expect(validate(null)).toBe(true);
    expect(validate(undefined)).toBe(true);
  });

  it("accepts non-numeric strings", () => {
    expect(validate("abc")).toBe(true);
  });
});

describe("max", () => {
  const validate = max(100);

  it("accepts values <= max", () => {
    expect(validate(100)).toBe(true);
    expect(validate(50)).toBe(true);
  });

  it("rejects values > max", () => {
    expect(typeof validate(101)).toBe("string");
    expect(typeof validate("200")).toBe("string");
  });
});

describe("minLength", () => {
  const validate = minLength(3);

  it("accepts strings >= length", () => {
    expect(validate("abc")).toBe(true);
    expect(validate("hello")).toBe(true);
  });

  it("rejects strings < length", () => {
    expect(typeof validate("ab")).toBe("string");
    expect(typeof validate("a")).toBe("string");
  });

  it("accepts empty values", () => {
    expect(validate("")).toBe(true);
    expect(validate(null)).toBe(true);
  });
});

describe("maxLength", () => {
  const validate = maxLength(5);

  it("accepts strings <= length", () => {
    expect(validate("hello")).toBe(true);
    expect(validate("hi")).toBe(true);
  });

  it("rejects strings > length", () => {
    expect(typeof validate("toolong")).toBe("string");
  });
});

describe("pattern", () => {
  const validate = pattern(/^[A-Z]{3}$/, "Must be 3 uppercase letters");

  it("accepts matching values", () => {
    expect(validate("ABC")).toBe(true);
    expect(validate("XYZ")).toBe(true);
  });

  it("rejects non-matching values", () => {
    expect(validate("abc")).toBe("Must be 3 uppercase letters");
    expect(validate("AB")).toBe("Must be 3 uppercase letters");
  });
});

describe("compose", () => {
  it("returns true when all validators pass", () => {
    const validate = compose(minLength(2), maxLength(10));
    expect(validate("hello")).toBe(true);
  });

  it("returns first failure message", () => {
    const validate = compose(
      minLength(3, "too short"),
      maxLength(5, "too long")
    );
    expect(validate("ab")).toBe("too short");
  });

  it("stops at first failure", () => {
    const calls: string[] = [];
    const v1 = (v: unknown) => { calls.push("v1"); return true; };
    const v2 = () => { calls.push("v2"); return "fail"; };
    const v3 = (v: unknown) => { calls.push("v3"); return true; };
    const validate = compose(v1, v2 as any, v3);
    validate("test");
    expect(calls).toEqual(["v1", "v2"]);
  });
});

describe("required", () => {
  const validate = required();

  it("rejects empty values", () => {
    expect(typeof validate("")).toBe("string");
    expect(typeof validate(null)).toBe("string");
    expect(typeof validate(undefined)).toBe("string");
    expect(typeof validate("   ")).toBe("string");
  });

  it("accepts non-empty values", () => {
    expect(validate("hello")).toBe(true);
    expect(validate("0")).toBe(true);
  });
});
