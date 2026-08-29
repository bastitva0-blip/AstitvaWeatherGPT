import { forwardRef } from "react";
import { Link } from "react-router-dom";

/** Adapter so shilp-sutra shell components (TopBar, BottomNavbar, Sidebar…) route through react-router. */
export const RouterLink = forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }>(
  ({ href, ...props }, ref) => <Link ref={ref} to={href} {...props} />
);
RouterLink.displayName = "RouterLink";
