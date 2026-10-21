# @guoyunhe/react-odometer

A React component for smooth, rolling number animations.

## Install

```sh
pnpm add @guoyunhe/react-odometer
```

React 18 or later is required.

## Usage

```tsx
import { Odometer } from '@guoyunhe/react-odometer';
import { useState } from 'react';

export function Counter() {
  const [value, setValue] = useState(12345);

  return (
    <button onClick={() => setValue((current) => current + 1)}>
      <Odometer value={value} separator=',' />
    </button>
  );
}
```

`OdometerProps` is also exported for TypeScript users.

## API

| Prop        | Type            | Default | Description                                       |
| ----------- | --------------- | ------- | ------------------------------------------------- |
| `value`     | `number`        | —       | Number to display.                                |
| `duration`  | `number`        | `1000`  | Digit animation duration in milliseconds.         |
| `decimals`  | `number`        | `0`     | Number of fraction digits to display.             |
| `separator` | `string`        | `''`    | Thousands separator; an empty string disables it. |
| `decimal`   | `string`        | `'.'`   | Decimal separator.                                |
| `className` | `string`        | —       | Class name applied to the root element.           |
| `style`     | `CSSProperties` | —       | Inline styles applied to the root element.        |

Negative values are displayed with a leading minus sign. The component uses the surrounding font size and inherits text styling.

## License

Licensed under the [GNU Affero General Public License v3.0 only](./LICENSE).

## Development preview

Start the Vite playground to preview the component while editing its source:

```sh
pnpm install
pnpm dev
```

Open the local URL printed by Vite. The playground imports the component directly from `src`, so edits are reflected with hot module replacement. To build the playground, run:

```sh
pnpm playground:build
```

To watch the library build instead, run `pnpm dev:lib`.
