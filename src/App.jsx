import React, { useEffect, useMemo, useState } from "react";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase, ref, set, get, onValue, update, off, remove } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyA07Q5-30EJsoJ-MVjWNLvj19dAUrFce4",
  authDomain: "yks-yaris.firebaseapp.com",
  databaseURL: "https://yks-yaris-default-rtdb.firebaseio.com",
  projectId: "yks-yaris",
  storageBucket: "yks-yaris.firebasestorage.app",
  messagingSenderId: "602435856699",
  appId: "1:602435856699:web:c974154eeb4a2bf711af1e",
};

const firebaseReady = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.databaseURL &&
    firebaseConfig.projectId &&
    !firebaseConfig.apiKey.startsWith("BURAYA_")
);

const app = firebaseReady ? (getApps().length ? getApp() : initializeApp(firebaseConfig)) : null;
const db = app ? getDatabase(app) : null;

const avatars = [
  { emoji: "🧑‍🚀", label: "Yıldız Kaşif" },
  { emoji: "🧒", label: "Neşeli Kaptan" },
  { emoji: "👧", label: "Mini Bilge" },
  { emoji: "🦸", label: "Orman Kahramanı" },
  { emoji: "🚀", label: "Roket Çocuk" },
  { emoji: "🤓", label: "Gülücük Dâhi" },
];

const questionBank = {
  Türkçe: [
    { question: "Aşağıdakilerden hangisi mecaz anlamda kullanılmıştır?", options: ["Tatlı elma", "Sıcak bakış", "Soğuk su", "Mavi kalem", "Uzun yol"], answer: 1 },
    { question: "Aşağıdaki cümlelerin hangisinde yazım yanlışı vardır?", options: ["Her şey yolundaydı.", "Birçok kişi geldi.", "Hiç bir şey anlamadım.", "Birkaç gün sonra dönecek.", "Herkes yerini aldı."], answer: 2 },
    { question: "Aşağıdakilerden hangisi eş anlamlı sözcüklerden oluşur?", options: ["siyah - kara", "yaşlı - genç", "uzun - kısa", "sert - yumuşak", "doğru - yanlış"], answer: 0 },
    { question: "“Kitabı masanın üzerine bıraktım.” cümlesinde kaç tane isim vardır?", options: ["1", "2", "3", "4", "5"], answer: 2 },
    { question: "Aşağıdaki cümlelerin hangisinde neden-sonuç ilişkisi vardır?", options: ["Başarılı olmak için çok çalıştı.", "Yağmur yağdığı için maç ertelendi.", "Eve gidip dinlendi.", "Kitabı okuyup bitirdi.", "Markete ekmek almaya gitti."], answer: 1 },
    { question: "Aşağıdakilerden hangisi zamirdir?", options: ["Güzel", "Koşmak", "Onlar", "Masa", "Mavi"], answer: 2 },
    { question: "Aşağıdaki sözcüklerden hangisi çoğuldur?", options: ["Kalem", "Defter", "Kitaplar", "Masa", "Okul"], answer: 2 },
    { question: "“Bugün hava çok güzel.” cümlesinde hangi sözcük sıfattır?", options: ["Bugün", "hava", "çok", "güzel", "Cümlede sıfat yok"], answer: 3 },
    { question: "Aşağıdakilerden hangisinde soru anlamı vardır?", options: ["Bugün okula gittim.", "Ne zaman geleceksin?", "Akşam film izledik.", "Yarın erken kalkacağım.", "Ders çalışmayı seviyorum."], answer: 1 },
    { question: "Aşağıdaki kelimelerden hangisi türemiş sözcüktür?", options: ["Göz", "Başlık", "Su", "Taş", "El"], answer: 1 },
  ],
  Matematik: [
    { question: "2 + 2 kaçtır?", options: ["2", "3", "4", "5", "6"], answer: 2 },
    { question: "5x = 20 ise x kaçtır?", options: ["2", "3", "4", "5", "6"], answer: 2 },
    { question: "12'nin yarısı kaçtır?", options: ["4", "5", "6", "7", "8"], answer: 2 },
    { question: "9 x 3 kaçtır?", options: ["18", "21", "24", "27", "30"], answer: 3 },
    { question: "15 - 7 işleminin sonucu kaçtır?", options: ["6", "7", "8", "9", "10"], answer: 2 },
    { question: "Bir üçgenin iç açıları toplamı kaç derecedir?", options: ["90", "120", "180", "270", "360"], answer: 2 },
    { question: "10'un %20'si kaçtır?", options: ["1", "2", "3", "4", "5"], answer: 1 },
    { question: "3² kaçtır?", options: ["3", "6", "9", "12", "18"], answer: 2 },
    { question: "Bir saatte kaç dakika vardır?", options: ["30", "45", "60", "90", "120"], answer: 2 },
    { question: "24 sayısının 6'ya bölümü kaçtır?", options: ["2", "3", "4", "5", "6"], answer: 2 },
  ],
  Fen: [
    { question: "Su kaç derecede kaynar?", options: ["0", "50", "100", "150", "200"], answer: 2 },
    { question: "Aşağıdakilerden hangisi bir kuvvet birimidir?", options: ["Watt", "Newton", "Joule", "Pascal", "Volt"], answer: 1 },
    { question: "Bitkiler fotosentez için aşağıdakilerden hangisine ihtiyaç duyar?", options: ["Klorofil", "Toprak altın", "Sadece rüzgâr", "Yalnızca taş", "Sadece gece"], answer: 0 },
    { question: "Ses boşlukta yayılır mı?", options: ["Evet", "Hayır", "Bazen", "Sadece sıvıda", "Sadece katıda"], answer: 1 },
    { question: "Aşağıdakilerden hangisi fiziksel değişime örnektir?", options: ["Kâğıdın yanması", "Demirin paslanması", "Suyun donması", "Sütün ekşimesi", "Odunun çürümesi"], answer: 2 },
    { question: "Güneş sisteminde yaşam olduğu bilinen tek gezegen hangisidir?", options: ["Mars", "Venüs", "Dünya", "Jüpiter", "Merkür"], answer: 2 },
    { question: "İnsan vücudunda solunumu sağlayan organ hangisidir?", options: ["Kalp", "Akciğer", "Böbrek", "Mide", "Karaciğer"], answer: 1 },
    { question: "Elektrik akımının birimi nedir?", options: ["Volt", "Amper", "Ohm", "Newton", "Watt"], answer: 1 },
    { question: "Aşağıdakilerden hangisi asitlerin özelliğidir?", options: ["Mavi turnusolü kırmızı yapar", "Kaygandır", "Acı tadı vardır", "pH değeri 7'den büyüktür", "Baziktir"], answer: 0 },
    { question: "Mıknatıs en güçlü etkiyi hangi bölgede gösterir?", options: ["Ortada", "Her yerde eşit", "Kutuplarda", "İç kısmında", "Sadece üstte"], answer: 2 },
  ],
  Sosyal: [
    { question: "Türkiye'nin başkenti hangisidir?", options: ["İstanbul", "İzmir", "Ankara", "Bursa", "Antalya"], answer: 2 },
    { question: "Ekvator'un kuzeyinde kalan yarımküre hangisidir?", options: ["Güney Yarımküre", "Kuzey Yarımküre", "Batı Yarımküre", "Doğu Yarımküre", "Orta Kuşak"], answer: 1 },
    { question: "Demokraside egemenlik kime aittir?", options: ["Krala", "Halka", "Orduya", "Hükümete", "Yargıya"], answer: 1 },
    { question: "Osmanlı Devleti'nin başkenti fetihten sonra hangi şehir olmuştur?", options: ["Bursa", "Edirne", "İstanbul", "Konya", "Ankara"], answer: 2 },
    { question: "Aşağıdakilerden hangisi ekonomik faaliyettir?", options: ["Tarım", "Uyku", "Oyun", "Dinlenme", "Yürüyüş"], answer: 0 },
    { question: "Türkiye hangi kıtalar arasında köprü konumundadır?", options: ["Asya - Avrupa", "Afrika - Avrupa", "Asya - Afrika", "Amerika - Avrupa", "Avrupa - Avustralya"], answer: 0 },
    { question: "İlk Türk alfabesi olarak kabul edilen alfabe hangisidir?", options: ["Latin", "Arap", "Göktürk", "Kiril", "İbrani"], answer: 2 },
    { question: "Yeryüzü şekillerini inceleyen bilim dalı hangisidir?", options: ["Tarih", "Coğrafya", "Sosyoloji", "Psikoloji", "Felsefe"], answer: 1 },
    { question: "TBMM ne zaman açılmıştır?", options: ["1919", "1920", "1921", "1922", "1923"], answer: 1 },
    { question: "Haritada kuzey yönü genellikle hangi tarafta gösterilir?", options: ["Altta", "Sağda", "Üstte", "Solda", "Ortada"], answer: 2 },
  ],
  Fizik: [
    { question: "Sürat birimi hangisidir?", options: ["Newton", "Joule", "m/s", "Pascal", "Watt"], answer: 2 },
    { question: "Elektrik akımının birimi nedir?", options: ["Volt", "Amper", "Ohm", "Tesla", "Watt"], answer: 1 },
    { question: "Işığın boşluktaki hızı yaklaşık kaç km/s'dir?", options: ["3.000", "30.000", "300.000", "3.000.000", "300"], answer: 2 },
    { question: "Bir cismin hareketine karşı koyan kuvvete ne denir?", options: ["Basınç", "Sürtünme", "İvme", "Enerji", "Ağırlık"], answer: 1 },
    { question: "Kütle hangi aletle ölçülür?", options: ["Dinamometre", "Termometre", "Eşit kollu terazi", "Barometre", "Voltmetre"], answer: 2 },
    { question: "Ağırlığın birimi hangisidir?", options: ["Kilogram", "Newton", "Metre", "Saniye", "Amper"], answer: 1 },
    { question: "Ses en hızlı hangi ortamda yayılır?", options: ["Boşluk", "Gaz", "Sıvı", "Katı", "Hepsinde eşit"], answer: 3 },
    { question: "Kaldırma kuvvetini inceleyen bilim insanı kimdir?", options: ["Newton", "Arşimet", "Einstein", "Tesla", "Galileo"], answer: 1 },
    { question: "Birimi joule olan büyüklük hangisidir?", options: ["Enerji", "Sürat", "Basınç", "Kuvvet", "Akım"], answer: 0 },
    { question: "Voltajı ölçen alet hangisidir?", options: ["Ampermetre", "Voltmetre", "Ohmmetre", "Termometre", "Dinamometre"], answer: 1 },
  ],
  Kimya: [
    { question: "Suyun formülü hangisidir?", options: ["CO2", "O2", "H2O", "NaCl", "H2"], answer: 2 },
    { question: "Periyodik tabloda H sembolü hangi elemente aittir?", options: ["Helyum", "Hidrojen", "Hafniyum", "Holmiyum", "Cıva"], answer: 1 },
    { question: "pH değeri 7 olan çözelti nasıldır?", options: ["Asidik", "Bazik", "Nötr", "Tuzlu", "Yoğun"], answer: 2 },
    { question: "Aşağıdakilerden hangisi soy gazdır?", options: ["Oksijen", "Azot", "Helyum", "Klor", "Hidrojen"], answer: 2 },
    { question: "NaCl bileşiğinin yaygın adı nedir?", options: ["Şeker", "Tuz", "Su", "Asit", "Alkol"], answer: 1 },
    { question: "Asitler mavi turnusol kâğıdını hangi renge çevirir?", options: ["Yeşil", "Sarı", "Kırmızı", "Mavi", "Mor"], answer: 2 },
    { question: "Aşağıdakilerden hangisi kimyasal değişime örnektir?", options: ["Buzun erimesi", "Suyun buharlaşması", "Kâğıdın yanması", "Camın kırılması", "Tuzun çözünmesi"], answer: 2 },
    { question: "O2 molekülü neyi ifade eder?", options: ["Hidrojen", "Azot", "Oksijen", "Karbon", "Helyum"], answer: 2 },
    { question: "Periyodik tabloda elementler neye göre sıralanır?", options: ["Kütle numarası", "Nötron sayısı", "Atom numarası", "Yoğunluk", "Hacim"], answer: 2 },
    { question: "Aşağıdakilerden hangisi bazların özelliğidir?", options: ["Ekşi tat", "Mavi turnusolü kırmızı yapar", "Kaygan his", "pH<7", "Asidiktir"], answer: 2 },
  ],
  Biyoloji: [
    { question: "Canlıların en küçük yapı birimi nedir?", options: ["Doku", "Organ", "Hücre", "Sistem", "Atom"], answer: 2 },
    { question: "Fotosentez hangi organelde gerçekleşir?", options: ["Mitokondri", "Kloroplast", "Ribozom", "Lizozom", "Çekirdek"], answer: 1 },
    { question: "İnsanda solunum sistemi organlarından biri hangisidir?", options: ["Kalp", "Akciğer", "Böbrek", "Karaciğer", "Mide"], answer: 1 },
    { question: "Kalıtsal bilgiyi taşıyan yapı hangisidir?", options: ["Protein", "DNA", "Vitamin", "Su", "Karbonhidrat"], answer: 1 },
    { question: "Aşağıdakilerden hangisi omurgalıdır?", options: ["Solucan", "Midye", "Balık", "Denizanası", "Sünger"], answer: 2 },
    { question: "Kanı vücuda pompalayan organ hangisidir?", options: ["Akciğer", "Kalp", "Karaciğer", "Mide", "Beyin"], answer: 1 },
    { question: "Bitkiler kendi besinlerini hangi olayla üretir?", options: ["Sindirim", "Fotosentez", "Boşaltım", "Solunum", "Dolaşım"], answer: 1 },
    { question: "İnsanda görme organı hangisidir?", options: ["Kulak", "Burun", "Deri", "Göz", "Dil"], answer: 3 },
    { question: "Aşağıdakilerden hangisi memelidir?", options: ["Kurbağa", "Serçe", "Yunus", "Kertenkele", "Balık"], answer: 2 },
    { question: "Kemikler hangi sistemin parçasıdır?", options: ["Sindirim", "Dolaşım", "İskelet", "Solunum", "Boşaltım"], answer: 2 },
  ],
  Edebiyat: [
    { question: "İstiklal Marşı'nın yazarı kimdir?", options: ["Tevfik Fikret", "Mehmet Akif Ersoy", "Yahya Kemal", "Namık Kemal", "Orhan Veli"], answer: 1 },
    { question: "Aşağıdakilerden hangisi divan edebiyatı şairidir?", options: ["Fuzuli", "Orhan Veli", "Cahit Sıtkı", "Mehmet Akif", "Namık Kemal"], answer: 0 },
    { question: "“Kiralık Konak” romanının yazarı kimdir?", options: ["Yakup Kadri Karaosmanoğlu", "Reşat Nuri Güntekin", "Peyami Safa", "Halit Ziya", "Ahmet Hamdi Tanpınar"], answer: 0 },
    { question: "Aşağıdakilerden hangisi halk edebiyatı nazım biçimidir?", options: ["Gazel", "Kaside", "Koşma", "Mesnevi", "Terkibibent"], answer: 2 },
    { question: "Servetifünun döneminin önemli romancısı kimdir?", options: ["Halit Ziya Uşaklıgil", "Ömer Seyfettin", "Namık Kemal", "Refik Halit", "Ahmet Mithat"], answer: 0 },
    { question: "“Safahat” adlı eserin yazarı kimdir?", options: ["Necip Fazıl", "Mehmet Akif Ersoy", "Yahya Kemal", "Ziya Gökalp", "Ahmet Haşim"], answer: 1 },
    { question: "Aşağıdakilerden hangisi bir tiyatro türüdür?", options: ["Roman", "Hikâye", "Trajedi", "Deneme", "Makale"], answer: 2 },
    { question: "“Çalıkuşu” romanının yazarı kimdir?", options: ["Reşat Nuri Güntekin", "Peyami Safa", "Yakup Kadri", "Orhan Kemal", "Kemal Tahir"], answer: 0 },
    { question: "Aşağıdakilerden hangisi Cumhuriyet dönemi şairidir?", options: ["Baki", "Fuzuli", "Orhan Veli", "Nedim", "Şeyh Galip"], answer: 2 },
    { question: "Roman, hikâye, masal gibi türlerin ortak adı nedir?", options: ["Nazım", "Tiyatro", "Anlatmaya bağlı metinler", "Bilgilendirici metinler", "Şiir"], answer: 2 },
  ],
};

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    background: "linear-gradient(135deg,#2563eb,#3b82f6,#4338ca)",
    color: "white",
    fontFamily: "Arial, sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: 720,
    background: "rgba(255,255,255,0.10)",
    border: "1px solid rgba(255,255,255,0.20)",
    borderRadius: 28,
    padding: 28,
    textAlign: "center",
    boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
    backdropFilter: "blur(12px)",
  },
};

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function roomCodeGen() {
  return Math.random().toString(36).slice(2, 6).toUpperCase();
}

export default function App() {
  const correctSound = useMemo(() => (typeof Audio !== "undefined" ? new Audio("https://actions.google.com/sounds/v1/cartoon/pop.ogg") : null), []);
  const wrongSound = useMemo(() => (typeof Audio !== "undefined" ? new Audio("https://actions.google.com/sounds/v1/cartoon/cartoon_boing.ogg") : null), []);

  const [screen, setScreen] = useState("menu");
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("🧑‍🚀");
  const [exam, setExam] = useState("");
  const [lesson, setLesson] = useState("");
  const [gameType, setGameType] = useState("offline");
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [time, setTime] = useState(20);
  const [selected, setSelected] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [joinCode, setJoinCode] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [roomData, setRoomData] = useState(null);
  const [roomError, setRoomError] = useState("");
  const [playerId] = useState(() => `player-${Math.random().toString(36).slice(2, 10)}`);

  const current = questions[qIndex];
  const lessons = exam === "TYT" ? ["Türkçe", "Matematik", "Fen", "Sosyal"] : exam === "AYT" ? ["Matematik", "Fizik", "Kimya", "Biyoloji", "Edebiyat"] : [];
  const ranking = roomData ? Object.values(roomData.players || {}).sort((a, b) => b.score - a.score) : [];
  const myOnlineScore = roomData?.players?.[playerId]?.score || 0;
  const isHost = roomData?.hostId === playerId;

  useEffect(() => {
    if (screen !== "game" || showAnswer || !current) return;
    const timer = setInterval(() => {
      setTime((t) => {
        if (t <= 1) {
          setShowAnswer(true);
          setCombo(0);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [screen, showAnswer, current]);

  useEffect(() => {
    if (!db || !roomCode || gameType !== "online") return;
    const roomRef = ref(db, `rooms/${roomCode}`);
    const unsub = onValue(roomRef, (snapshot) => {
      const value = snapshot.val();
      setRoomData(value);
      if (!value) return;
      if (value.status === "lobby") setScreen("onlineLobby");
      if (value.status === "playing") {
        setScreen("game");
        setExam(value.exam);
        setLesson(value.lesson);
        setQuestions((questionBank[value.lesson] || []).slice(0, 10));
        setQIndex(value.questionIndex || 0);
      }
      if (value.status === "finished") setScreen("result");
    });
    return () => off(roomRef, "value", unsub);
  }, [roomCode, gameType]);

  const playSound = (sound) => {
    if (!sound) return;
    sound.currentTime = 0;
    sound.play().catch(() => {});
  };

  const startOffline = () => {
    if (!name || !exam || !lesson) {
      alert("İsim, sınav türü ve ders seçmelisin.");
      return;
    }
    setQuestions(shuffle(questionBank[lesson] || []).slice(0, 10));
    setQIndex(0);
    setScore(0);
    setCombo(0);
    setTime(20);
    setSelected(null);
    setShowAnswer(false);
    setScreen("game");
  };

  const createRoom = async () => {
    if (!db) {
      alert("Firebase bağlantısı yok.");
      return;
    }
    if (!name || !exam || !lesson) {
      alert("İsim, sınav türü ve ders seçmelisin.");
      return;
    }
    const code = roomCodeGen();
    const room = {
      code,
      hostId: playerId,
      exam,
      lesson,
      status: "lobby",
      questionIndex: 0,
      players: {
        [playerId]: { id: playerId, name, avatar, score: 0, answered: false, selected: null },
      },
    };
    await set(ref(db, `rooms/${code}`), room);
    setRoomCode(code);
    setJoinCode(code);
    setRoomError("");
    setScreen("onlineLobby");
  };

  const joinRoom = async () => {
    if (!db) {
      alert("Firebase bağlantısı yok.");
      return;
    }
    const code = joinCode.trim().toUpperCase();
    if (!code || !name) {
      setRoomError("İsim yaz ve oda kodu gir.");
      return;
    }
    const roomRef = ref(db, `rooms/${code}`);
    const snap = await get(roomRef);
    if (!snap.exists()) {
      setRoomError("Oda bulunamadı.");
      return;
    }
    const value = snap.val();
    if (Object.keys(value.players || {}).length >= 4) {
      setRoomError("Oda dolu.");
      return;
    }
    await update(roomRef, {
      [`players/${playerId}`]: { id: playerId, name, avatar, score: 0, answered: false, selected: null },
    });
    setRoomCode(code);
    setRoomError("");
    setScreen("onlineLobby");
  };

  const startOnlineGame = async () => {
    if (!db || !roomCode || !isHost) return;
    await update(ref(db, `rooms/${roomCode}`), { status: "playing", questionIndex: 0 });
    setQIndex(0);
    setQuestions((questionBank[lesson] || []).slice(0, 10));
    setTime(20);
    setSelected(null);
    setShowAnswer(false);
  };

  const answer = async (i) => {
    if (showAnswer || !current) return;
    setSelected(i);
    setShowAnswer(true);
    const isCorrect = i === current.answer;

    if (isCorrect) {
      setScore((s) => s + 10);
      setCombo((c) => c + 1);
      playSound(correctSound);
    } else {
      setCombo(0);
      playSound(wrongSound);
    }

    if (gameType === "online" && db && roomCode) {
      const currentScore = roomData?.players?.[playerId]?.score || 0;
      await update(ref(db, `rooms/${roomCode}/players/${playerId}`), {
        selected: i,
        answered: true,
        score: isCorrect ? currentScore + 10 : currentScore,
      });
    }
  };

  const next = async () => {
    if (gameType === "online" && db && roomCode && isHost) {
      if (qIndex < questions.length - 1) {
        const payload = { questionIndex: qIndex + 1 };
        Object.keys(roomData.players || {}).forEach((id) => {
          payload[`players/${id}/answered`] = false;
          payload[`players/${id}/selected`] = null;
        });
        await update(ref(db, `rooms/${roomCode}`), payload);
        setQIndex((q) => q + 1);
        setTime(20);
        setSelected(null);
        setShowAnswer(false);
        return;
      }
      await update(ref(db, `rooms/${roomCode}`), { status: "finished" });
      return;
    }

    if (qIndex < questions.length - 1) {
      setQIndex((q) => q + 1);
      setTime(20);
      setSelected(null);
      setShowAnswer(false);
    } else {
      setScreen("result");
    }
  };

  const leaveRoom = async () => {
    if (db && roomCode) {
      if (isHost) await remove(ref(db, `rooms/${roomCode}`));
      else await remove(ref(db, `rooms/${roomCode}/players/${playerId}`));
    }
    setRoomCode("");
    setJoinCode("");
    setRoomData(null);
    setScreen("menu");
  };

  const optionStyle = (i) => ({
    display: "block",
    width: "100%",
    margin: "10px 0",
    padding: "14px 16px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.2)",
    color: "white",
    background: showAnswer && i === current.answer ? "#16a34a" : showAnswer && i === selected ? "#dc2626" : "rgba(255,255,255,0.14)",
    textAlign: "left",
    cursor: "pointer",
    fontSize: 16,
  });

  if (screen === "onlineLobby") {
    return (
      <div style={styles.page}>
        <div style={{ ...styles.card, maxWidth: 760 }}>
          <h1 style={{ marginTop: 0 }}>🌐 Online Oda</h1>
          <p>Oda Kodu: <b>{roomCode || "----"}</b></p>

          {!roomCode && (
            <div style={{ maxWidth: 320, margin: "0 auto 16px auto" }}>
              <input
                placeholder="Oda kodu gir"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: 0, fontSize: 16 }}
              />
            </div>
          )}

          {!roomCode && (
            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 14, flexWrap: "wrap" }}>
              <button onClick={createRoom} style={{ padding: "12px 18px", borderRadius: 12, border: 0, cursor: "pointer", fontWeight: 700 }}>Oda Kur</button>
              <button onClick={joinRoom} style={{ padding: "12px 18px", borderRadius: 12, border: 0, cursor: "pointer", fontWeight: 700 }}>Odaya Katıl</button>
            </div>
          )}

          {roomError && <p style={{ color: "#fecaca" }}>{roomError}</p>}

          <div style={{ display: "grid", gap: 10, marginTop: 20 }}>
            {ranking.map((p) => (
              <div key={p.id} style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", borderRadius: 14, background: "rgba(255,255,255,0.12)" }}>
                <span>{p.avatar} {p.name}{p.id === playerId ? " (Sen)" : ""}</span>
                <span>{p.score}</span>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 18, flexWrap: "wrap" }}>
            <button onClick={startOnlineGame} disabled={!isHost || ranking.length < 2} style={{ padding: "12px 18px", borderRadius: 12, border: 0, cursor: "pointer", fontWeight: 700 }}>
              Maçı Başlat
            </button>
            <button onClick={leaveRoom} style={{ padding: "12px 18px", borderRadius: 12, border: 0, cursor: "pointer", fontWeight: 700 }}>
              Geri
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === "result") {
    const finalScore = gameType === "online" ? myOnlineScore : score;
    return (
      <div style={styles.page}>
        <div style={{ ...styles.card, maxWidth: 640 }}>
          <h1 style={{ marginTop: 0 }}>🏆 Oyun Bitti</h1>
          <h2>{avatar} {name}</h2>
          <p style={{ fontSize: 34, fontWeight: 800 }}>Skor: {finalScore}</p>

          {gameType === "online" && (
            <div style={{ marginTop: 16, textAlign: "left" }}>
              <p style={{ textAlign: "center", fontWeight: 700 }}>Sıralama</p>
              {ranking.map((p, i) => (
                <div key={p.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", borderRadius: 12, marginBottom: 8, background: p.id === playerId ? "#facc15" : "rgba(255,255,255,0.12)", color: p.id === playerId ? "#111827" : "white" }}>
                  <span>#{i + 1} {p.name}</span>
                  <span>{p.score}</span>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 18, flexWrap: "wrap" }}>
            <button onClick={() => { setScreen("menu"); setQIndex(0); setScore(0); setCombo(0); setTime(20); }} style={{ padding: "12px 18px", borderRadius: 12, border: 0, cursor: "pointer", fontWeight: 700 }}>
              Ana Menü
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === "game" && current) {
    return (
      <div style={{ ...styles.page, background: "linear-gradient(135deg,#312e81,#4338ca,#1d4ed8)" }}>
        <div style={{ ...styles.card, maxWidth: 760 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{avatar} {name}</div>
              <div style={{ opacity: 0.8 }}>{exam} • {lesson}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: 700 }}>Skor: {gameType === "online" ? myOnlineScore : score}</div>
              <div style={{ opacity: 0.8 }}>🔥 Combo: {combo}</div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
            <div>Soru {qIndex + 1} / {questions.length}</div>
            <div>⏱ {time}</div>
          </div>

          <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 18 }}>{current.question}</div>

          {current.options.map((opt, i) => (
            <button key={i} onClick={() => answer(i)} style={optionStyle(i)}>
              {opt}
            </button>
          ))}

          {gameType === "online" && (
            <div style={{ marginTop: 18, background: "rgba(255,255,255,0.10)", borderRadius: 14, padding: 12, textAlign: "left" }}>
              <p style={{ marginTop: 0, fontWeight: 700 }}>Canlı Sıralama</p>
              {ranking.map((p, i) => (
                <div key={p.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span>#{i + 1} {p.name}</span>
                  <span>{p.score}</span>
                </div>
              ))}
            </div>
          )}

          {showAnswer && (
            <div style={{ marginTop: 16 }}>
              <button onClick={next} style={{ padding: "12px 18px", borderRadius: 12, border: 0, cursor: "pointer", fontWeight: 700 }}>
                {qIndex < questions.length - 1 ? "Sonraki" : "Bitir"}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
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
                style={{ borderRadius: 18, border: active ? "2px solid rgba(255,255,255,0.95)" : "1px solid rgba(255,255,255,0.2)", background: active ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.10)", color: "white", padding: "18px 8px", cursor: "pointer" }}
              >
                <div style={{ fontSize: 34, marginBottom: 8 }}>{item.emoji}</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{item.label}</div>
              </button>
            );
          })}
        </div>

        <div style={{ marginTop: 12, opacity: 0.6, fontSize: 12 }}>Hazır çizgi film karakterleri yerine oyun için uygun, çizgi film tarzı avatarlar eklendi.</div>

        <div style={{ marginTop: 22, fontWeight: 700 }}>Oyun Modu Seç:</div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 14, flexWrap: "wrap" }}>
          <button onClick={() => setGameType("offline")} style={{ padding: "10px 20px", borderRadius: 10, border: 0, cursor: "pointer", background: gameType === "offline" ? "white" : "rgba(255,255,255,0.16)", color: gameType === "offline" ? "#111827" : "white", fontWeight: 700 }}>Offline</button>
          <button onClick={() => setGameType("online")} style={{ padding: "10px 20px", borderRadius: 10, border: 0, cursor: "pointer", background: gameType === "online" ? "white" : "rgba(255,255,255,0.16)", color: gameType === "online" ? "#111827" : "white", fontWeight: 700 }}>Online</button>
        </div>

        <div style={{ marginTop: 22, fontWeight: 700 }}>Sınav Türü Seç:</div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 14 }}>
          <button onClick={() => { setExam("TYT"); setLesson(""); }} style={{ padding: "10px 20px", borderRadius: 10, border: 0, cursor: "pointer", background: exam === "TYT" ? "white" : "rgba(255,255,255,0.16)", color: exam === "TYT" ? "#111827" : "white", fontWeight: 700 }}>TYT</button>
          <button onClick={() => { setExam("AYT"); setLesson(""); }} style={{ padding: "10px 20px", borderRadius: 10, border: 0, cursor: "pointer", background: exam === "AYT" ? "white" : "rgba(255,255,255,0.16)", color: exam === "AYT" ? "#111827" : "white", fontWeight: 700 }}>AYT</button>
        </div>

        {exam && (
          <>
            <div style={{ marginTop: 22, fontWeight: 700 }}>Ders Seç:</div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginTop: 14 }}>
              {lessons.map((item) => (
                <button key={item} onClick={() => setLesson(item)} style={{ padding: "10px 16px", borderRadius: 10, border: 0, cursor: "pointer", background: lesson === item ? "white" : "rgba(255,255,255,0.16)", color: lesson === item ? "#111827" : "white", fontWeight: 700 }}>{item}</button>
              ))}
            </div>
          </>
        )}

        <button
          onClick={() => {
            if (gameType === "online") {
              setScreen("onlineLobby");
              return;
            }
            startOffline();
          }}
          style={{ marginTop: 28, padding: "12px 26px", borderRadius: 12, border: 0, cursor: "pointer", background: "white", color: "#111827", fontWeight: 800, fontSize: 16 }}
        >
          Oyuna Başla
        </button>
      </div>
    </div>
  );
}
