import { forwardRef, useEffect, useRef, useState } from 'react';
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

  /**
   * Digit animation duration in milliseconds. Wheel travel follows the value change, capped at ten
   * full turns per update.
   *
   * @default 1000
   */
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
const DEGREES_PER_DIGIT = 36;
const MAX_TURNS = 10n;

function capRollSteps(delta: bigint) {
  const direction = delta < 0n ? -1n : 1n;
  const distance = delta < 0n ? -delta : delta;
  const turns = distance / 10n;
  const cappedTurns = turns > MAX_TURNS ? MAX_TURNS : turns;
  return direction * (cappedTurns * 10n + (distance % 10n));
}

function Digit({ position, duration }: { position: bigint; duration: number }) {
  const digit = Number(position % 10n);
  const previousPosition = useRef(position - BigInt(digit));
  const [rotation, setRotation] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const delta = position - previousPosition.current;
    previousPosition.current = position;
    if (delta === 0n) return;

    setIsAnimating(true);
    setRotation((current) => current - Number(capRollSteps(delta)) * DEGREES_PER_DIGIT);
  }, [position]);

  return (
    <span
      style={{
        display: 'inline-block',
        position: 'relative',
        width: '1ch',
        height: '1em',
        overflow: 'hidden',
        lineHeight: 1,
        letterSpacing: 'normal',
        fontVariantNumeric: 'tabular-nums',
        perspective: '24em',
      }}
    >
      <span
        data-odometer-wheel
        onTransitionEnd={(event) => {
          if (event.target !== event.currentTarget || event.propertyName !== 'transform') return;
          setIsAnimating(false);
          setRotation(-digit * DEGREES_PER_DIGIT);
        }}
        style={{
          position: 'absolute',
          inset: 0,
          transformStyle: 'preserve-3d',
          transform: `rotateX(${rotation}deg)`,
          transition: isAnimating ? `transform ${duration}ms ease-out` : 'none',
        }}
      >
        {DIGITS.map((d) => (
          <span
            key={d}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'grid',
              placeItems: 'center',
              backfaceVisibility: 'hidden',
              transform: `rotateX(${d * DEGREES_PER_DIGIT}deg) translateZ(1.618em)`,
            }}
          >
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
  const decimalPlaces = frac?.length ?? 0;
  const scaledValue = BigInt(`${int}${frac ?? ''}`);
  const nodes = intChars.map((ch, i) => {
    const pos = intChars.length - i; // stable key from the right
    const sep = separator && i > 0 && pos % 3 === 0 ? separator : null;
    const place = pos - 1 + decimalPlaces;
    return (
      <span key={`i${pos}`}>
        {sep}
        <Digit position={scaledValue / 10n ** BigInt(place)} duration={duration} />
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
      {frac?.split('').map((_, i) => (
        <span key={`f${i}`}>
          <Digit
            position={scaledValue / 10n ** BigInt(decimalPlaces - i - 1)}
            duration={duration}
          />
        </span>
      ))}
    </span>
  );
});
