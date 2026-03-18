import React, { useState } from "react";

export default function App() {
  const [screen, setScreen] = useState("menu");
  const [score, setScore] = useState(0);

  const questions = [
    {
      question: "2 + 2 kaçtır?",
      options: ["2", "3", "4", "5"],
      answer: 2,
    },
    {
      question: "Türkiye'nin başkenti?",
      options: ["İstanbul", "Ankara", "İzmir", "Bursa"],
      answer: 1,
    },
  ];

  const [qIndex, setQIndex] = useState(0);
  const current = questions[qIndex];

  if (screen === "result") {
    return (
      <div style={{ textAlign: "center", marginTop: 100 }}>
        <h1>Oyun Bitti</h1>
        <h2>Skor: {score}</h2>
        <button onClick={() => setScreen("menu")}>Menü</button>
      </div>
    );
  }

  if (screen === "game") {
    return (
      <div style={{ textAlign: "center", marginTop: 100 }}>
        <h2>{current.question}</h2>

        {current.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => {
              if (i === current.answer) setScore(score + 10);

              if (qIndex < questions.length - 1) {
                setQIndex(qIndex + 1);
              } else {
                setScreen("result");
              }
            }}
            style={{ display: "block", margin: "10px auto" }}
          >
            {opt}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", marginTop: 100 }}>
      <h1>🎮 YKS TURNUVA</h1>
      <button onClick={() => setScreen("game")}>Başla</button>
    </div>
  );
}
