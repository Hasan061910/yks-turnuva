import React, { useState } from "react";

const avatars = ["😀","😎","🤖","👻","🐱","🚀"];

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
  const [avatar, setAvatar] = useState("😀");
  const [exam, setExam] = useState("");
  const [lesson, setLesson] = useState("");
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);

  const current = questions[qIndex];

  if (screen === "result") {
    return (
      <div style={{ textAlign: "center", marginTop: 100 }}>
        <h1>🏆 Oyun Bitti</h1>
        <h2>{name}</h2>
        <h2>Skor: {score}</h2>
        <button onClick={() => setScreen("menu")}>Menü</button>
      </div>
    );
  }

  if (screen === "game") {
    return (
      <div style={{ textAlign: "center", marginTop: 80 }}>
        <h2>{avatar} {name}</h2>
        <h3>{exam} - {lesson}</h3>

        <h2>{current.question}</h2>

        {current.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => {
              if (i === current.answer) setScore(score + 10);

              if (qIndex < 9) {
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
    <div style={{ textAlign: "center", marginTop: 80 }}>
      <h1>🎮 YKS TURNUVA</h1>

      <input
        placeholder="İsim yaz"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <h3>Avatar seç</h3>
      {avatars.map((a) => (
        <button key={a} onClick={() => setAvatar(a)}>
          {a}
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
