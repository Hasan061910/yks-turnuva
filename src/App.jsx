import React, { useEffect, useMemo, useState } from "react";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase, ref, set, get, onValue, update, off, remove } from "firebase/database";

  code: string;
  hostId: string;
  status: "lobby" | "playing" | "finished";
  exam: Exclude<Exam, "">;
  lesson: Exclude<Lesson, "">;
  questionIndex: number;
  players: Record<string, OnlinePlayer>;
  createdAt: number;
};

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
    !firebaseConfig.apiKey.startsWith("BURAYA_"),
);

const app = firebaseReady ? (getApps().length ? getApp() : initializeApp(firebaseConfig)) : null;
const db = app ? getDatabase(app) : null;

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    background: "linear-gradient(135deg, #2563eb 0%, #4338ca 55%, #4f46e5 100%)",
    color: "white",
    fontFamily: "Inter, system-ui, sans-serif",
  } as React.CSSProperties,
  pageGame: (danger: boolean): React.CSSProperties => ({
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    background: danger ? "linear-gradient(135deg, #b91c1c 0%, #7c2d12 100%)" : "linear-gradient(135deg, #4c1d95 0%, #312e81 100%)",
    color: "white",
    fontFamily: "Inter, system-ui, sans-serif",
  }),
  card: {
    width: "100%",
    maxWidth: 880,
    background: "rgba(255,255,255,0.10)",
    border: "1px solid rgba(255,255,255,0.20)",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    borderRadius: 28,
    boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
    padding: 24,
  } as React.CSSProperties,
  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.2)",
    outline: "none",
    background: "rgba(255,255,255,0.9)",
    color: "#111827",
    fontSize: 16,
  } as React.CSSProperties,
  button: (active = false, light = false): React.CSSProperties => ({
    border: "none",
    borderRadius: 14,
    padding: "12px 16px",
    cursor: "pointer",
    fontSize: 15,
    fontWeight: 700,
    background: light ? "white" : active ? "white" : "rgba(255,255,255,0.16)",
    color: light || active ? "#111827" : "white",
    boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
  }),
  ghostButton: {
    border: "none",
    borderRadius: 14,
    padding: "12px 16px",
    cursor: "pointer",
    fontSize: 15,
    fontWeight: 700,
    background: "rgba(255,255,255,0.16)",
    color: "white",
  } as React.CSSProperties,
  avatarCard: (active: boolean): React.CSSProperties => ({
    borderRadius: 18,
    border: active ? "1px solid rgba(255,255,255,0.9)" : "1px solid rgba(255,255,255,0.2)",
    background: active ? "rgba(255,255,255,0.20)" : "rgba(255,255,255,0.10)",
    padding: 14,
    color: "white",
    cursor: "pointer",
  }),
  option: (state: "idle" | "correct" | "wrong" | "muted"): React.CSSProperties => ({
    width: "100%",
    marginTop: 10,
    textAlign: "left",
    padding: "14px 16px",
    borderRadius: 14,
    border: "none",
    color: "white",
    cursor: "pointer",
    background:
      state === "correct"
        ? "#16a34a"
        : state === "wrong"
          ? "#dc2626"
          : state === "muted"
            ? "rgba(255,255,255,0.12)"
            : "rgba(255,255,255,0.18)",
    opacity: state === "muted" ? 0.75 : 1,
  }),
  progressWrap: {
    height: 10,
    width: "100%",
    background: "rgba(255,255,255,0.16)",
    borderRadius: 999,
    overflow: "hidden",
    marginTop: 16,
  } as React.CSSProperties,
  row: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    justifyContent: "center",
  } as React.CSSProperties,
};

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} style={styles.input} />;
}

function PrimaryButton({ children, style, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...props} style={{ ...styles.button(false, true), ...style }}>
      {children}
    </button>
  );
}

function SecondaryButton({ active, children, style, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button {...props} style={{ ...styles.button(Boolean(active), false), ...style }}>
      {children}
    </button>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div style={styles.progressWrap}>
      <div style={{ width: `${Math.max(0, Math.min(100, value))}%`, height: "100%", background: "white" }} />
    </div>
  );
}

const avatars: Avatar[] = [
  { name: "Yıldız Kaşif", emoji: "🧑‍🚀" },
  { name: "Neşeli Kaptan", emoji: "👦" },
  { name: "Mini Bilge", emoji: "👧" },
  { name: "Orman Kahramanı", emoji: "🦸" },
  { name: "Roket Çocuk", emoji: "🚀" },
  { name: "Gülücük Dâhi", emoji: "🤓" },
];

const questionBank: Record<Exclude<Lesson, "">, Question[]> = {
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
    { question: "3^2 kaçtır?", options: ["3", "6", "9", "12", "18"], answer: 2 },
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

const tytLessons: Exclude<Lesson, "">[] = ["Türkçe", "Matematik", "Fen", "Sosyal"];
const aytLessons: Exclude<Lesson, "">[] = ["Matematik", "Fizik", "Kimya", "Biyoloji", "Edebiyat"];

function shuffleQuestions<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function makeRoomCode(): string {
  return Math.random().toString(36).slice(2, 6).toUpperCase();
}

export default function TurkceTurnuva() {
  const correctSound = useMemo(() => (typeof Audio !== "undefined" ? new Audio("https://actions.google.com/sounds/v1/cartoon/pop.ogg") : null), []);
  const wrongSound = useMemo(() => (typeof Audio !== "undefined" ? new Audio("https://actions.google.com/sounds/v1/cartoon/cartoon_boing.ogg") : null), []);
  const startSound = useMemo(() => (typeof Audio !== "undefined" ? new Audio("https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg") : null), []);

  const [screen, setScreen] = useState<Screen>("menu");
  const [name, setName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar>(avatars[0]);
  const [exam, setExam] = useState<Exam>("");
  const [lesson, setLesson] = useState<Lesson>("");
  const [gameType, setGameType] = useState<GameType>("");
  const [roomCode, setRoomCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [onlinePlayers, setOnlinePlayers] = useState<OnlinePlayer[]>([]);
  const [roomError, setRoomError] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [playerId] = useState(() => `player-${Math.random().toString(36).slice(2, 10)}`);
  const [roomData, setRoomData] = useState<FirebaseRoom | null>(null);

  const [qIndex, setQIndex] = useState(0);
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(20);
  const [selected, setSelected] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [combo, setCombo] = useState(0);

  const lessons = useMemo(() => {
    if (exam === "TYT") return tytLessons;
    if (exam === "AYT") return aytLessons;
    return [] as Exclude<Lesson, "">[];
  }, [exam]);

  const questions = activeQuestions;
  const current = questions[qIndex];

  useEffect(() => {
    if (screen !== "game" || showAnswer || !current) return;
    const t = window.setTimeout(() => {
      setTime((p) => {
        if (p <= 1) {
          setShowAnswer(true);
          return 0;
        }
        return p - 1;
      });
    }, 1000);
    return () => window.clearTimeout(t);
  }, [screen, showAnswer, time, current]);

  useEffect(() => {
    if (!db || !roomCode || gameType !== "online") return;
    const roomRef = ref(db, `rooms/${roomCode}`);
    const listener = onValue(roomRef, (snapshot) => {
      const value = snapshot.val() as FirebaseRoom | null;
      setRoomData(value);
      if (!value) return;

      const players = Object.values(value.players || {});
      setOnlinePlayers(players);
      setExam(value.exam);
      setLesson(value.lesson);
      setQIndex(value.questionIndex ?? 0);
      setActiveQuestions((questionBank[value.lesson] ?? []).slice(0, 10));

      const me = players.find((p) => p.id === playerId);
      setScore(me?.score ?? 0);

      if (value.status === "playing") setScreen("game");
      else if (value.status === "finished") setScreen("result");
      else setScreen("onlineLobby");
    });

    return () => {
      off(roomRef, "value", listener);
    };
  }, [roomCode, gameType, playerId]);

  const playSound = (sound: HTMLAudioElement | null) => {
    if (!sound) return;
    sound.currentTime = 0;
    void sound.play().catch(() => {});
  };

  const createOnlineRoom = async () => {
    if (!firebaseReady || !db) {
      alert("Önce Firebase config bilgilerini doldurman gerekiyor.");
      return;
    }
    if (!name.trim() || !exam || !lesson) {
      alert("Online oda kurmak için isim, sınav türü ve ders seçmelisin.");
      return;
    }

    const code = makeRoomCode();
    const room: FirebaseRoom = {
      code,
      hostId: playerId,
      status: "lobby",
      exam: exam as Exclude<Exam, "">,
      lesson: lesson as Exclude<Lesson, "">,
      questionIndex: 0,
      createdAt: Date.now(),
      players: {
        [playerId]: {
          id: playerId,
          name,
          avatar: selectedAvatar.emoji,
          score: 0,
          answered: false,
          selected: null,
        },
      },
    };

    await set(ref(db, `rooms/${code}`), room);
    setRoomCode(code);
    setJoinCode(code);
    setGameType("online");
    setIsHost(true);
    setRoomError("");
    setScreen("onlineLobby");
  };

  const joinOnlineRoom = async () => {
    if (!firebaseReady || !db) {
      alert("Önce Firebase config bilgilerini doldurman gerekiyor.");
      return;
    }
    const code = joinCode.trim().toUpperCase();
    if (!name.trim() || !code) {
      setRoomError("İsim yaz ve oda kodu gir.");
      return;
    }

    const roomRef = ref(db, `rooms/${code}`);
    const snap = await get(roomRef);
    if (!snap.exists()) {
      setRoomError("Oda bulunamadı.");
      return;
    }

    const room = snap.val() as FirebaseRoom;
    const playerCount = Object.keys(room.players || {}).length;
    if (playerCount >= 4) {
      setRoomError("Oda dolu.");
      return;
    }

    await update(roomRef, {
      [`players/${playerId}`]: {
        id: playerId,
        name,
        avatar: selectedAvatar.emoji,
        score: 0,
        answered: false,
        selected: null,
      },
    });

    setRoomCode(code);
    setGameType("online");
    setIsHost(room.hostId === playerId);
    setRoomError("");
    setScreen("onlineLobby");
  };

  const startFirebaseMatch = async () => {
    if (!db || !roomCode || !roomData || roomData.hostId !== playerId) return;
    await update(ref(db, `rooms/${roomCode}`), { status: "playing", questionIndex: 0 });
  };

  const handleStart = () => {
    playSound(startSound);
    if (!name.trim() || !exam || !lesson || !gameType) {
      alert("İsim, mod, sınav türü ve ders seçmelisin.");
      return;
    }

    const pool = questionBank[lesson as Exclude<Lesson, "">] ?? [];
    setActiveQuestions(shuffleQuestions(pool).slice(0, 10));
    setQIndex(0);
    setScore(0);
    setCombo(0);
    setSelected(null);
    setShowAnswer(false);
    setTime(20);

    if (gameType === "online") {
      setScreen("onlineLobby");
      return;
    }

    setScreen("game");
  };

  const answer = async (i: number) => {
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
      const currentScore = roomData?.players?.[playerId]?.score ?? score;
      await update(ref(db, `rooms/${roomCode}/players/${playerId}`), {
        score: isCorrect ? currentScore + 10 : currentScore,
        answered: true,
        selected: i,
      });
    }
  };

  const next = async () => {
    if (qIndex < questions.length - 1) {
      setQIndex((i) => i + 1);
      setSelected(null);
      setShowAnswer(false);
      setTime(20);

      if (gameType === "online" && db && roomCode && roomData?.hostId === playerId) {
        const payload: Record<string, unknown> = { questionIndex: qIndex + 1 };
        Object.keys(roomData.players || {}).forEach((id) => {
          payload[`players/${id}/answered`] = false;
          payload[`players/${id}/selected`] = null;
        });
        await update(ref(db, `rooms/${roomCode}`), payload);
      }
      return;
    }

    if (gameType === "online" && db && roomCode && roomData?.hostId === playerId) {
      await update(ref(db, `rooms/${roomCode}`), { status: "finished" });
      return;
    }

    setScreen("result");
  };

  const leaveRoom = async () => {
    if (db && roomCode && gameType === "online") {
      if (isHost) await remove(ref(db, `rooms/${roomCode}`));
      else await remove(ref(db, `rooms/${roomCode}/players/${playerId}`));
    }
    setRoomCode("");
    setJoinCode("");
    setRoomData(null);
    setOnlinePlayers([]);
    setScreen("menu");
  };

  const getOptionStyle = (i: number): "idle" | "correct" | "wrong" | "muted" => {
    if (!showAnswer) return "idle";
    if (!current) return "muted";
    if (i === current.answer) return "correct";
    if (i === selected && i !== current.answer) return "wrong";
    return "muted";
  };

  console.assert(avatars.length >= 3, "En az 3 avatar olmalı.");
  console.assert(tytLessons.length === 4, "TYT dersleri 4 adet olmalı.");
  console.assert(aytLessons.length === 5, "AYT dersleri 5 adet olmalı.");
  console.assert(Object.values(questionBank).every((arr) => arr.length >= 10), "Her ders için en az 10 soru olmalı.");
  console.assert(Object.values(questionBank).every((arr) => arr.every((q) => q.options.length === 5)), "Tüm sorular 5 şıklı olmalı.");

  if (screen === "result") {
    const finalScore = gameType === "online" ? onlinePlayers.find((p) => p.id === playerId)?.score ?? score : score;
    const ranking = gameType === "online" ? [...onlinePlayers].sort((a, b) => b.score - a.score) : [];
    return (
      <div style={styles.page}>
        <div style={{ ...styles.card, maxWidth: 700, textAlign: "center" }}>
          <h2 style={{ fontSize: 32, marginBottom: 16 }}>🏆 Oyun Bitti</h2>
          <p style={{ fontSize: 22, marginBottom: 8 }}>{name}</p>
          <p style={{ fontSize: 42, fontWeight: 800, marginBottom: 20 }}>Skor: {finalScore}</p>
          {gameType === "online" && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontWeight: 700, marginBottom: 10 }}>Sıralama</p>
              {ranking.map((p, i) => (
                <div
                  key={p.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    borderRadius: 14,
                    marginBottom: 8,
                    background: p.id === playerId ? "#facc15" : "rgba(255,255,255,0.12)",
                    color: p.id === playerId ? "#111827" : "white",
                  }}
                >
                  <span>#{i + 1} {p.name}</span>
                  <span>{p.score}</span>
                </div>
              ))}
            </div>
          )}
          <div style={{ ...styles.row, marginTop: 16 }}>
            <PrimaryButton onClick={() => setScreen("menu")}>Ana Menü</PrimaryButton>
            <SecondaryButton onClick={handleStart}>Tekrar Oyna</SecondaryButton>
          </div>
        </div>
      </div>
    );
  }

  if (screen === "onlineLobby") {
    return (
      <div style={styles.page}>
        <div style={{ ...styles.card, maxWidth: 760, textAlign: "center" }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>🌐 Online Oda</h2>
          {!firebaseReady && (
            <div style={{ marginBottom: 16, borderRadius: 16, padding: 12, background: "rgba(250,204,21,0.22)" }}>
              Firebase config alanlarını doldurmadan gerçek online çalışmaz.
            </div>
          )}
          <p style={{ marginBottom: 16 }}>Oda Kodu: <span style={{ fontWeight: 800, letterSpacing: 4 }}>{roomCode || "----"}</span></p>
          <div style={{ maxWidth: 280, margin: "0 auto 16px auto" }}>
            <TextInput placeholder="Odaya katıl kodu" value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} />
          </div>
          {!roomCode && (
            <div style={{ ...styles.row, marginBottom: 16 }}>
              <PrimaryButton onClick={createOnlineRoom}>Oda Kur</PrimaryButton>
              <SecondaryButton onClick={joinOnlineRoom}>Odaya Katıl</SecondaryButton>
            </div>
          )}
          {roomError && <p style={{ marginBottom: 12, color: "#fecaca" }}>{roomError}</p>}
          <div style={{ display: "grid", gap: 10, marginBottom: 20 }}>
            {onlinePlayers.map((p) => (
              <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderRadius: 16, background: "rgba(255,255,255,0.12)", padding: "12px 16px" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ fontSize: 28 }}>{p.avatar}</span>
                  <span>{p.name}{p.id === playerId ? " (Sen)" : ""}</span>
                </div>
                <span>{p.score}</span>
              </div>
            ))}
          </div>
          <div style={styles.row}>
            <PrimaryButton onClick={startFirebaseMatch} disabled={!isHost || onlinePlayers.length < 2}>Maçı Başlat</PrimaryButton>
            <SecondaryButton onClick={leaveRoom}>Geri</SecondaryButton>
          </div>
          <p style={{ marginTop: 12, fontSize: 12, opacity: 0.7 }}>Maçı başlatmak için oda sahibinin ve en az 2 oyuncunun olması gerekir.</p>
        </div>
      </div>
    );
  }

  if (screen === "game" && current) {
    const myOnlineScore = onlinePlayers.find((p) => p.id === playerId)?.score ?? score;
    return (
      <div style={styles.pageGame(time <= 5)}>
        <div style={{ width: "100%", maxWidth: 760, padding: 16 }}>
          <div style={{ ...styles.card, padding: 20 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16, background: "rgba(255,255,255,0.10)", padding: 14, borderRadius: 18 }}>
              <div style={{ fontSize: 30 }}>{selectedAvatar.emoji}</div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700 }}>{name}</div>
                <div style={{ opacity: 0.8 }}>{exam} • {lesson}</div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ display: "flex", gap: 18 }}>
                <p>🏆 Skor: {gameType === "online" ? myOnlineScore : score}</p>
                <p>🔥 Combo: {combo}</p>
              </div>
              <p>Soru {qIndex + 1} / {questions.length}</p>
            </div>

            <p style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>{current.question}</p>
            {current.options.map((opt, i) => (
              <button key={i} onClick={() => answer(i)} style={styles.option(getOptionStyle(i))}>
                {opt}
              </button>
            ))}

            <div style={{ marginTop: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <p>⏱ {time}</p>
                <p>Skor: {gameType === "online" ? myOnlineScore : score}</p>
              </div>

              {gameType === "online" && (
                <div style={{ borderRadius: 14, background: "rgba(255,255,255,0.10)", padding: 12, fontSize: 14 }}>
                  <p style={{ fontWeight: 700, marginBottom: 8 }}>Canlı Sıralama</p>
                  {[...onlinePlayers].sort((a, b) => b.score - a.score).map((p, i) => (
                    <div key={p.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span>#{i + 1} {p.name}</span>
                      <span>{p.score}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {showAnswer && (
              <div style={{ marginTop: 16 }}>
                <PrimaryButton onClick={next}>{qIndex < questions.length - 1 ? "Sonraki" : "Bitir"}</PrimaryButton>
              </div>
            )}

            <ProgressBar value={(time / 20) * 100} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={{ fontSize: 48, fontWeight: 800, marginBottom: 8, textAlign: "center" }}>🎮 YKS TURNUVA</h1>
        <p style={{ textAlign: "center", opacity: 0.9, marginBottom: 10 }}>Bilgiyle zirveye çık!</p>
        <p style={{ textAlign: "center", opacity: 0.7, marginBottom: 24 }}>İsmini yaz, avatarını seç, alanını ve dersini belirle, sonra yarışmaya başla.</p>

        <div style={{ marginBottom: 24 }}>
          <TextInput placeholder="İsmini yaz" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <p style={{ fontWeight: 700, marginBottom: 12, textAlign: "center" }}>Profil Karakteri Seç:</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 24 }}>
          {avatars.map((a) => {
            const active = selectedAvatar.name === a.name;
            return (
              <button key={a.name} onClick={() => setSelectedAvatar(a)} style={styles.avatarCard(active)}>
                <div style={{ fontSize: 34, marginBottom: 8 }}>{a.emoji}</div>
                <div>{a.name}</div>
              </button>
            );
          })}
        </div>

        <p style={{ fontWeight: 700, marginBottom: 12, textAlign: "center" }}>Oyun Modu:</p>
        <div style={{ ...styles.row, marginBottom: 24 }}>
          <SecondaryButton active={gameType === "offline"} onClick={() => setGameType("offline")}>Offline</SecondaryButton>
          <SecondaryButton active={gameType === "online"} onClick={() => setGameType("online")}>Online</SecondaryButton>
        </div>

        <p style={{ fontWeight: 700, marginBottom: 12, textAlign: "center" }}>Sınav Türü Seç:</p>
        <div style={{ ...styles.row, marginBottom: 24 }}>
          <SecondaryButton active={exam === "TYT"} onClick={() => { setExam("TYT"); setLesson(""); }}>TYT</SecondaryButton>
          <SecondaryButton active={exam === "AYT"} onClick={() => { setExam("AYT"); setLesson(""); }}>AYT</SecondaryButton>
        </div>

        {exam && (
          <>
            <p style={{ fontWeight: 700, marginBottom: 12, textAlign: "center" }}>Ders Seç:</p>
            <div style={{ ...styles.row, marginBottom: 24 }}>
              {lessons.map((l) => (
                <SecondaryButton key={l} active={lesson === l} onClick={() => setLesson(l)}>{l}</SecondaryButton>
              ))}
            </div>
          </>
        )}

        {gameType === "online" && <p style={{ marginBottom: 16, fontSize: 12, opacity: 0.7, textAlign: "center" }}>Firebase bilgileri hazır. Online oda ekranında oda kurabilir veya koda katılabilirsin.</p>}

        <div style={{ display: "flex", justifyContent: "center" }}>
          <PrimaryButton onClick={handleStart}>Oyuna Başla</PrimaryButton>
        </div>
      </div>
    </div>
  );
}
