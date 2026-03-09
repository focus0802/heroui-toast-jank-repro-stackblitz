import React from 'react';
import { Button, Toast, ToastQueue } from '@heroui/react';

type Mode = 'default' | 'bypass';

function createQueue(mode: Mode) {
  if (mode === 'bypass') {
    return new ToastQueue({
      maxVisibleToasts: 1,
      wrapUpdate: (fn) => fn()
    });
  }

  return new ToastQueue({ maxVisibleToasts: 1 });
}

export default function App() {
  const [mode, setMode] = React.useState<Mode>('default');
  const [running, setRunning] = React.useState(false);
  const [count, setCount] = React.useState(0);

  const queue = React.useMemo(() => createQueue(mode), [mode]);

  const addOne = React.useCallback(() => {
    setCount((v) => {
      const next = v + 1;
      queue.add({
        title: `Toast #${next}`,
        description: mode === 'bypass' ? 'wrapUpdate(fn)=>fn()' : 'default',
        variant: 'default'
      });
      return next;
    });
  }, [mode, queue]);

  const addBurst = React.useCallback(() => {
    for (let i = 0; i < 30; i += 1) {
      queue.add({
        title: `Burst ${i + 1}`,
        description: mode === 'bypass' ? 'wrapUpdate(fn)=>fn()' : 'default',
        variant: i % 2 === 0 ? 'default' : 'accent'
      });
    }

    setCount((v) => v + 30);
  }, [mode, queue]);

  React.useEffect(() => {
    if (!running) return undefined;

    const id = window.setInterval(() => {
      queue.add({
        title: `Tick ${Math.round(performance.now())}ms`,
        description: mode === 'bypass' ? 'wrapUpdate(fn)=>fn()' : 'default',
        variant: 'default'
      });
      setCount((v) => v + 1);
    }, 120);

    return () => window.clearInterval(id);
  }, [running, queue, mode]);

  return (
    <main className="app">
      <Toast.Provider placement="top end" width={320} queue={queue} maxVisibleToasts={1} />

      <h1>HeroUI v3 Toast Jank Repro</h1>
      <p className="desc">
        Compare default queue update vs custom wrapUpdate bypass.
      </p>

      <div className="row">
        <label className="radio">
          <input
            type="radio"
            checked={mode === 'default'}
            onChange={() => {
              setMode('default');
              setRunning(false);
            }}
          />
          default
        </label>
        <label className="radio">
          <input
            type="radio"
            checked={mode === 'bypass'}
            onChange={() => {
              setMode('bypass');
              setRunning(false);
            }}
          />
          bypass wrapUpdate
        </label>
      </div>

      <div className="row">
        <Button size="sm" variant="secondary" onPress={addOne}>
          Add One
        </Button>
        <Button size="sm" variant="secondary" onPress={addBurst}>
          Burst x30
        </Button>
        <Button size="sm" variant="secondary" onPress={() => setRunning((v) => !v)}>
          {running ? 'Stop Stress' : 'Start Stress'}
        </Button>
      </div>

      <div className="stats">
        <span>mode: {mode}</span>
        <span>enqueued: {count}</span>
      </div>
    </main>
  );
}
