import { useEffect, useRef } from 'react';

export default function Starfield() {
  const starfieldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!starfieldRef.current) return;

    const starfield = starfieldRef.current;
    starfield.innerHTML = '';

    for (let i = 0; i < 100; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      star.style.left = Math.random() * 100 + '%';
      star.style.top = Math.random() * 100 + '%';
      star.style.width = Math.random() * 3 + 1 + 'px';
      star.style.height = star.style.width;
      star.style.animationDelay = Math.random() * 3 + 's';
      starfield.appendChild(star);
    }
  }, []);

  return <div ref={starfieldRef} className="starfield" data-testid="starfield" />;
}
