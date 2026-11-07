import type { CSSProperties } from 'react';

export default function Celebration() {
  return <div className="confetti" aria-hidden="true">{Array.from({length:48},(_,i)=><i key={i} style={{
    '--x': `${(i * 37) % 100}vw`, '--drift': `${(i % 2 ? 1 : -1) * (30 + i % 70)}px`,
    '--delay': `${(i % 8) * .06}s`, '--color': ['#d43a52','#d8ae50','#349c86','#edecdf'][i%4],
    '--rotation': `${i * 47}deg`,
  } as CSSProperties}/>)}</div>;
}
