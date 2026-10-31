"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  ["/", "This Week"],
  ["/library", "Library"],
  ["/list", "List"],
  ["/capture", "Add"],
  ["/pantry", "Pantry"],
];

export default function Nav({ links = LINKS }) {
  const pathname = usePathname();
  const topRef = useRef(null);

  // The library's sticky filter bar hangs off this height, — publish the
  // measured value.
  useEffect(() => {
    const el = topRef.current;
    if (!el) return;
    const publish = () =>
      document.documentElement.style.setProperty("--topbar-h", `${Math.round(el.offsetHeight)}px`);
    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <header className="topbar" ref={topRef}>
      <Link href="/" className="wordmark">
        Recipe Collector
      </Link>

      <div className="topbar-right">
        <nav className="nav">
          {links.map(([href, label]) => (
            <Link key={href} href={href} data-active={pathname === href}>
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
