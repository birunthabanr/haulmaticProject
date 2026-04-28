import { useState } from 'react';

export default function DummyTest() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '8px', marginTop: '1rem' }}>
      <h2>Dummy Test Component</h2>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setCount(0)} style={{ marginLeft: '0.5rem' }}>Reset</button>
    </div>
  );
}
