import { useState } from 'react';

import { Odometer } from '../src';

export function Playground() {
  const [value, setValue] = useState(12345.67);
  const [duration, setDuration] = useState(800);
  const [decimals, setDecimals] = useState(2);
  const [separator, setSeparator] = useState(',');

  return (
    <main className='layout'>
      <header className='header'>
        <div className='brand-mark' aria-hidden='true'>
          0
        </div>
        <div>
          <p className='eyebrow'>REACT COMPONENT PLAYGROUND</p>
          <h1>Odometer</h1>
        </div>
        <span className='version'>Live preview</span>
      </header>

      <section className='preview' aria-label='Odometer preview'>
        <p className='preview-label'>YOUR NUMBER, IN MOTION</p>
        <div className='number'>
          <Odometer value={value} duration={duration} decimals={decimals} separator={separator} />
        </div>
        <div className='stepper' aria-label='Change value'>
          <button type='button' onClick={() => setValue((current) => current - 100)}>
            − 100
          </button>
          <button type='button' onClick={() => setValue((current) => current + 100)}>
            + 100
          </button>
        </div>
      </section>

      <section className='controls' aria-labelledby='controls-heading'>
        <div className='controls-heading'>
          <div>
            <p className='eyebrow'>MAKE IT YOURS</p>
            <h2 id='controls-heading'>Controls</h2>
          </div>
          <button
            className='reset-button'
            type='button'
            onClick={() => {
              setValue(12345.67);
              setDuration(800);
              setDecimals(2);
              setSeparator(',');
            }}
          >
            Reset
          </button>
        </div>

        <div className='control-grid'>
          <label className='control control-wide'>
            <span>Value</span>
            <input
              type='number'
              value={value}
              step='any'
              onChange={(event) => setValue(event.currentTarget.valueAsNumber || 0)}
            />
          </label>

          <label className='control'>
            <span>
              Duration <strong>{duration} ms</strong>
            </span>
            <input
              type='range'
              min='100'
              max='3000'
              step='100'
              value={duration}
              onChange={(event) => setDuration(Number(event.currentTarget.value))}
            />
          </label>

          <label className='control'>
            <span>Decimal places</span>
            <select
              value={decimals}
              onChange={(event) => setDecimals(Number(event.currentTarget.value))}
            >
              <option value={0}>0</option>
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
            </select>
          </label>

          <label className='control'>
            <span>Thousands separator</span>
            <select value={separator} onChange={(event) => setSeparator(event.currentTarget.value)}>
              <option value=','>Comma ( , )</option>
              <option value='.'>Period ( . )</option>
              <option value=' '>Space</option>
              <option value=''>None</option>
            </select>
          </label>
        </div>
      </section>

      <footer>
        Edit the component in <code>src/Odometer.tsx</code> to see changes live.
      </footer>
    </main>
  );
}
