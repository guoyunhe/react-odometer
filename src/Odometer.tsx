import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';

export interface OdometerProps {
  value: number;
  /** Animation duration in milliseconds */
  duration?: number;
  /** Number of fraction digits */
  decimals?: number;
  /** Thousands separator, empty for none */
  separator?: string;
  decimal?: string;
  className?: string;
  style?: CSSProperties;
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

export function Odometer({
  value,
  duration = 1000,
  decimals = 0,
  separator = '',
  decimal = '.',
  className,
  style,
}: OdometerProps) {
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
}
