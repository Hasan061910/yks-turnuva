import React, { useState, useEffect } from "react";

const avatars = [
  { emoji: "🧑‍🚀", label: "Yıldız Kaşif" },
  { emoji: "🧒", label: "Neşeli Kaptan" },
  { emoji: "👧", label: "Mini Bilge" },
  { emoji: "🦸", label: "Orman Kahramanı" },
  { emoji: "🚀", label: "Roket Çocuk" },
  { emoji: "🤓", label: "Gülücük Dâhi" },
];

const questions = [
  { question: "2+2 kaç?", options: ["2","3","4","5"], answer: 2 },
  { question: "Başkent?", options: ["İstanbul","Ankara","İzmir","Bursa"], answer: 1 },
  { question: "5x2?", options: ["5","10","15","20"], answer: 1 },
  { question: "Su kaç derecede kaynar?", options: ["50","100","150","0"], answer: 1 },
  { question: "En büyük gezegen?", options: ["Dünya","Mars","Jüpiter","Venüs"], answer: 2 },
  { question: "3x3?", options: ["6","9","12","3"], answer: 1 },
  { question: "Güneş doğudan mı doğar?", options: ["Evet","Hayır"], answer: 0 },
  { question: "10/2?", options: ["2","3","5","10"], answer: 2 },
  { question: "H2O nedir?", options: ["Su","Ateş","Toprak","Hava"], answer: 0 },
  { question: "Türkiye kaç bölge?", options: ["5","6","7","8"], answer: 2 },
];

export default function App() {
  const [screen, setScreen] = useState("menu");
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("🧑‍🚀");
  const [exam, setExam] = useState("");
  const [lesson, setLesson] = useState("");
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);

  const [time, setTime] = useState(20);
  const [selected, setSelected] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const current = questions[qIndex];

  useEffect(() => {
    if (screen !== "game" || showAnswer) return;

    const timer = setInterval(() => {
      setTime((t) => {
        if (t <= 1) {
          setShowAnswer(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [screen, showAnswer]);

  if (screen === "result") {
    return (
      <div style={{ textAlign: "center", marginTop: 100 }}>
        <h1>🏆 Oyun Bitti</h1>
        <h2>{avatar} {name}</h2>
        <h2>Skor: {score}</h2>
        <button onClick={() => setScreen("menu")}>Menü</button>
      </div>
    );
  }

  if (screen === "game") {
    return (
      <div style={{ textAlign: "center", marginTop: 60 }}>
        <h2>{avatar} {name}</h2>
        <h3>{exam} - {lesson}</h3>

        <p>⏱ {time}</p>

        <h2>{current.question}</h2>

        {current.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => {
              if (showAnswer) return;

              setSelected(i);
              setShowAnswer(true);

              if (i === current.answer) {
                setScore((s) => s + 10);
              }
            }}
            style={{
              display: "block",
              margin: "10px auto",
              padding: "12px",
              width: "200px",
              background:
                showAnswer && i === current.answer
                  ? "green"
                  : showAnswer && i === selected
                  ? "red"
                  : "gray",
              color: "white",
              border: "none",
              borderRadius: "8px",
            }}
          >
            {opt}
          </button>
        ))}

        {showAnswer && (
          <button
            onClick={() => {
              if (qIndex < 9) {
                setQIndex(qIndex + 1);
                setTime(20);
                setSelected(null);
                setShowAnswer(false);
              } else {
                setScreen("result");
              }
            }}
          >
            Sonraki
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", marginTop: 60 }}>
      <h1>🎮 YKS TURNUVA</h1>

      <input
        placeholder="İsim"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <h3>Avatar</h3>
      {avatars.map((a) => (
        <button key={a.label} onClick={() => setAvatar(a.emoji)}>
          {a.emoji}
        </button>
      ))}

      <h3>Sınav</h3>
      <button onClick={() => setExam("TYT")}>TYT</button>
      <button onClick={() => setExam("AYT")}>AYT</button>

      <h3>Ders</h3>
      <button onClick={() => setLesson("Matematik")}>Matematik</button>
      <button onClick={() => setLesson("Türkçe")}>Türkçe</button>

      <br /><br />

      <button
        onClick={() => {
          if (!name || !exam || !lesson) {
            alert("Hepsini seç!");
            return;
          }
          setScreen("game");
        }}
      >
        Başla
      </button>
    </div>
  );
}
