# PDF to Live MCQ Exam Platform

PDF আপলোড করলেই অটো MCQ পার্স হয়ে Live Exam লিংক তৈরি হয়। শিক্ষার্থীরা নাম + মোবাইল দিয়ে জয়েন করে পরীক্ষা দিতে পারবে, টাইমার শেষে অটো সাবমিট হবে, এবং সাবমিট করার পর রেজাল্ট + লিডারবোর্ড দেখা যাবে।

## 📁 ফোল্ডার স্ট্রাকচার

```
pdf-mcq-platform/
├── backend/                 # Node.js + Express + MongoDB (Render এ deploy হবে)
│   ├── config/db.js
│   ├── models/               # Teacher, Exam, Student, Attempt
│   ├── middleware/auth.js    # JWT verify (শুধু Teacher এর জন্য)
│   ├── utils/pdfParser.js    # PDF থেকে MCQ parse করার লজিক
│   ├── utils/pdfGenerator.js # Leaderboard / Answer PDF বানানোর লজিক
│   ├── routes/                # auth, exam, upload, attempt, leaderboard
│   └── server.js
└── frontend/                # React + Vite + Tailwind (Vercel এ deploy হবে)
    └── src/
        ├── context/          # Auth ও Theme (dark mode) context
        ├── api/axios.js      # Backend এর সাথে কানেকশন
        ├── components/       # Timer, QuestionPalette, Navbar ইত্যাদি
        └── pages/
            ├── teacher/       # Login, Register, Dashboard, CreateExam, ExamDetails
            └── student/       # Join, ExamRoom, Result, PublicLeaderboard
```

## ⚙️ Backend সেটআপ (Local)

```bash
cd backend
npm install
cp .env.example .env   # তারপর .env এ নিজের MongoDB URI ও JWT secret বসাও
npm run dev
```

`.env` এ যা লাগবে:
```
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/mcq-platform
JWT_SECRET=your_super_secret_key
PORT=5000
CLIENT_URL=http://localhost:5173
```

## ⚙️ Frontend সেটআপ (Local)

```bash
cd frontend
npm install
cp .env.example .env   # VITE_API_URL বসাও, e.g. http://localhost:5000/api
npm run dev
```

## 📄 PDF এর ফরম্যাট (গুরুত্বপূর্ণ!)

PDF parser এই ফরম্যাট আশা করে (প্রতিটি প্রশ্নের প্যাটার্ন):

```
1. প্রশ্নের লেখা?
A. অপশন এক
B. অপশন দুই
C. অপশন তিন
D. অপশন চার
Answer: C
```

- প্রশ্ন নাম্বার `1.` `2.` ইত্যাদি দিয়ে শুরু হতে হবে।
- অপশন গুলো `A.` `B.` `C.` `D.` (বড় হাতের অক্ষর) দিয়ে শুরু হবে।
- উত্তর অবশ্যই `Answer: X` ফরম্যাটে থাকতে হবে (X = A/B/C/D)।
- `pdf-parse` দিয়ে টেক্সট বের করে regex দিয়ে ভাগ করা হয় — `utils/pdfParser.js` দেখো।

## 🚀 Deploy করার নিয়ম

### Backend → Render
1. GitHub এ `backend/` ফোল্ডার সহ রিপো পুশ করো।
2. Render এ "New Web Service" → রিপো কানেক্ট করো।
3. Build Command: `npm install`   |   Start Command: `npm start`
4. Environment Variables ট্যাবে `.env` এর ভ্যারিয়েবল গুলো বসাও (MONGO_URI, JWT_SECRET, CLIENT_URL)।
5. Deploy শেষে যে URL পাবে (e.g. `https://your-app.onrender.com`), সেটা frontend এর `VITE_API_URL` এ বসাবে।

### Frontend → Vercel
1. GitHub এ `frontend/` ফোল্ডার পুশ করো।
2. Vercel এ "New Project" → রিপো ইম্পোর্ট করো, Root Directory = `frontend`।
3. Environment Variable: `VITE_API_URL=https://your-app.onrender.com/api`
4. Deploy করো। Vercel অটো বিল্ড কমান্ড (`npm run build`) ধরে নেবে।

### MongoDB → MongoDB Atlas
Free cluster বানিয়ে Connection String নাও, Network Access এ `0.0.0.0/0` allow করো (Render থেকে কানেক্ট করার জন্য), সেই URI backend `.env` এ বসাও।

## 🔑 মূল ফিচার ম্যাপ

| ফিচার | কোথায় আছে |
|---|---|
| Teacher Register/Login (JWT) | `backend/routes/authRoutes.js`, `frontend/src/pages/teacher/Login.jsx` |
| PDF Upload → Auto Parse | `backend/routes/uploadRoutes.js` + `backend/utils/pdfParser.js` |
| Exam তৈরি + Shareable Link | `backend/routes/examRoutes.js`, `frontend/src/pages/teacher/CreateExam.jsx` |
| Student Join (নাম+মোবাইল) | `backend/routes/attemptRoutes.js`, `frontend/src/pages/student/Join.jsx` |
| Live Timer + Auto Submit | `frontend/src/components/Timer.jsx`, `frontend/src/pages/student/ExamRoom.jsx` |
| Answer Lock (submit আগে answer hidden) | Backend কখনোই সঠিক উত্তর পাঠায় না submit এর আগে |
| Anti-cheat (এক মোবাইল = এক Attempt) | `backend/models/Attempt.js` এ unique index (examId+mobile) |
| Leaderboard + PDF Download | `backend/routes/leaderboardRoutes.js`, `utils/pdfGenerator.js` |
| Dark Mode | `frontend/src/context/ThemeContext.jsx` |

## 🧪 Test flow

1. Teacher register/login করো।
2. Dashboard থেকে "Create Exam" → PDF আপলোড করো (উপরের ফরম্যাটে), নাম ও সময় (মিনিট) দাও।
3. তৈরি হওয়া Shareable Link কপি করে ছাত্রছাত্রীদের দাও।
4. ছাত্র লিংকে ঢুকে নাম+মোবাইল দিয়ে জয়েন করে পরীক্ষা দেয়, টাইমার শেষ হলে অটো সাবমিট হয়।
5. সাবমিট এর পর রেজাল্ট, Answer PDF ও Public Leaderboard দেখা যায়।
6. Teacher নিজের Dashboard থেকে Leaderboard PDF ডাউনলোড করতে পারে।
