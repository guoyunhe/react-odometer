import { forwardRef, useEffect, useState } from 'react';
import type { ComponentPropsWithoutRef } from 'react';

/**
 * Props for `Odometer`, including standard span attributes except `children` and
 * `dangerouslySetInnerHTML`, which are managed by the component.
 */
export interface OdometerProps extends Omit<
  ComponentPropsWithoutRef<'span'>,
  'children' | 'dangerouslySetInnerHTML'
> {
  /** Numeric value to display. Negative values include a leading minus sign. */
  value: number;

  /** Digit animation duration in milliseconds. @default 1000 */
  duration?: number;

  /** Number of digits after the decimal separator. Values are rounded to this precision. @default 0 */
  decimals?: number;

  /**
   * String inserted between groups of three integer digits; an empty string disables grouping.
   *
   * @default ''
   */
  separator?: string;

  /** String inserted between the integer and fractional digits. @default '.' */
  decimal?: string;
}

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

function Digit({ digit, duration }: { digit: number; duration: number }) {
  // render at 0 first so that mounting digits animate in
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    setCurrent(digit);
  }, [digit]);
  return (
    <span style={{ display: 'inline-block', height: '1em', overflow: 'hidden', lineHeight: 1 }}>
      <span
        style={{
          display: 'flex',
          flexDirection: 'column',
          transform: `translateY(-${current}em)`,
          transition: `transform ${duration}ms ease-out`,
        }}
      >
        {DIGITS.map((d) => (
          <span key={d} style={{ height: '1em' }}>
            {d}
          </span>
        ))}
      </span>
    </span>
  );
}

/** Renders a number as animated, vertically scrolling digits. */
export const Odometer = forwardRef<HTMLSpanElement, OdometerProps>(function Odometer(
  {
    value,
    duration = 1000,
    decimals = 0,
    separator = '',
    decimal = '.',
    className,
    style,
    ...spanProps
  },
  ref,
) {
  const [int, frac] = Math.abs(value).toFixed(decimals).split('.');
  const intChars = int.split('');
  const nodes = intChars.map((ch, i) => {
    const pos = intChars.length - i; // stable key from the right
    const sep = separator && i > 0 && pos % 3 === 0 ? separator : null;
    return (
      <span key={`i${pos}`}>
        {sep}
        <Digit digit={Number(ch)} duration={duration} />
      </span>
    );
  });
  return (
    <span
      {...spanProps}
      ref={ref}
      className={className}
      style={{ display: 'inline-flex', alignItems: 'baseline', ...style }}
    >
      {value < 0 && '-'}
      {nodes}
      {frac !== undefined && <span>{decimal}</span>}
      {frac?.split('').map((ch, i) => (
        <span key={`f${i}`}>
          <Digit digit={Number(ch)} duration={duration} />
        </span>
      ))}
    </span>
  );
});
