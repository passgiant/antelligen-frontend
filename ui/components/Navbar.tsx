"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navbarStyles } from "@/ui/components/navbar/navbarStyles";

const menuItems = [
  { label: "Home", href: "/" },
  { label: "Board", href: "/board" },
  { label: "Youtube", href: "/youtube" },
  { label: "주식 추천", href: "/stock-recommendation" },
];

interface NavbarProps {
  isAuthenticated?: boolean;
  onLogout?: () => void;
}

export default function Navbar({ isAuthenticated = false, onLogout }: NavbarProps) {
  const pathname = usePathname();

  const menuItemStyle = (href: string) => {
    const isActive = pathname === href;
    return [
      navbarStyles.menuItem.base,
      isActive ? navbarStyles.menuItem.active : navbarStyles.menuItem.default,
    ].join(" ");
  };

  return (
    <nav className={navbarStyles.nav}>
      <div className={navbarStyles.inner}>
        <Link href="/" className={navbarStyles.logo}>
          Stock Supporters
        </Link>
        <div className={navbarStyles.menuList}>
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href} className={menuItemStyle(item.href)}>
              {item.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <button onClick={onLogout} className={navbarStyles.authButton.logout}>
              Logout
            </button>
          ) : (
            <Link href="/login" className={navbarStyles.authButton.login}>
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
