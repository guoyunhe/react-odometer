import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Odometer } from './Odometer';

let nextFrameId = 0;
let animationFrames = new Map<number, FrameRequestCallback>();

beforeEach(() => {
  nextFrameId = 0;
  animationFrames = new Map();
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    const frameId = nextFrameId++;
    animationFrames.set(frameId, callback);
    return frameId;
  });
  vi.stubGlobal('cancelAnimationFrame', (frameId: number) => {
    animationFrames.delete(frameId);
  });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function getRollers(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>('[data-odometer-wheel]'));
}

function getRotationDegrees(roller: HTMLElement) {
  return Number.parseFloat(roller.style.transform.slice(8, -4));
}

function advanceFrame() {
  const pendingFrames = Array.from(animationFrames.values());
  animationFrames.clear();
  act(() => {
    pendingFrames.forEach((callback) => callback(0));
  });
}

function advancePaintFrames() {
  advanceFrame();
  advanceFrame();
}

describe('Odometer', () => {
  it('animates initial digits after the initial paint', () => {
    const { container } = render(<Odometer value={10} />);
    let rollers = getRollers(container);

    expect(rollers.map((roller) => roller.style.transform)).toEqual([
      'rotateX(0deg)',
      'rotateX(0deg)',
    ]);
    expect(rollers[0].style.transition).toBe('none');

    advancePaintFrames();
    rollers = getRollers(container);
    expect(rollers.map((roller) => roller.style.transform)).toEqual([
      'rotateX(-36deg)',
      'rotateX(-360deg)',
    ]);
    expect(rollers[0].style.transition).toBe('transform 1000ms ease-out');
    expect(rollers[1].style.transition).toBe(rollers[0].style.transition);
    const rotations = rollers.map(getRotationDegrees);
    expect(Math.abs(rotations[1] / rotations[0])).toBe(10);
  });

  it('animates every digit when a multi-digit value first appears', () => {
    const { container } = render(<Odometer value={33_554} separator=',' />);
    advancePaintFrames();
    const rollers = getRollers(container);

    expect(rollers.map((roller) => roller.style.transform)).toEqual([
      'rotateX(-108deg)',
      'rotateX(-1188deg)',
      'rotateX(-3780deg)',
      'rotateX(-3780deg)',
      'rotateX(-3744deg)',
    ]);
    expect(rollers.every((roller) => roller.style.transition === 'transform 1000ms ease-out')).toBe(
      true,
    );
  });

  it('rolls lower and higher places at their odometer ratios', () => {
    const { container, rerender } = render(<Odometer value={19} />);
    advancePaintFrames();
    const rollers = getRollers(container);
    const previousRotations = rollers.map(getRotationDegrees);

    rerender(<Odometer value={29} />);
    const rotations = rollers.map(getRotationDegrees);
    const rotationDeltas = rotations.map((rotation, index) => rotation - previousRotations[index]);

    expect(rotationDeltas).toEqual([-36, -360]);
    expect(Math.abs(rotationDeltas[1] / rotationDeltas[0])).toBe(10);
    expect(rollers.map((roller) => roller.style.transition)).toEqual([
      'transform 1000ms ease-out',
      'transform 1000ms ease-out',
    ]);
  });

  it('animates newly added digits after they have been painted', () => {
    const { container, rerender } = render(<Odometer value={9} />);
    advancePaintFrames();
    rerender(<Odometer value={10} />);
    let rollers = getRollers(container);

    expect(rollers[0].style.transform).toBe('rotateX(0deg)');
    expect(rollers[0].style.transition).toBe('none');

    advancePaintFrames();
    rollers = getRollers(container);
    expect(rollers[0].style.transform).toBe('rotateX(-36deg)');
    expect(rollers[0].style.transition).toBe('transform 1000ms ease-out');
  });

  it('rolls backward when the value decreases', () => {
    const { container, rerender } = render(<Odometer value={20} />);
    advancePaintFrames();
    const rollers = getRollers(container);
    const previousRotations = rollers.map(getRotationDegrees);

    rerender(<Odometer value={19} />);
    const rotations = rollers.map(getRotationDegrees);

    expect(rotations.map((rotation, index) => rotation - previousRotations[index])).toEqual([
      36, 36,
    ]);
  });

  it('caps large changes at ten full turns while preserving the target digit', () => {
    const { container, rerender } = render(<Odometer value={0} />);
    advancePaintFrames();
    rerender(<Odometer value={1_000_000} />);
    const rollers = getRollers(container);

    expect(rollers[rollers.length - 1].style.transform).toBe('rotateX(-3600deg)');
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
    advancePaintFrames();
    const root = container.firstElementChild as HTMLElement;
    const rollers = getRollers(container);

    expect(root.className).toBe('price');
    expect(root.style.color).toBe('red');
    expect(root.style.alignItems).toBe('baseline');
    expect(root.firstChild?.textContent).toBe('-');
    expect(root.children[1].firstChild?.textContent).toBe(',');
    expect(root.children[4].textContent).toBe(',');
    expect(rollers.map((roller) => roller.style.transform)).toEqual([
      'rotateX(-36deg)',
      'rotateX(-432deg)',
      'rotateX(-3708deg)',
      'rotateX(-3744deg)',
      'rotateX(-3780deg)',
      'rotateX(-3852deg)',
    ]);
    expect(rollers.every((roller) => roller.style.transition === 'transform 350ms ease-out')).toBe(
      true,
    );
  });

  it('rounds values and omits the decimal separator when decimals are zero', () => {
    const { container } = render(<Odometer value={1.5} decimals={0} />);
    advancePaintFrames();
    const rollers = getRollers(container);

    expect(rollers).toHaveLength(1);
    expect(rollers[0].style.transform).toBe('rotateX(-72deg)');
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
