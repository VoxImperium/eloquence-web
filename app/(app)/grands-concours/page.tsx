"use client"

import { useState } from "react"
import Link from "next/link"

type Exam = "crfpa" | "enm"
type ExamType = "ecrit" | "oral"

export default function GrandsConcoursPage() {
  const [exam, setExam] = useState<Exam>("crfpa")
  const [examType, setExamType] = useState<ExamType>("ecrit")
  const [sujet, setSujet] = useState("")
  const [studentAnswer, setStudentAnswer] = useState("")
  const [juryQuestions, setJuryQuestions] = useState<{ jury_question: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateSubject = async () => {
    setLoading(true)
    setError(null)
    setSujet("")
    setJuryQuestions([])
    setStudentAnswer("")
    try {
      const endpoint = examType === "oral"
        ? "/api/backend/grands-concours/generate-oral-sujet"
        : "/api/backend/grands-concours/generate-sujet"
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exam_type: exam }),
      })
      if (!res.ok) throw new Error("Erreur lors de la génération du sujet.")
      const data = await res.json()
      setSujet(data.sujet ?? "")
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Une erreur est survenue.")
    } finally {
      setLoading(false)
    }
  }

  const submitAnswer = async () => {
    if (!studentAnswer.trim() || !sujet) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/backend/grands-concours/simulate-oral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exam_type: `${exam}_${examType}`,
          student_presentation: studentAnswer,
          sujet,
          iteration: juryQuestions.length + 1,
        }),
      })
      if (!res.ok) throw new Error("Erreur lors de la simulation.")
      const data = await res.json()
      setJuryQuestions(prev => [...prev, { jury_question: data.jury_question }])
      setStudentAnswer("")
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Une erreur est survenue.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ padding: "40px 48px", maxWidth: 960, margin: "0 auto" }}>
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

      <div style={{ marginTop: 24, marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
          <span style={{
            fontFamily: "'Raleway',sans-serif",
            fontSize: 10,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "#c9a84c",
          }}>
            VI — Grands Concours
          </span>
        </div>
        <h1 style={{
          fontFamily: "'Cormorant Garamond',serif",
          fontSize: "clamp(32px,4vw,52px)",
          fontWeight: 300,
          lineHeight: 1.1,
          marginBottom: 12,
        }}>
          Simulation <em style={{ color: "#c9a84c" }}>CRFPA & ENM</em>
        </h1>
        <p style={{ fontSize: 13, color: "#6a6258", lineHeight: 1.9, maxWidth: 560 }}>
          Préparez-vous aux plus grands défis de l&apos;éloquence juridique.
          Générez des sujets d&apos;écrits ou d&apos;oraux et soumettez vos réponses à un jury IA.
        </p>
      </div>

      <div style={{
        border: "1px solid rgba(201,168,76,0.2)",
        padding: "32px 40px",
        marginBottom: 32,
      }}>
        <div style={{ display: "flex", gap: 32, flexWrap: "wrap", marginBottom: 24 }}>
          <div>
            <label style={{
              fontFamily: "'Raleway',sans-serif",
              fontSize: 10,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#6a6258",
              display: "block",
              marginBottom: 8,
            }}>
              Examen
            </label>
            <select
              value={exam}
              onChange={e => setExam(e.target.value as Exam)}
              style={{
                background: "rgba(201,168,76,0.04)",
                border: "1px solid rgba(201,168,76,0.2)",
                color: "#f5f0e8",
                padding: "8px 16px",
                fontFamily: "'Raleway',sans-serif",
                fontSize: 12,
                letterSpacing: "0.1em",
                cursor: "pointer",
              }}
            >
              <option value="crfpa">CRFPA (Avocat)</option>
              <option value="enm">ENM (Magistrat)</option>
            </select>
          </div>

          <div>
            <label style={{
              fontFamily: "'Raleway',sans-serif",
              fontSize: 10,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#6a6258",
              display: "block",
              marginBottom: 8,
            }}>
              Type d&apos;épreuve
            </label>
            <select
              value={examType}
              onChange={e => setExamType(e.target.value as ExamType)}
              style={{
                background: "rgba(201,168,76,0.04)",
                border: "1px solid rgba(201,168,76,0.2)",
                color: "#f5f0e8",
                padding: "8px 16px",
                fontFamily: "'Raleway',sans-serif",
                fontSize: 12,
                letterSpacing: "0.1em",
                cursor: "pointer",
              }}
            >
              <option value="ecrit">Écrit</option>
              <option value="oral">Oral / Grand Oral</option>
            </select>
          </div>
        </div>

        {examType === "oral" && exam === "crfpa" && (
          <div style={{
            padding: "12px 16px",
            border: "1px solid rgba(201,168,76,0.15)",
            background: "rgba(201,168,76,0.03)",
            marginBottom: 20,
            fontSize: 12,
            color: "#8a8070",
            lineHeight: 1.8,
          }}>
            <strong style={{ color: "#c9a84c" }}>Grand Oral CRFPA</strong>
            {" "}— Exposé 15 min + Discussion 15 min · Thème : Libertés et droits fondamentaux
          </div>
        )}

        {examType === "oral" && exam === "enm" && (
          <div style={{
            padding: "12px 16px",
            border: "1px solid rgba(201,168,76,0.15)",
            background: "rgba(201,168,76,0.03)",
            marginBottom: 20,
            fontSize: 12,
            color: "#8a8070",
            lineHeight: 1.8,
          }}>
            <strong style={{ color: "#c9a84c" }}>Oraux ENM</strong>
            {" "}— Matière au choix : Droit public / Affaires / Social / UE · Mise en situation éthique (40 min)
          </div>
        )}

        <button
          onClick={generateSubject}
          disabled={loading}
          className="btn-gold"
          style={{ opacity: loading ? 0.6 : 1 }}
        >
          <span className="btn-text">
            {loading ? "Génération…" : `Générer un sujet ${examType === "oral" ? "oral" : "écrit"}`}
          </span>
        </button>
      </div>

      {error && (
        <div style={{
          border: "1px solid rgba(201,80,76,0.4)",
          background: "rgba(201,80,76,0.06)",
          padding: "12px 20px",
          marginBottom: 24,
          fontSize: 13,
          color: "#c97a4c",
          letterSpacing: "0.02em",
        }}>
          ⚠ {error}
        </div>
      )}

      {sujet && (
        <div style={{
          border: "1px solid rgba(201,168,76,0.3)",
          padding: "24px 32px",
          marginBottom: 24,
        }}>
          <p style={{
            fontFamily: "'Raleway',sans-serif",
            fontSize: 10,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "#c9a84c",
            marginBottom: 12,
          }}>
            Votre sujet
          </p>
          <p style={{
            fontFamily: "'Cormorant Garamond',serif",
            fontSize: 22,
            fontWeight: 300,
            lineHeight: 1.5,
            color: "#f5f0e8",
          }}>
            {sujet}
          </p>
        </div>
      )}

      {sujet && (
        <div style={{ marginBottom: 32 }}>
          <textarea
            value={studentAnswer}
            onChange={e => setStudentAnswer(e.target.value)}
            placeholder={examType === "oral"
              ? "Rédigez votre exposé ou réponse ici…"
              : "Rédigez votre réponse ici…"}
            style={{
              width: "100%",
              height: 240,
              padding: "16px 20px",
              background: "rgba(201,168,76,0.02)",
              border: "1px solid rgba(201,168,76,0.15)",
              color: "#f5f0e8",
              fontFamily: "'Libre Baskerville',serif",
              fontSize: 13,
              lineHeight: 1.8,
              resize: "vertical",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          <button
            onClick={submitAnswer}
            disabled={!studentAnswer.trim() || loading}
            className="btn-outline"
            style={{ marginTop: 12, opacity: (!studentAnswer.trim() || loading) ? 0.4 : 1, cursor: (!studentAnswer.trim() || loading) ? "not-allowed" : "pointer" }}
          >
            <span>Soumettre au jury →</span>
          </button>
        </div>
      )}

      {juryQuestions.length > 0 && (
        <div>
          <p style={{
            fontFamily: "'Raleway',sans-serif",
            fontSize: 10,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "#6a6258",
            marginBottom: 16,
          }}>
            Questions du jury
          </p>
          {juryQuestions.map((q, i) => (
            <div
              key={i}
              style={{
                border: "1px solid rgba(201,168,76,0.15)",
                padding: "20px 24px",
                marginBottom: 16,
                background: "rgba(201,168,76,0.02)",
              }}
            >
              <p style={{
                fontFamily: "'Raleway',sans-serif",
                fontSize: 10,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#c9a84c",
                marginBottom: 8,
              }}>
                Question {i + 1}
              </p>
              <p style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: 18,
                fontWeight: 300,
                lineHeight: 1.6,
                color: "#f5f0e8",
              }}>
                {q.jury_question}
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
