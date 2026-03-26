"use client"

import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"
import Sidebar from "./Sidebar"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed")
    if (saved !== null) setCollapsed(JSON.parse(saved))
  }, [])

  const handleToggle = () => {
    setCollapsed(prev => {
      const next = !prev
      localStorage.setItem("sidebar-collapsed", JSON.stringify(next))
      return next
    })
  }

  const sidebarWidth = collapsed ? 80 : 256

  return (
    <>
      <Sidebar
        collapsed={collapsed}
        onToggle={handleToggle}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* FAB mobile — affiché uniquement via CSS sur mobile */}
      <button
        className="sidebar-mobile-fab"
        onClick={() => setMobileOpen(p => !p)}
        aria-label="Ouvrir le menu"
        style={{
          position: "fixed",
          bottom: 24,
          left: 24,
          zIndex: 95,
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: "#c9a84c",
          border: "none",
          cursor: "pointer",
          alignItems: "center",
          justifyContent: "center",
          color: "#0a0a0f",
          boxShadow: "0 4px 16px rgba(201,168,76,0.3)",
        }}
      >
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Le margin est géré par CSS sur desktop, 0 sur mobile via .app-content */}
      <div
        className="app-content"
        style={{
          marginLeft: sidebarWidth,
          transition: "margin-left 0.3s cubic-bezier(0.4,0,0.2,1)",
          minHeight: "100vh",
          paddingTop: 64,
        }}
      >
        {children}
      </div>
    </>
  )
}