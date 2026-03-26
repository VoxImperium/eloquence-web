"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { LucideIcon } from "lucide-react"

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

interface SidebarNavProps {
  items: NavItem[]
  collapsed: boolean
}

export default function SidebarNav({ items, collapsed }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <nav style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/")

        return (
          <div key={href} className="sidebar-nav-item" style={{ position: "relative" }}>
            <Link
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: collapsed ? "13px 0" : "12px 20px",
                justifyContent: collapsed ? "center" : "flex-start",
                textDecoration: "none",
                color: active ? "#c9a84c" : "#6a6258",
                background: active ? "rgba(201,168,76,0.06)" : "transparent",
                borderLeft: active ? "2px solid #c9a84c" : "2px solid transparent",
                transition: "color 0.2s, background 0.2s",
                whiteSpace: "nowrap",
                overflow: "hidden",
              }}
              onMouseEnter={e => {
                if (!active) (e.currentTarget as HTMLElement).style.color = "#f5f0e8"
              }}
              onMouseLeave={e => {
                if (!active) (e.currentTarget as HTMLElement).style.color = "#6a6258"
              }}
            >
              <Icon size={18} style={{ flexShrink: 0 }} />
              {!collapsed && (
                <span style={{
                  fontFamily: "'Raleway', sans-serif",
                  fontSize: 11,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                }}>
                  {label}
                </span>
              )}
            </Link>

            {/* Tooltip shown when sidebar is collapsed */}
            {collapsed && (
              <span className="sidebar-tooltip" style={{
                position: "absolute",
                left: "100%",
                top: "50%",
                transform: "translateY(-50%)",
                marginLeft: 8,
                background: "rgba(18,17,26,0.97)",
                border: "1px solid rgba(201,168,76,0.2)",
                color: "#f5f0e8",
                padding: "6px 14px",
                fontFamily: "'Raleway', sans-serif",
                fontSize: 10,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
                pointerEvents: "none",
                opacity: 0,
                transition: "opacity 0.15s ease",
                zIndex: 200,
              }}>
                {label}
              </span>
            )}
          </div>
        )
      })}
    </nav>
  )
}
