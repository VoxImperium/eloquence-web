"use client"
import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { isAdminEmail } from "@/lib/admin"
import Link from "next/link"

interface UserProfile {
  id: string
  email: string | null
  is_beta_tester: boolean
}

interface ApiResponse {
  users: UserProfile[]
  total: number
  page: number
  limit: number
}

export default function BetaTestersPage() {
  const [users, setUsers]         = useState<UserProfile[]>([])
  const [total, setTotal]         = useState(0)
  const [page, setPage]           = useState(1)
  const [search, setSearch]       = useState("")
  const [loading, setLoading]     = useState(true)
  const [actionId, setActionId]   = useState<string | null>(null)
  const [toast, setToast]         = useState<{ msg: string; ok: boolean } | null>(null)

  const router   = useRouter()
  const supabase = createClient()
  const LIMIT    = 20

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user || !isAdminEmail(user.email)) {
        router.push("/dashboard")
      }
    })
    // router and supabase are stable refs — intentionally omitted
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchUsers = useCallback(async (p: number, q: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(p), limit: String(LIMIT) })
      if (q) params.set("search", q)
      const res = await fetch(`/api/admin/beta-testers?${params}`)
      if (!res.ok) throw new Error("Failed to fetch")
      const data: ApiResponse = await res.json()
      setUsers(data.users)
      setTotal(data.total)
    } catch {
      showToast("Erreur lors du chargement des utilisateurs", false)
    } finally {
      setLoading(false)
    }
  }, [])

  // Debounce search: reset to page 1 and fetch when search changes
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1)
      fetchUsers(1, search)
    }, 300)
    return () => clearTimeout(t)
  }, [search, fetchUsers])

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  const goToPage = (p: number) => {
    setPage(p)
    fetchUsers(p, search)
  }

  const toggleBeta = async (user: UserProfile) => {
    setActionId(user.id)
    try {
      const method = user.is_beta_tester ? "DELETE" : "POST"
      const res = await fetch("/api/admin/beta-testers", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      })
      if (!res.ok) throw new Error("Failed")
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_beta_tester: !u.is_beta_tester } : u))
      showToast(
        user.is_beta_tester
          ? `${user.email || "Utilisateur"} retiré des béta testeurs`
          : `${user.email || "Utilisateur"} ajouté aux béta testeurs`,
        true
      )
    } catch {
      showToast("Erreur lors de la mise à jour", false)
    } finally {
      setActionId(null)
    }
  }

  const totalPages = Math.ceil(total / LIMIT)
  const betaCount  = useMemo(() => users.filter(u => u.is_beta_tester).length, [users])

  return (
    <main style={{ minHeight: "100vh", padding: "80px 48px", maxWidth: 960, margin: "0 auto" }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 24, right: 24, zIndex: 1000,
          padding: "14px 24px",
          background: toast.ok ? "rgba(10,10,15,0.97)" : "rgba(40,10,10,0.97)",
          border: `1px solid ${toast.ok ? "rgba(201,168,76,0.4)" : "rgba(200,80,80,0.4)"}`,
          backdropFilter: "blur(12px)",
          fontSize: 12, color: toast.ok ? "#c9a84c" : "#ff8080",
          letterSpacing: "0.05em",
        }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 48 }}>
        <Link href="/dashboard" className="btn-ghost" style={{ padding: "0 0 20px 0", display: "block" }}>
          ← Retour
        </Link>
        <div className="eyebrow" style={{ marginBottom: 12 }}>Administration</div>
        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(32px,4vw,48px)", fontWeight: 300, lineHeight: 1.1, marginBottom: 12 }}>
          Béta <em style={{ color: "#c9a84c" }}>Testeurs</em>
        </h1>
        <p style={{ fontSize: 13, color: "#6a6258", lineHeight: 1.7 }}>
          Gérez les utilisateurs avec accès illimité au programme béta.
        </p>
      </div>

      <div style={{ height: 1, background: "linear-gradient(90deg,transparent,rgba(201,168,76,0.3),transparent)", marginBottom: 36 }} />

      {/* Search */}
      <div style={{ display: "flex", gap: 16, marginBottom: 32, alignItems: "center" }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher par email..."
          className="input-box"
          style={{ flex: 1 }}
        />
        <div style={{
          fontSize: 11, letterSpacing: "0.1em", color: "#6a6258",
          border: "1px solid rgba(201,168,76,0.15)", padding: "8px 16px", flexShrink: 0,
        }}>
          {total} utilisateur{total !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
          <div className="spinner-outline" />
        </div>
      ) : users.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "60px 0",
          border: "1px solid rgba(201,168,76,0.1)",
        }}>
          <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, color: "#6a6258" }}>
            Aucun utilisateur trouvé
          </p>
        </div>
      ) : (
        <div style={{ border: "1px solid rgba(201,168,76,0.15)" }}>
          {/* Table header */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr auto auto",
            padding: "12px 24px",
            borderBottom: "1px solid rgba(201,168,76,0.15)",
            background: "rgba(201,168,76,0.03)",
          }}>
            <span style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#6a6258" }}>Email</span>
            <span style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#6a6258", textAlign: "center", minWidth: 100 }}>Statut</span>
            <span style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#6a6258", textAlign: "right", minWidth: 120 }}>Action</span>
          </div>

          {/* Table rows */}
          {users.map((user, i) => (
            <div key={user.id} style={{
              display: "grid", gridTemplateColumns: "1fr auto auto",
              padding: "16px 24px", alignItems: "center",
              borderBottom: i < users.length - 1 ? "1px solid rgba(201,168,76,0.08)" : "none",
              transition: "background 0.2s",
            }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(201,168,76,0.02)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
            >
              <div>
                <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: "#f5f0e8", marginBottom: 2 }}>
                  {user.email || <span style={{ color: "#3a3830" }}>— sans email —</span>}
                </p>
                <p style={{ fontSize: 10, letterSpacing: "0.05em", color: "#3a3830", fontFamily: "monospace" }}>
                  {user.id}
                </p>
              </div>

              <div style={{ textAlign: "center", minWidth: 100 }}>
                {user.is_beta_tester ? (
                  <span style={{
                    fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase",
                    color: "#c9a84c", border: "1px solid rgba(201,168,76,0.4)",
                    padding: "4px 12px",
                  }}>
                    ✦ Béta
                  </span>
                ) : (
                  <span style={{
                    fontSize: 10, letterSpacing: "0.1em", color: "#3a3830",
                    border: "1px solid rgba(201,168,76,0.08)", padding: "4px 12px",
                  }}>
                    Standard
                  </span>
                )}
              </div>

              <div style={{ textAlign: "right", minWidth: 120 }}>
                <button
                  onClick={() => toggleBeta(user)}
                  disabled={actionId === user.id}
                  style={{
                    fontFamily: "'Raleway',sans-serif", fontSize: 10,
                    letterSpacing: "0.15em", textTransform: "uppercase",
                    padding: "8px 16px",
                    border: `1px solid ${user.is_beta_tester ? "rgba(200,80,80,0.4)" : "rgba(201,168,76,0.4)"}`,
                    background: "transparent", cursor: actionId === user.id ? "wait" : "pointer",
                    color: user.is_beta_tester ? "#ff8080" : "#c9a84c",
                    transition: "all 0.3s",
                    opacity: actionId === user.id ? 0.5 : 1,
                  }}
                >
                  {actionId === user.id
                    ? "..."
                    : user.is_beta_tester
                      ? "Retirer"
                      : "Ajouter"
                  }
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 32 }}>
          <button
            onClick={() => goToPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="btn-ghost"
            style={{ padding: "8px 20px", fontSize: 11, opacity: page === 1 ? 0.3 : 1 }}
          >
            ← Précédent
          </button>
          <span style={{ fontSize: 11, color: "#6a6258", padding: "8px 16px", letterSpacing: "0.1em" }}>
            {page} / {totalPages}
          </span>
          <button
            onClick={() => goToPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="btn-ghost"
            style={{ padding: "8px 20px", fontSize: 11, opacity: page === totalPages ? 0.3 : 1 }}
          >
            Suivant →
          </button>
        </div>
      )}

      {/* Summary footer */}
      {!loading && users.length > 0 && (
        <div style={{
          marginTop: 32, padding: "16px 24px",
          border: "1px solid rgba(201,168,76,0.1)",
          display: "flex", alignItems: "center", gap: 16,
        }}>
          <span style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "#6a6258" }}>
            Sur cette page :
          </span>
          <span style={{ fontSize: 12, color: "#c9a84c" }}>
            {betaCount} béta testeur{betaCount !== 1 ? "s" : ""}
          </span>
          <span style={{ fontSize: 10, color: "#3a3830" }}>
            / {users.length} utilisateurs affichés
          </span>
        </div>
      )}

    </main>
  )
}
