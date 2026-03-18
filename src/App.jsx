import React, { useState } from "react";

const avatars = [
  { emoji: "🧑‍🚀", label: "Yıldız Kaşif" },
  { emoji: "🧒", label: "Neşeli Kaptan" },
  { emoji: "👧", label: "Mini Bilge" },
  { emoji: "🦸", label: "Orman Kahramanı" },
  { emoji: "🚀", label: "Roket Çocuk" },
  { emoji: "🤓", label: "Gülücük Dâhi" },
];

const questions = [
  { question: "2 + 2 kaçtır?", options: ["2", "3", "4", "5"], answer: 2 },
  { question: "Türkiye'nin başkenti hangisidir?", options: ["İstanbul", "Ankara", "İzmir", "Bursa"], answer: 1 },
  { question: "5 x 2 kaçtır?", options: ["5", "10", "15", "20"], answer: 1 },
  { question: "Su kaç derecede kaynar?", options: ["50", "100", "150", "0"], answer: 1 },
  { question: "En büyük gezegen hangisidir?", options: ["Dünya", "Mars", "Jüpiter", "Venüs"], answer: 2 },
  { question: "3 x 3 kaçtır?", options: ["6", "9", "12", "3"], answer: 1 },
  { question: "Güneş doğudan mı doğar?", options: ["Evet", "Hayır", "Bazen", "Batıdan"], answer: 0 },
  { question: "10 / 2 kaçtır?", options: ["2", "3", "5", "10"], answer: 2 },
  { question: "H2O nedir?", options: ["Su", "Ateş", "Toprak", "Hava"], answer: 0 },
  { question: "Türkiye kaç coğrafi bölgeden oluşur?", options: ["5", "6", "7", "8"], answer: 2 },
];

const pageStyle = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
  background: "linear-gradient(135deg,#2563eb,#3b82f6,#4338ca)",
  color: "white",
  fontFamily: "Arial, sans-serif",
};

export default function App() {
  const [screen, setScreen] = useState("menu");
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("🧑‍🚀");
  const [exam, setExam] = useState("");
  const [lesson, setLesson] = useState("");
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);

  const current = questions[qIndex];

  if (screen === "result") {
    return (
      <div style={pageStyle}>
        <div style={{ width: "100%", maxWidth: 580, background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 28, padding: 28, textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
          <h1 style={{ marginTop: 0 }}>🏆 Oyun Bitti</h1>
          <h2>{avatar} {name}</h2>
          <p style={{ fontSize: 30, fontWeight: 800 }}>Skor: {score}</p>
          <button onClick={() => { setScreen("menu"); setQIndex(0); setScore(0); }} style={{ padding: "12px 24px", borderRadius: 12, border: 0, cursor: "pointer", fontWeight: 700 }}>
            Ana Menü
          </button>
        </div>
      </div>
    );
  }

  if (screen === "game") {
    return (
      <div style={{ ...pageStyle, background: "linear-gradient(135deg,#312e81,#4338ca,#1d4ed8)" }}>
        <div style={{ width: "100%", maxWidth: 760, background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 28, padding: 24, boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{avatar} {name}</div>
              <div style={{ opacity: 0.8 }}>{exam} • {lesson}</div>
            </div>
            <div style={{ fontWeight: 700 }}>Skor: {score}</div>
          </div>

          <div style={{ marginBottom: 14, fontWeight: 700 }}>Soru {qIndex + 1} / {questions.length}</div>
          <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 18 }}>{current.question}</div>

          {current.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => {
                if (i === current.answer) setScore((s) => s + 10);
                if (qIndex < questions.length - 1) {
                  setQIndex((q) => q + 1);
                } else {
                  setScreen("result");
                }
              }}
              style={{
                display: "block",
                width: "100%",
                margin: "10px 0",
                padding: "14px 16px",
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(255,255,255,0.14)",
                color: "white",
                textAlign: "left",
                cursor: "pointer",
                fontSize: 16,
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={{ width: "100%", maxWidth: 700, background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 28, padding: 28, textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
        <h1 style={{ margin: 0, fontSize: 44, fontWeight: 800 }}>YKS Turnuva</h1>
        <p style={{ marginTop: 10, opacity: 0.75 }}>İsmini yaz, avatarını seç, alanını ve dersini belirle, sonra yarışmaya başla.</p>

        <input
          placeholder="İsmini yaz"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ width: "100%", marginTop: 18, padding: "14px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.25)", outline: "none", fontSize: 16, background: "rgba(255,255,255,0.92)" }}
        />

        <div style={{ marginTop: 24, fontWeight: 700 }}>Profil Karakteri Seç:</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginTop: 14 }}>
          {avatars.map((item) => {
            const active = avatar === item.emoji;
            return (
              <button
                key={item.label}
                onClick={() => setAvatar(item.emoji)}
                style={{
                  borderRadius: 18,
                  border: active ? "2px solid rgba(255,255,255,0.95)" : "1px solid rgba(255,255,255,0.2)",
                  background: active ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.10)",
                  color: "white",
                  padding: "18px 8px",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontSize: 34, marginBottom: 8 }}>{item.emoji}</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{item.label}</div>
              </button>
            );
          })}
        </div>

        <div style={{ marginTop: 12, opacity: 0.6, fontSize: 12 }}>
          Hazır çizgi film karakterleri yerine oyun için uygun, çizgi film tarzı avatarlar eklendi.
        </div>

        <div style={{ marginTop: 22, fontWeight: 700 }}>Sınav Türü Seç:</div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 14 }}>
          <button
            onClick={() => { setExam("TYT"); setLesson(""); }}
            style={{ padding: "10px 20px", borderRadius: 10, border: 0, cursor: "pointer", background: exam === "TYT" ? "white" : "rgba(255,255,255,0.16)", color: exam === "TYT" ? "#111827" : "white", fontWeight: 700 }}
          >
            TYT
          </button>
          <button
            onClick={() => { setExam("AYT"); setLesson(""); }}
            style={{ padding: "10px 20px", borderRadius: 10, border: 0, cursor: "pointer", background: exam === "AYT" ? "white" : "rgba(255,255,255,0.16)", color: exam === "AYT" ? "#111827" : "white", fontWeight: 700 }}
          >
            AYT
          </button>
        </div>

        {exam && (
          <>
            <div style={{ marginTop: 22, fontWeight: 700 }}>Ders Seç:</div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginTop: 14 }}>
              {(exam === "TYT" ? ["Türkçe", "Matematik", "Fen", "Sosyal"] : ["Matematik", "Fizik", "Kimya", "Biyoloji", "Edebiyat"]).map((item) => (
                <button
                  key={item}
                  onClick={() => setLesson(item)}
                  style={{ padding: "10px 16px", borderRadius: 10, border: 0, cursor: "pointer", background: lesson === item ? "white" : "rgba(255,255,255,0.16)", color: lesson === item ? "#111827" : "white", fontWeight: 700 }}
                >
                  {item}
                </button>
              ))}
            </div>
          </>
        )}

        <button
          onClick={() => {
            if (!name || !exam || !lesson) {
              alert("İsim, sınav türü ve ders seçmelisin.");
              return;
            }
            setQIndex(0);
            setScore(0);
            setScreen("game");
          }}
          style={{ marginTop: 28, padding: "12px 26px", borderRadius: 12, border: 0, cursor: "pointer", background: "white", color: "#111827", fontWeight: 800, fontSize: 16 }}
        >
          Oyuna Başla
        </button>
      </div>
    </div>
  );
}
