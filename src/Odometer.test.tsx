import { cleanup, fireEvent, render } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Odometer } from './Odometer';

afterEach(() => {
  cleanup();
});

function getRollers(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>('span')).filter((element) =>
    element.style.transform.startsWith('translateY('),
  );
}

describe('Odometer', () => {
  it('renders integer digits with the default animation duration', () => {
    const { container } = render(<Odometer value={123} />);
    const rollers = getRollers(container);

    expect(rollers.map((roller) => roller.style.transform)).toEqual([
      'translateY(-1em)',
      'translateY(-2em)',
      'translateY(-3em)',
    ]);
    expect(rollers[0].style.transition).toBe('transform 1000ms ease-out');
  });

  it('formats negative fractional values and forwards display props', () => {
    const { container } = render(
      <Odometer
        value={-1234.567}
        decimals={2}
        separator=','
        decimal=','
        duration={350}
        className='price'
        style={{ color: 'red' }}
      />,
    );
    const root = container.firstElementChild as HTMLElement;
    const rollers = getRollers(container);

    expect(root.className).toBe('price');
    expect(root.style.color).toBe('red');
    expect(root.style.alignItems).toBe('baseline');
    expect(root.firstChild?.textContent).toBe('-');
    expect(root.children[1].firstChild?.textContent).toBe(',');
    expect(root.children[4].textContent).toBe(',');
    expect(rollers.map((roller) => roller.style.transform)).toEqual([
      'translateY(-1em)',
      'translateY(-2em)',
      'translateY(-3em)',
      'translateY(-4em)',
      'translateY(-5em)',
      'translateY(-7em)',
    ]);
    expect(rollers.every((roller) => roller.style.transition === 'transform 350ms ease-out')).toBe(
      true,
    );
  });

  it('rounds values and omits the decimal separator when decimals are zero', () => {
    const { container } = render(<Odometer value={1.5} decimals={0} />);
    const rollers = getRollers(container);

    expect(rollers).toHaveLength(1);
    expect(rollers[0].style.transform).toBe('translateY(-2em)');
    expect(container.firstElementChild?.textContent).not.toContain('.');
  });

  it('forwards native span props, event handlers, and refs', () => {
    const onClick = vi.fn();
    const ref = createRef<HTMLSpanElement>();
    const { getByRole } = render(
      <Odometer
        value={42}
        id='current-count'
        role='img'
        aria-label='Current count'
        data-kind='counter'
        title='Current count'
        onClick={onClick}
        ref={ref}
      />,
    );
    const root = getByRole('img', { name: 'Current count' });

    expect(root.id).toBe('current-count');
    expect(root.getAttribute('data-kind')).toBe('counter');
    expect(root.getAttribute('title')).toBe('Current count');
    expect(ref.current).toBe(root);

    fireEvent.click(root);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
