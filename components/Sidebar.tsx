"use client"

import Link from "next/link"
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Mic,
  Sparkles,
  BookOpen,
  BarChart2,
  Scale,
} from "lucide-react"
import SidebarNav, { NavItem } from "./SidebarNav"

const navItems: NavItem[] = [
  { href: "/dashboard",       label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/record",          label: "Analyser",         icon: Mic             },
  { href: "/simulate",        label: "Joute verbale",    icon: Sparkles        },
  { href: "/training",        label: "Entraînement",     icon: BookOpen        },
  { href: "/speech-analysis", label: "Discours",         icon: BarChart2       },
  { href: "/legifrance",      label: "Légifrance",       icon: Scale           },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  mobileOpen: boolean
  onMobileClose: () => void
}

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  return (
    <>
      {mobileOpen && (
        <div
          onClick={onMobileClose}
          className="sidebar-backdrop"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 85,
            background: "rgba(0,0,0,0.6)",
          }}
        />
      )}

      <aside
        className={`sidebar-panel${mobileOpen ? " sidebar-mobile-open" : ""}`}
        style={{
          position: "fixed",
          top: 64,
          left: 0,
          bottom: 0,
          width: collapsed ? 80 : 256,
          background: "rgba(10,10,15,0.97)",
          borderRight: "1px solid rgba(201,168,76,0.1)",
          zIndex: 90,
          display: "flex",
          flexDirection: "column",
          transition: "width 0.3s cubic-bezier(0.4,0,0.2,1), transform 0.3s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <div style={{
          padding: collapsed ? "18px 0" : "18px 20px 14px",
          borderBottom: "1px solid rgba(201,168,76,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          gap: 10,
          overflow: "hidden",
        }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
              <rect x="8" y="1" width="4" height="9" rx="2" fill="#c9a84c"/>
              <path d="M4 10 Q4 15 10 15 Q16 15 16 10" stroke="#c9a84c" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
              <line x1="10" y1="15" x2="10" y2="19" stroke="#c9a84c" strokeWidth="1.2" strokeLinecap="round"/>
              <line x1="6" y1="19" x2="14" y2="19" stroke="#c9a84c" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            {!collapsed && (
              <span style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 16,
                fontWeight: 300,
                letterSpacing: "0.1em",
                color: "#f5f0e8",
                whiteSpace: "nowrap",
              }}>
                Éloquence<span style={{ color: "#c9a84c", fontStyle: "italic" }}>.ai</span>
              </span>
            )}
          </Link>
        </div>

        <SidebarNav items={navItems} collapsed={collapsed} />

        <button
          onClick={onToggle}
          className="sidebar-toggle-btn"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            padding: 16,
            background: "transparent",
            border: "none",
            borderTop: "1px solid rgba(201,168,76,0.08)",
            color: "#6a6258",
            cursor: "pointer",
            transition: "color 0.2s",
          }}
          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = "#c9a84c"}
          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = "#6a6258"}
          aria-label={collapsed ? "Ouvrir la barre latérale" : "Fermer la barre latérale"}
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </aside>
    </>
  )
}