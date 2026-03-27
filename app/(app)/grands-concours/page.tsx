"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase"
import { isAdminEmail } from "@/lib/admin"
import type { CrfpaSubject, ScoreBreakdown, LegalReference } from "@/types/crfpa"

// ── Phase definitions ────────────────────────────────────────────────────────
type Phase = "start" | "prep" | "expose" | "qa" | "bilan"

// ── Timer hook ───────────────────────────────────────────────────────────────
function useCountdown(initialSeconds: number, active: boolean) {
  const [remaining, setRemaining] = useState(initialSeconds)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!active) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [active])

  const reset = useCallback((secs: number) => setRemaining(secs), [])
  const elapsed = initialSeconds - remaining

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0")
  const ss = String(remaining % 60).padStart(2, "0")

  return { remaining, elapsed, display: `${mm}:${ss}`, reset }
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function difficultyLabel(d: number) {
  return ["", "Accessible", "Modéré", "Intermédiaire", "Difficile", "Expert"][d] ?? `${d}/5`
}

function scoreColor(score: number) {
  if (score >= 14) return "#c9a84c"
  if (score >= 10) return "#8a9a6a"
  return "#c97a4c"
}

// ── Styles ───────────────────────────────────────────────────────────────────
const label10: React.CSSProperties = {
  fontFamily: "'Raleway',sans-serif",
  fontSize: 10,
  letterSpacing: "0.25em",
  textTransform: "uppercase",
  color: "#6a6258",
  display: "block",
  marginBottom: 8,
}

const goldLabel: React.CSSProperties = { ...label10, color: "#c9a84c" }

const cardStyle: React.CSSProperties = {
  border: "1px solid rgba(201,168,76,0.2)",
  padding: "28px 36px",
  marginBottom: 24,
}

export default function GrandsConcoursPage() {
  // ── Admin gate ─────────────────────────────────────────────────────────────
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsAdmin(isAdminEmail(user?.email))
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Global state ───────────────────────────────────────────────────────────
  const [phase, setPhase] = useState<Phase>("start")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Phase 1 – Subject
  const [subject, setSubject] = useState<Pick<CrfpaSubject, "id" | "title" | "description" | "difficulty" | "year" | "source_name" | "category"> | null>(null)
  const [attemptId, setAttemptId] = useState<number | null>(null)

  // Phase 2 – Prep
  const [prepNotes, setPrepNotes] = useState("")
  const prepTimer = useCountdown(3600, phase === "prep")

  // Phase 3 – Exposé
  const [exposeText, setExposeText] = useState("")
  const exposeTimer = useCountdown(900, phase === "expose")

  // Phase 3 – Exposé audio mode
  const [exposeMode, setExposeMode] = useState<"oral" | "written">("oral")
  const [exposeRecStatus, setExposeRecStatus] = useState<"idle" | "recording" | "uploading" | "transcribing">("idle")
  const [exposeAudioUrl, setExposeAudioUrl] = useState<string | null>(null)
  const [exposeRecSeconds, setExposeRecSeconds] = useState(0)
  const [exposeNotesOpen, setExposeNotesOpen] = useState(true)
  const exposeMrRef = useRef<MediaRecorder | null>(null)
  const exposeChunksRef = useRef<Blob[]>([])
  const exposeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Phase 4 – Q&A
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null)
  const [currentAnswer, setCurrentAnswer] = useState("")
  const [qaHistory, setQaHistory] = useState<{ question: string; answer: string; comment?: string | null }[]>([])
  const [endOfInterview, setEndOfInterview] = useState(false)

  // Phase 5 – Bilan
  const [finalScore, setFinalScore] = useState<number | null>(null)
  const [scoreBreakdown, setScoreBreakdown] = useState<ScoreBreakdown | null>(null)
  const [feedbackText, setFeedbackText] = useState<string | null>(null)
  const [pointsForts, setPointsForts] = useState<string[]>([])
  const [pointsFaibles, setPointsFaibles] = useState<string[]>([])
  const [references, setReferences] = useState<LegalReference[]>([])

  // ── Prep phase auto-advance ────────────────────────────────────────────────
  const [prepExpired, setPrepExpired] = useState(false)
  useEffect(() => {
    if (phase === "prep" && prepTimer.remaining === 0) setPrepExpired(true)
  }, [phase, prepTimer.remaining])

  // ── API helpers ────────────────────────────────────────────────────────────
  const apiPost = useCallback(async (url: string, body?: unknown) => {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error((data as { error?: string }).error ?? `Erreur ${res.status}`)
    }
    return res.json()
  }, [])

  // ── Expose audio recording ─────────────────────────────────────────────────
  useEffect(() => {
    if (exposeRecStatus === "recording") {
      exposeTimerRef.current = setInterval(() => setExposeRecSeconds(s => s + 1), 1000)
    } else {
      if (exposeTimerRef.current) clearInterval(exposeTimerRef.current)
      if (exposeRecStatus === "idle") setExposeRecSeconds(0)
    }
    return () => { if (exposeTimerRef.current) clearInterval(exposeTimerRef.current) }
  }, [exposeRecStatus])

  const startExposeRec = async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      exposeChunksRef.current = []
      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : MediaRecorder.isTypeSupported("audio/mp4")
          ? "audio/mp4"
          : undefined
      const mrOptions: MediaRecorderOptions = { audioBitsPerSecond: 64000 }
      if (mimeType) mrOptions.mimeType = mimeType
      const mr = new MediaRecorder(stream, mrOptions)
      mr.ondataavailable = (e) => { if (e.data.size > 0) exposeChunksRef.current.push(e.data) }
      mr.onstop = handleExposeRecStop
      mr.start(1000)
      exposeMrRef.current = mr
      setExposeRecStatus("recording")
    } catch (err) {
      console.error("[CRFPA/expose] Microphone access error:", err)
      setError("Impossible d'accéder au microphone. Vérifiez vos autorisations.")
    }
  }

  const stopExposeRec = () => {
    exposeMrRef.current?.stop()
    exposeMrRef.current?.stream.getTracks().forEach(t => t.stop())
  }

  const handleExposeRecStop = async () => {
    setExposeRecStatus("uploading")
    try {
      const mimeType = exposeMrRef.current?.mimeType ?? "audio/webm"
      const blob = new Blob(exposeChunksRef.current, { type: mimeType })
      if (!attemptId) throw new Error("Tentative non initialisée")
      const formData = new FormData()
      formData.append("file", blob, `expose.${mimeType.includes("mp4") ? "mp4" : "webm"}`)
      formData.append("attemptId", String(attemptId))
      const res = await fetch("/api/crfpa/upload-audio", { method: "POST", body: formData })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Erreur lors de l'upload audio.")
      setExposeAudioUrl(json.publicUrl)
      setExposeRecStatus("idle")
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur lors de l'upload audio.")
      setExposeRecStatus("idle")
    }
  }

  // ── Phase 1: Generate subject ──────────────────────────────────────────────
  const generateSubject = async () => {
    setLoading(true)
    setError(null)
    try {
      const subjectData = await fetch("/api/crfpa/subject/random").then(r => {
        if (!r.ok) throw new Error("Impossible de récupérer un sujet.")
        return r.json()
      })
      setSubject(subjectData)

      const startData = await apiPost("/api/crfpa/attempt/start", { subject_id: subjectData.id })
      setAttemptId(startData.attempt_id)

      setPrepNotes("")
      setExposeText("")
      setExposeAudioUrl(null)
      setExposeRecStatus("idle")
      setExposeRecSeconds(0)
      setExposeMode("oral")
      setExposeNotesOpen(true)
      setQaHistory([])
      setCurrentQuestion(null)
      setCurrentAnswer("")
      setEndOfInterview(false)
      setFinalScore(null)
      setScoreBreakdown(null)
      setFeedbackText(null)
      setPointsForts([])
      setPointsFaibles([])
      setReferences([])
      setPrepExpired(false)
      prepTimer.reset(3600)
      exposeTimer.reset(900)

      setPhase("prep")
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Une erreur est survenue.")
    } finally {
      setLoading(false)
    }
  }

  // ── Phase 2 → 3: Start exposé ─────────────────────────────────────────────
  const startExpose = async () => {
    if (!attemptId) return
    setLoading(true)
    setError(null)
    try {
      await apiPost(`/api/crfpa/attempt/${attemptId}/prep`, {
        prep_notes: prepNotes,
        duration_seconds: prepTimer.elapsed,
      })
      exposeTimer.reset(900)
      setPhase("expose")
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Une erreur est survenue.")
    } finally {
      setLoading(false)
    }
  }

  // ── Phase 3 → 4: Submit exposé ────────────────────────────────────────────
  const submitExpose = async () => {
    if (!attemptId) return
    if (exposeMode === "written" && !exposeText.trim()) return
    if (exposeMode === "oral" && !exposeAudioUrl) return
    setLoading(true)
    setError(null)
    try {
      const exposePayload = exposeMode === "oral"
        ? { expose_audio_url: exposeAudioUrl, duration_seconds: exposeTimer.elapsed }
        : { expose_text: exposeText, duration_seconds: exposeTimer.elapsed }
      await apiPost(`/api/crfpa/attempt/${attemptId}/expose`, exposePayload)
      // Get first jury question
      const qaData = await apiPost(`/api/crfpa/attempt/${attemptId}/qa`, { phase: "question" })
      if (qaData.end_of_interview) {
        setEndOfInterview(true)
      } else {
        setCurrentQuestion(qaData.question ?? null)
      }
      setPhase("qa")
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Une erreur est survenue.")
    } finally {
      setLoading(false)
    }
  }

  // ── Phase 4: Submit answer ────────────────────────────────────────────────
  const submitAnswer = async () => {
    if (!attemptId || !currentAnswer.trim() || !currentQuestion) return
    setLoading(true)
    setError(null)
    try {
      const data = await apiPost(`/api/crfpa/attempt/${attemptId}/qa`, {
        phase: "answer",
        question: currentQuestion,
        answer_text: currentAnswer,
      })

      const newEntry = {
        question: currentQuestion,
        answer: currentAnswer,
        comment: data.next_question?.comment_on_previous ?? null,
      }
      setQaHistory(prev => [...prev, newEntry])
      setCurrentAnswer("")

      if (data.end_of_interview) {
        setEndOfInterview(true)
        setCurrentQuestion(null)
      } else if (data.next_question) {
        setCurrentQuestion(data.next_question.question ?? null)
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Une erreur est survenue.")
    } finally {
      setLoading(false)
    }
  }

  // ── Phase 4 → 5: Finish ───────────────────────────────────────────────────
  const finishInterview = async () => {
    if (!attemptId) return
    setLoading(true)
    setError(null)
    try {
      const data = await apiPost(`/api/crfpa/attempt/${attemptId}/finish`)
      setFinalScore(data.final_score ?? null)
      setScoreBreakdown(data.score_breakdown ?? null)
      setFeedbackText(data.feedback ?? null)
      setPointsForts(data.points_forts ?? [])
      setPointsFaibles(data.points_faibles ?? [])
      setReferences(data.references ?? [])
      setPhase("bilan")
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Une erreur est survenue.")
    } finally {
      setLoading(false)
    }
  }

  // ── Restart ───────────────────────────────────────────────────────────────
  const restart = () => {
    setPhase("start")
    setSubject(null)
    setAttemptId(null)
    setError(null)
  }

  // ── Admin gate render ─────────────────────────────────────────────────────
  if (isAdmin === null) return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 28, height: 28, border: "1px solid rgba(201,168,76,0.3)", borderTop: "1px solid #c9a84c", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </main>
  )

  if (!isAdmin) {
    return (
      <main style={{ padding: "40px 48px", maxWidth: 960, margin: "0 auto", textAlign: "center" }}>
        <div style={{ marginTop: 120 }}>
          <p style={{ fontFamily: "'Raleway',sans-serif", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: "#c9a84c", marginBottom: 20 }}>
            Bientôt disponible
          </p>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(32px,4vw,52px)", fontWeight: 300, marginBottom: 16, color: "#f5f0e8" }}>
            Grands Concours
          </h1>
          <p style={{ fontSize: 14, color: "#6a6258", lineHeight: 1.9, maxWidth: 440, margin: "0 auto 40px" }}>
            Cette fonctionnalité est en cours de préparation. Revenez bientôt pour découvrir les simulations CRFPA &amp; ENM.
          </p>
          <a href="/dashboard" className="btn-gold"><span className="btn-text">Retour au tableau de bord</span></a>
        </div>
      </main>
    )
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <main style={{ padding: "40px 48px", maxWidth: 960, margin: "0 auto" }}>
      {/* Back link */}
      <Link
        href="/dashboard"
        style={{
          fontFamily: "'Raleway',sans-serif",
          fontSize: 10,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "#6a6258",
          textDecoration: "none",
        }}
      >
        ← Retour
      </Link>

      {/* Header */}
      <div style={{ marginTop: 24, marginBottom: 40 }}>
        <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: "#c9a84c" }}>
          VI — Grands Concours
        </span>
        <h1 style={{
          fontFamily: "'Cormorant Garamond',serif",
          fontSize: "clamp(28px,4vw,48px)",
          fontWeight: 300,
          lineHeight: 1.1,
          marginTop: 8,
          marginBottom: 12,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}>
          Grand Oral <em style={{ color: "#c9a84c" }}>CRFPA</em>
          <span style={{
            fontFamily: "'Raleway',sans-serif",
            fontSize: 9,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#c9a84c",
            background: "rgba(201,168,76,0.15)",
            border: "1px solid rgba(201,168,76,0.3)",
            padding: "4px 10px",
            fontStyle: "normal",
          }}>
            BÊTA
          </span>
        </h1>
        <p style={{ fontSize: 13, color: "#6a6258", lineHeight: 1.9, maxWidth: 560 }}>
          Simulation complète du Grand Oral du barreau — Exposé 15&nbsp;min · Entretien jury 30&nbsp;min · Note /20.
        </p>
      </div>

      {/* Phase indicator */}
      <div style={{
        border: "1px solid rgba(201,168,76,0.2)",
        background: "rgba(201,168,76,0.04)",
        padding: "12px 20px",
        marginBottom: 24,
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
      }}>
        <span style={{ fontSize: 14, flexShrink: 0 }}>ℹ️</span>
        <p style={{
          fontFamily: "'Raleway',sans-serif",
          fontSize: 11,
          color: "#8a8070",
          lineHeight: 1.7,
          margin: 0,
        }}>
          Cette fonctionnalité est en phase de test. Certaines interactions avec le jury peuvent être imprécises. Vos retours nous aident à améliorer l&apos;expérience.
        </p>
      </div>
      <PhaseIndicator phase={phase} />

      {/* Error banner */}
      {error && (
        <div style={{
          border: "1px solid rgba(201,80,76,0.4)",
          background: "rgba(201,80,76,0.06)",
          padding: "12px 20px",
          marginBottom: 24,
          fontSize: 13,
          color: "#c97a4c",
          letterSpacing: "0.02em",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <span>⚠ {error}</span>
          <button onClick={() => setError(null)} style={{ background: "none", border: "none", color: "#6a6258", cursor: "pointer", fontSize: 16 }}>✕</button>
        </div>
      )}

      {/* ── Phase: START ──────────────────────────────────────────────────── */}
      {phase === "start" && (
        <div style={cardStyle}>
          <div style={{
            padding: "12px 16px",
            border: "1px solid rgba(201,168,76,0.15)",
            background: "rgba(201,168,76,0.03)",
            marginBottom: 28,
            fontSize: 12,
            color: "#8a8070",
            lineHeight: 1.9,
          }}>
            <strong style={{ color: "#c9a84c" }}>Grand Oral CRFPA</strong>
            {" "}— Thème : Libertés et droits fondamentaux
            <br />
            Préparation 60&nbsp;min · Exposé 15&nbsp;min · Entretien jury 30&nbsp;min
          </div>

          <button
            onClick={generateSubject}
            disabled={loading}
            className="btn-gold"
            style={{ opacity: loading ? 0.6 : 1 }}
          >
            <span className="btn-text">
              {loading ? "Génération…" : "Générer un sujet"}
            </span>
          </button>
        </div>
      )}

      {/* ── Phase: PREP ───────────────────────────────────────────────────── */}
      {phase === "prep" && subject && (
        <>
          {/* Subject card */}
          <SubjectCard subject={subject} />

          {/* Timer */}
          <TimerBlock
            label="Préparation"
            display={prepTimer.display}
            remaining={prepTimer.remaining}
            total={3600}
            expired={prepExpired}
            expiredMessage="Temps de préparation écoulé — vous pouvez commencer votre exposé."
          />

          {/* Notes */}
          <div style={{ ...cardStyle, marginBottom: 24 }}>
            <label style={goldLabel}>Notes de préparation (non évaluées)</label>
            <textarea
              value={prepNotes}
              onChange={e => setPrepNotes(e.target.value)}
              placeholder="Notez vos idées, plan, arguments, références juridiques…"
              style={{
                width: "100%",
                height: 220,
                padding: "14px 18px",
                background: "rgba(201,168,76,0.02)",
                border: "1px solid rgba(201,168,76,0.12)",
                color: "#f5f0e8",
                fontFamily: "'Libre Baskerville',serif",
                fontSize: 13,
                lineHeight: 1.8,
                resize: "vertical",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <button
              onClick={startExpose}
              disabled={loading}
              className="btn-gold"
              style={{ opacity: loading ? 0.6 : 1 }}
            >
              <span className="btn-text">{loading ? "Chargement…" : "Commencer l'exposé →"}</span>
            </button>
            <button onClick={restart} className="btn-outline">
              <span>Abandonner</span>
            </button>
          </div>
        </>
      )}

      {/* ── Phase: EXPOSÉ ─────────────────────────────────────────────────── */}
      {phase === "expose" && subject && (
        <>
          <SubjectCard subject={subject} compact />

          <TimerBlock
            label="Exposé"
            display={exposeTimer.display}
            remaining={exposeTimer.remaining}
            total={900}
            expired={exposeTimer.remaining === 0}
            expiredMessage="Temps d'exposé écoulé — soumettez votre présentation."
          />

          {/* Prep notes collapsible panel */}
          {prepNotes.trim() && (
            <div style={{
              border: "1px solid rgba(201,168,76,0.2)",
              marginBottom: 20,
              background: "rgba(201,168,76,0.02)",
            }}>
              <button
                onClick={() => setExposeNotesOpen(o => !o)}
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "14px 20px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#c9a84c",
                  fontFamily: "'Raleway',sans-serif",
                  fontSize: 10,
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                }}
              >
                <span>Vos notes de préparation</span>
                <span style={{ fontSize: 14, lineHeight: 1 }}>{exposeNotesOpen ? "▲" : "▼"}</span>
              </button>
              {exposeNotesOpen && (
                <div style={{ padding: "0 20px 16px" }}>
                  <pre style={{
                    fontFamily: "'Libre Baskerville',serif",
                    fontSize: 13,
                    lineHeight: 1.8,
                    color: "#c8bfb0",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    margin: 0,
                    borderTop: "1px solid rgba(201,168,76,0.1)",
                    paddingTop: 14,
                  }}>
                    {prepNotes}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Mode toggle */}
          <div style={{ display: "flex", gap: 0, marginBottom: 20, border: "1px solid rgba(201,168,76,0.2)", width: "fit-content" }}>
            {(["oral", "written"] as const).map(m => (
              <button
                key={m}
                onClick={() => setExposeMode(m)}
                style={{
                  padding: "8px 20px",
                  background: exposeMode === m ? "rgba(201,168,76,0.12)" : "none",
                  border: "none",
                  color: exposeMode === m ? "#c9a84c" : "#6a6258",
                  fontFamily: "'Raleway',sans-serif",
                  fontSize: 10,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "background 0.15s",
                }}
              >
                {m === "oral" ? "🎙 Oral" : "✏ Écrit"}
              </button>
            ))}
          </div>

          {/* Oral mode */}
          {exposeMode === "oral" && (
            <div style={{ ...cardStyle }}>
              <label style={goldLabel}>Enregistrement oral</label>

              {exposeRecStatus === "idle" && !exposeAudioUrl && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "24px 0" }}>
                  <button
                    onClick={startExposeRec}
                    style={{
                      width: 96,
                      height: 96,
                      borderRadius: "50%",
                      border: "2px solid #c9a84c",
                      background: "rgba(201,168,76,0.08)",
                      color: "#c9a84c",
                      fontSize: 32,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    aria-label="Démarrer l'enregistrement"
                  >
                    🎙
                  </button>
                  <span style={{ ...label10, marginBottom: 0 }}>Cliquez pour commencer l&apos;enregistrement</span>
                </div>
              )}

              {exposeRecStatus === "recording" && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "24px 0" }}>
                  <div style={{ position: "relative" }}>
                    <button
                      onClick={stopExposeRec}
                      style={{
                        width: 96,
                        height: 96,
                        borderRadius: "50%",
                        border: "2px solid #c97a4c",
                        background: "rgba(201,122,76,0.15)",
                        color: "#c97a4c",
                        fontSize: 28,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        outline: "4px solid rgba(201,122,76,0.25)",
                        outlineOffset: 2,
                      }}
                      aria-label="Arrêter l'enregistrement"
                    >
                      ⏹
                    </button>
                  </div>
                  <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: 20, letterSpacing: "0.1em", color: "#c97a4c" }}>
                    {String(Math.floor(exposeRecSeconds / 60)).padStart(2, "0")}:{String(exposeRecSeconds % 60).padStart(2, "0")}
                  </span>
                  <span style={{ ...label10, marginBottom: 0, color: "#c97a4c" }}>Enregistrement en cours — cliquez pour arrêter</span>
                </div>
              )}

              {exposeRecStatus === "uploading" && (
                <div style={{ textAlign: "center", padding: "24px 0", color: "#8a8070", fontFamily: "'Raleway',sans-serif", fontSize: 12, letterSpacing: "0.1em" }}>
                  Envoi de l&apos;audio…
                </div>
              )}

              {exposeRecStatus === "idle" && exposeAudioUrl && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 20 }}>✅</span>
                    <span style={{ fontSize: 13, color: "#c8bfb0", fontFamily: "'Raleway',sans-serif" }}>
                      Enregistrement prêt ({String(Math.floor(exposeRecSeconds / 60)).padStart(2, "0")}:{String(exposeRecSeconds % 60).padStart(2, "0")})
                    </span>
                    <button
                      onClick={() => { setExposeAudioUrl(null); setExposeRecSeconds(0) }}
                      style={{ background: "none", border: "none", color: "#6a6258", cursor: "pointer", fontSize: 12 }}
                    >
                      Recommencer
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Written mode */}
          {exposeMode === "written" && (
            <div style={{ ...cardStyle }}>
              <label style={goldLabel}>Votre exposé</label>
              <textarea
                value={exposeText}
                onChange={e => setExposeText(e.target.value)}
                placeholder="Rédigez votre exposé de 15 minutes ici…"
                style={{
                  width: "100%",
                  height: 280,
                  padding: "14px 18px",
                  background: "rgba(201,168,76,0.02)",
                  border: "1px solid rgba(201,168,76,0.12)",
                  color: "#f5f0e8",
                  fontFamily: "'Libre Baskerville',serif",
                  fontSize: 13,
                  lineHeight: 1.8,
                  resize: "vertical",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
          )}

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {(() => {
              const isSubmitDisabled =
                loading ||
                exposeRecStatus !== "idle" ||
                (exposeMode === "oral" && !exposeAudioUrl) ||
                (exposeMode === "written" && !exposeText.trim())
              return (
                <button
                  onClick={submitExpose}
                  disabled={isSubmitDisabled}
                  className="btn-gold"
                  style={{ opacity: isSubmitDisabled ? 0.5 : 1, cursor: isSubmitDisabled ? "not-allowed" : "pointer" }}
                >
                  <span className="btn-text">
                    {loading ? "Transcription en cours…" : "Soumettre l'exposé →"}
                  </span>
                </button>
              )
            })()}
            <button onClick={restart} className="btn-outline">
              <span>Abandonner</span>
            </button>
          </div>
        </>
      )}

      {/* ── Phase: Q&A ────────────────────────────────────────────────────── */}
      {phase === "qa" && (
        <>
          <SubjectCard subject={subject!} compact />

          {/* Q&A history */}
          {qaHistory.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <p style={goldLabel}>Échanges avec le jury</p>
              {qaHistory.map((entry, i) => (
                <div key={i} style={{
                  border: "1px solid rgba(201,168,76,0.12)",
                  padding: "18px 24px",
                  marginBottom: 12,
                  background: "rgba(201,168,76,0.02)",
                }}>
                  <p style={{ ...label10, color: "#c9a84c", marginBottom: 6 }}>Question {i + 1} — Jury</p>
                  <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 17, fontWeight: 300, lineHeight: 1.6, color: "#f5f0e8", marginBottom: 12 }}>
                    {entry.question}
                  </p>
                  <p style={{ ...label10, marginBottom: 6 }}>Votre réponse</p>
                  <p style={{ fontSize: 13, color: "#c8bfb0", lineHeight: 1.7 }}>{entry.answer}</p>
                  {entry.comment && (
                    <p style={{ fontSize: 12, color: "#8a8070", fontStyle: "italic", marginTop: 8, borderLeft: "2px solid rgba(201,168,76,0.2)", paddingLeft: 12 }}>
                      {entry.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Current question */}
          {!endOfInterview && currentQuestion && (
            <div style={{ ...cardStyle }}>
              <p style={{ ...label10, color: "#c9a84c", marginBottom: 12 }}>
                Question {qaHistory.length + 1} — Le jury vous demande :
              </p>
              <p style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: 20,
                fontWeight: 300,
                lineHeight: 1.6,
                color: "#f5f0e8",
                marginBottom: 20,
              }}>
                {currentQuestion}
              </p>
              <label style={goldLabel}>Votre réponse</label>
              <textarea
                value={currentAnswer}
                onChange={e => setCurrentAnswer(e.target.value)}
                placeholder="Répondez à la question du jury…"
                style={{
                  width: "100%",
                  height: 160,
                  padding: "14px 18px",
                  background: "rgba(201,168,76,0.02)",
                  border: "1px solid rgba(201,168,76,0.12)",
                  color: "#f5f0e8",
                  fontFamily: "'Libre Baskerville',serif",
                  fontSize: 13,
                  lineHeight: 1.8,
                  resize: "vertical",
                  outline: "none",
                  boxSizing: "border-box",
                  marginBottom: 16,
                }}
              />
              <button
                onClick={submitAnswer}
                disabled={!currentAnswer.trim() || loading}
                className="btn-gold"
                style={{ opacity: (!currentAnswer.trim() || loading) ? 0.5 : 1, cursor: (!currentAnswer.trim() || loading) ? "not-allowed" : "pointer" }}
              >
                <span className="btn-text">{loading ? "Envoi…" : "Soumettre la réponse →"}</span>
              </button>
            </div>
          )}

          {/* Loading question */}
          {loading && !currentQuestion && !endOfInterview && (
            <div style={{ ...cardStyle, textAlign: "center" }}>
              <p style={{ color: "#6a6258", fontFamily: "'Raleway',sans-serif", fontSize: 12, letterSpacing: "0.1em" }}>
                Le jury prépare sa prochaine question…
              </p>
            </div>
          )}

          {/* End of interview */}
          {endOfInterview && (
            <div style={{ ...cardStyle, background: "rgba(201,168,76,0.04)" }}>
              <p style={{ ...label10, color: "#c9a84c", marginBottom: 12 }}>L&apos;entretien est terminé</p>
              <p style={{ fontSize: 13, color: "#8a8070", lineHeight: 1.8, marginBottom: 20 }}>
                Le jury a terminé ses questions. Vous pouvez maintenant obtenir votre bilan final.
              </p>
              <button
                onClick={finishInterview}
                disabled={loading}
                className="btn-gold"
                style={{ opacity: loading ? 0.6 : 1 }}
              >
                <span className="btn-text">{loading ? "Calcul du score…" : "Obtenir mon bilan →"}</span>
              </button>
            </div>
          )}

          {/* Finish early button */}
          {!endOfInterview && qaHistory.length > 0 && !loading && (
            <div style={{ marginTop: 16 }}>
              <button
                onClick={() => setEndOfInterview(true)}
                className="btn-outline"
              >
                <span>Terminer l&apos;entretien</span>
              </button>
            </div>
          )}
        </>
      )}

      {/* ── Phase: BILAN ──────────────────────────────────────────────────── */}
      {phase === "bilan" && finalScore !== null && (
        <>
          {/* Score card */}
          <div style={{
            ...cardStyle,
            textAlign: "center",
            background: "rgba(201,168,76,0.03)",
          }}>
            <p style={goldLabel}>Note finale</p>
            <p style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: "clamp(56px,8vw,88px)",
              fontWeight: 300,
              lineHeight: 1,
              color: scoreColor(finalScore),
              marginBottom: 4,
            }}>
              {finalScore}
              <span style={{ fontSize: "0.45em", color: "#6a6258" }}>/20</span>
            </p>
            <p style={{ fontSize: 12, color: "#6a6258", fontFamily: "'Raleway',sans-serif", letterSpacing: "0.1em" }}>
              Grand Oral CRFPA — {subject?.title}
            </p>
          </div>

          {/* Score breakdown */}
          {scoreBreakdown && (
            <div style={cardStyle}>
              <p style={goldLabel}>Détail de la note</p>
              <ScoreBreakdownTable breakdown={scoreBreakdown} />
            </div>
          )}

          {/* Feedback */}
          {feedbackText && (
            <div style={cardStyle}>
              <p style={goldLabel}>Analyse du jury</p>
              <p style={{ fontSize: 13, color: "#c8bfb0", lineHeight: 1.9 }}>{feedbackText}</p>
            </div>
          )}

          {/* Points forts / faibles */}
          {(pointsForts.length > 0 || pointsFaibles.length > 0) && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
              {pointsForts.length > 0 && (
                <div style={{ ...cardStyle, marginBottom: 0 }}>
                  <p style={{ ...goldLabel, color: "#8a9a6a" }}>Points forts</p>
                  <ul style={{ paddingLeft: 20, margin: 0 }}>
                    {pointsForts.map((p, i) => (
                      <li key={i} style={{ fontSize: 13, color: "#c8bfb0", lineHeight: 1.8, marginBottom: 4 }}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}
              {pointsFaibles.length > 0 && (
                <div style={{ ...cardStyle, marginBottom: 0 }}>
                  <p style={{ ...goldLabel, color: "#c97a4c" }}>Points à améliorer</p>
                  <ul style={{ paddingLeft: 20, margin: 0 }}>
                    {pointsFaibles.map((p, i) => (
                      <li key={i} style={{ fontSize: 13, color: "#c8bfb0", lineHeight: 1.8, marginBottom: 4 }}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* References */}
          {references.length > 0 && (
            <div style={cardStyle}>
              <p style={goldLabel}>Références à revoir</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {references.map((ref, i) => (
                  <div key={i} style={{
                    borderLeft: "2px solid rgba(201,168,76,0.3)",
                    paddingLeft: 16,
                  }}>
                    <p style={{ fontSize: 11, fontFamily: "'Raleway',sans-serif", letterSpacing: "0.15em", textTransform: "uppercase", color: "#c9a84c", marginBottom: 4 }}>
                      {ref.type}
                    </p>
                    <p style={{ fontSize: 13, color: "#f5f0e8", fontFamily: "'Libre Baskerville',serif", marginBottom: 4 }}>{ref.reference}</p>
                    <p style={{ fontSize: 12, color: "#8a8070" }}>{ref.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 8 }}>
            <button onClick={restart} className="btn-gold">
              <span className="btn-text">Recommencer</span>
            </button>
            <Link href="/grands-concours/history" style={{ textDecoration: "none" }}>
              <button className="btn-outline">
                <span>Voir l&apos;historique</span>
              </button>
            </Link>
          </div>
        </>
      )}
    </main>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function PhaseIndicator({ phase }: { phase: Phase }) {
  const phases: { key: Phase; label: string }[] = [
    { key: "start",  label: "Sujet"       },
    { key: "prep",   label: "Préparation" },
    { key: "expose", label: "Exposé"      },
    { key: "qa",     label: "Entretien"   },
    { key: "bilan",  label: "Bilan"       },
  ]
  const activeIdx = phases.findIndex(p => p.key === phase)

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 32, flexWrap: "wrap" }}>
      {phases.map((p, i) => (
        <div key={p.key} style={{ display: "flex", alignItems: "center" }}>
          <div style={{
            fontFamily: "'Raleway',sans-serif",
            fontSize: 10,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            padding: "6px 14px",
            borderTop: "1px solid",
            borderBottom: "1px solid",
            borderLeft: i === 0 ? "1px solid" : "none",
            borderRight: "1px solid",
            borderColor: i <= activeIdx ? "rgba(201,168,76,0.5)" : "rgba(201,168,76,0.15)",
            color: i === activeIdx ? "#c9a84c" : i < activeIdx ? "#8a7a5a" : "#3a3530",
            background: i === activeIdx ? "rgba(201,168,76,0.08)" : "transparent",
          }}>
            {p.label}
          </div>
        </div>
      ))}
    </div>
  )
}

function SubjectCard({
  subject,
  compact = false,
}: {
  subject: Pick<CrfpaSubject, "id" | "title" | "description" | "difficulty" | "year" | "source_name" | "category">
  compact?: boolean
}) {
  return (
    <div style={{
      border: "1px solid rgba(201,168,76,0.3)",
      padding: compact ? "16px 24px" : "24px 32px",
      marginBottom: 24,
      background: "rgba(201,168,76,0.02)",
    }}>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "baseline", marginBottom: 8 }}>
        <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase", color: "#c9a84c" }}>
          Votre sujet
        </span>
        {subject.difficulty && (
          <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "#6a6258" }}>
            Difficulté : {difficultyLabel(subject.difficulty)}
          </span>
        )}
        {subject.year && (
          <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "#6a6258" }}>
            {subject.year}
          </span>
        )}
        {subject.source_name && (
          <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "#6a6258" }}>
            {subject.source_name}
          </span>
        )}
      </div>
      <p style={{
        fontFamily: "'Cormorant Garamond',serif",
        fontSize: compact ? 18 : 22,
        fontWeight: 300,
        lineHeight: 1.5,
        color: "#f5f0e8",
        marginBottom: subject.description && !compact ? 12 : 0,
      }}>
        {subject.title}
      </p>
      {!compact && subject.description && (
        <p style={{ fontSize: 13, color: "#8a8070", lineHeight: 1.8 }}>{subject.description}</p>
      )}
    </div>
  )
}

function TimerBlock({
  label,
  display,
  remaining,
  total,
  expired,
  expiredMessage,
}: {
  label: string
  display: string
  remaining: number
  total: number
  expired: boolean
  expiredMessage: string
}) {
  const pct = Math.min(100, ((total - remaining) / total) * 100)
  const isWarning = remaining < total * 0.1

  return (
    <div style={{
      border: `1px solid ${expired ? "rgba(201,80,76,0.3)" : isWarning ? "rgba(201,140,76,0.4)" : "rgba(201,168,76,0.2)"}`,
      padding: "16px 24px",
      marginBottom: 24,
      display: "flex",
      alignItems: "center",
      gap: 24,
      flexWrap: "wrap",
    }}>
      <div>
        <p style={{ fontFamily: "'Raleway',sans-serif", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#6a6258", marginBottom: 4 }}>
          {label}
        </p>
        <p style={{
          fontFamily: "'Cormorant Garamond',serif",
          fontSize: 36,
          fontWeight: 300,
          lineHeight: 1,
          color: expired ? "#c97a4c" : isWarning ? "#c9a04c" : "#c9a84c",
        }}>
          {display}
        </p>
      </div>
      <div style={{ flex: 1, minWidth: 120 }}>
        <div style={{ height: 2, background: "rgba(201,168,76,0.1)", position: "relative" }}>
          <div style={{
            height: 2,
            width: `${pct}%`,
            background: expired ? "#c97a4c" : isWarning ? "#c9a04c" : "#c9a84c",
            transition: "width 1s linear",
          }} />
        </div>
        {expired && (
          <p style={{ fontSize: 11, color: "#c97a4c", marginTop: 8, fontFamily: "'Raleway',sans-serif", letterSpacing: "0.05em" }}>
            {expiredMessage}
          </p>
        )}
      </div>
    </div>
  )
}

function ScoreBreakdownTable({ breakdown }: { breakdown: ScoreBreakdown }) {
  const rows: { key: keyof ScoreBreakdown; label: string; max: number }[] = [
    { key: "maitrise_sujet",  label: "Maîtrise du sujet",  max: 4 },
    { key: "argumentation",   label: "Argumentation",      max: 4 },
    { key: "structure",       label: "Structure",          max: 3 },
    { key: "prestance_orale", label: "Prestance orale",    max: 5 },
    { key: "esprit_critique", label: "Esprit critique",    max: 4 },
  ]
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {rows.map(row => {
        const val = breakdown[row.key] ?? 0
        const pct = Math.min(100, (val / row.max) * 100)
        return (
          <div key={row.key} style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: 11, letterSpacing: "0.1em", color: "#8a8070", width: 180, flexShrink: 0 }}>
              {row.label}
            </span>
            <div style={{ flex: 1, height: 4, background: "rgba(201,168,76,0.1)", position: "relative" }}>
              <div style={{ height: 4, width: `${pct}%`, background: "#c9a84c", transition: "width 0.5s ease" }} />
            </div>
            <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, fontWeight: 300, color: "#f5f0e8", width: 48, textAlign: "right" }}>
              {val}<span style={{ fontSize: 12, color: "#6a6258" }}>/{row.max}</span>
            </span>
          </div>
        )
      })}
    </div>
  )
}
