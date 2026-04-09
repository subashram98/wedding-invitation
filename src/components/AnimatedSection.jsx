import React, { useEffect, useRef, useState } from 'react';

export default function AnimatedSection({ className, children, id }) {
  const ref = useRef();
  const [offset, setOffset] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.08 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const windowH = window.innerHeight;
      // How far through the viewport the section is (0 = just entering, 1 = leaving)
      const progress = 1 - rect.top / windowH;
      setOffset(progress);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section
      className={`${className} anim-section ${visible ? 'anim-visible' : ''}`}
      ref={ref}
      id={id}
      style={{ '--scroll-progress': offset }}
    >
      {children}
    </section>
  );
}
