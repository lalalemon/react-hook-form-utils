# react-hook-form-utils

[![npm](https://img.shields.io/badge/npm-0.1.0-red.svg)](https://www.npmjs.com/package/react-hook-form-utils)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![React Hook Form](https://img.shields.io/badge/React%20Hook%20Form-7.x-ec5990.svg)](https://react-hook-form.com/)

Utility hooks and validators for [React Hook Form](https://react-hook-form.com/) — debounced auto-save, field-level undo/redo, localStorage persistence, and composable validation rules.

## Installation

```bash
npm install react-hook-form-utils
# or
yarn add react-hook-form-utils
# or
pnpm add react-hook-form-utils
```

## Hooks

### `useAutoSave`

Debounced auto-save — watches all form fields and triggers a save callback after the user stops typing.

```tsx
import { useForm } from "react-hook-form";
import { useAutoSave } from "react-hook-form-utils";

function MyForm() {
  const { watch, register } = useForm({
    defaultValues: { title: "", body: "" },
  });

  useAutoSave({
    watch,
    onSave: async (data) => {
      await fetch("/api/draft", { method: "POST", body: JSON.stringify(data) });
    },
    debounceMs: 2000,
  });

  return (
    <form>
      <input {...register("title")} />
      <textarea {...register("body")} />
    </form>
  );
}
```

| Option | Type | Default | Description |
|---|---|---|---|
| `watch` | `UseFormWatch<T>` | required | Form's watch function |
| `onSave` | `(data: T) => void \| Promise<void>` | required | Save callback |
| `debounceMs` | `number` | `1000` | Debounce delay |
| `enabled` | `boolean` | `true` | Enable/disable auto-save |

---

### `useFieldHistory`

Track changes on a specific field with undo/redo support.

```tsx
import { useForm } from "react-hook-form";
import { useFieldHistory } from "react-hook-form-utils";

function MyForm() {
  const { register, watch, setValue } = useForm({
    defaultValues: { bio: "" },
  });

  const { undo, redo, canUndo, canRedo } = useFieldHistory({
    watch,
    setValue,
    fieldName: "bio",
    maxHistory: 30,
  });

  return (
    <>
      <textarea {...register("bio")} />
      <button onClick={undo} disabled={!canUndo}>↩ Undo</button>
      <button onClick={redo} disabled={!canRedo}>↪ Redo</button>
    </>
  );
}
```

| Option | Type | Default | Description |
|---|---|---|---|
| `watch` | `UseFormWatch<T>` | required | Form's watch function |
| `setValue` | `UseFormSetValue<T>` | required | Form's setValue function |
| `fieldName` | `FieldPath<T>` | required | Field to track |
| `maxHistory` | `number` | `50` | Max history entries |

Returns `{ undo, redo, canUndo, canRedo, history, currentIndex }`.

---

### `useFormPersist`

Automatically persist and restore form values in `localStorage`.

```tsx
import { useForm } from "react-hook-form";
import { useFormPersist } from "react-hook-form-utils";

function MyForm() {
  const { register, watch, setValue } = useForm({
    defaultValues: { email: "", message: "" },
  });

  const { clearPersisted } = useFormPersist({
    watch,
    setValue,
    storageKey: "contact-form-draft",
    exclude: ["password"],
    debounceMs: 1000,
  });

  return (
    <form>
      <input {...register("email")} />
      <textarea {...register("message")} />
      <button type="button" onClick={clearPersisted}>Clear draft</button>
    </form>
  );
}
```

| Option | Type | Default | Description |
|---|---|---|---|
| `watch` | `UseFormWatch<T>` | required | Form's watch function |
| `setValue` | `UseFormSetValue<T>` | required | Form's setValue function |
| `storageKey` | `string` | required | localStorage key |
| `exclude` | `string[]` | `[]` | Fields to exclude |
| `debounceMs` | `number` | `500` | Debounce before saving |
| `enabled` | `boolean` | `true` | Enable/disable |

Returns `{ clearPersisted, restore }`.

## Validators

Composable validation rules for use with `register` or `validate`:

```tsx
import { email, min, minLength, maxLength, compose, required } from "react-hook-form-utils";

<input {...register("email", {
  validate: compose(required(), email("Please enter a valid email")),
})} />

<input {...register("age", {
  validate: min(18, "Must be at least 18"),
})} />

<input {...register("username", {
  validate: compose(
    required(),
    minLength(3, "Too short"),
    maxLength(20, "Too long"),
    pattern(/^[a-z0-9_]+$/, "Only lowercase, numbers, underscores"),
  ),
})} />
```

### Available Validators

| Validator | Signature | Description |
|---|---|---|
| `email` | `email(msg?)` | RFC 5322 simplified email format |
| `phone` | `phone(msg?)` | International phone number format |
| `url` | `url(msg?)` | Valid URL (uses `URL` constructor) |
| `min` | `min(n, msg?)` | Minimum numeric value |
| `max` | `max(n, msg?)` | Maximum numeric value |
| `minLength` | `minLength(n, msg?)` | Minimum string length |
| `maxLength` | `maxLength(n, msg?)` | Maximum string length |
| `pattern` | `pattern(re, msg?)` | Regex pattern match |
| `required` | `required(msg?)` | Non-empty value |
| `compose` | `compose(...validators)` | Chain validators, short-circuit on first failure |

All validators return `(value: unknown) => true | string`. Return `true` means valid; a string means error message.

## Peer Dependencies

- `react` >= 18.0.0
- `react-hook-form` >= 7.0.0

## Testing

```bash
npm install
npm test
```

## License

[MIT](LICENSE)
