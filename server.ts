import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import fs from "fs";

import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";
const PORT = 3000;

// Google Sheets Config
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID;
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

async function syncToGoogleSheets(data: any) {
  if (!SPREADSHEET_ID || !SERVICE_ACCOUNT_EMAIL || !PRIVATE_KEY) {
    console.log("Google Sheets config missing, skipping sync.");
    return;
  }

  try {
    const serviceAccountAuth = new JWT({
      email: SERVICE_ACCOUNT_EMAIL,
      key: PRIVATE_KEY,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0]; // Assumes first sheet
    await sheet.addRow(data);
    console.log("Synced to Google Sheets successfully.");
  } catch (err) {
    console.error("Error syncing to Google Sheets:", err);
  }
}

// Mock Database (in-memory for demo, would be Google Sheets in real use)
let participants = [
  { id: "1", nisn: "12345678", name: "Rizky Saputra", email: "rizky@example.com", class: "XII-A", field: "Skill Development", confirmed: true, qrCode: "12345678" },
  { id: "2", nisn: "87654321", name: "Budi Santoso", email: "budi@example.com", class: "XII-B", field: "Design", confirmed: false, qrCode: "87654321" }
];

let attendance = [];

const app = express();
app.use(express.json());

// --- API Routes ---

// Auth
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  
  // Allow any login for demo purposes, but default to admin
  if (email && password) {
    const token = jwt.sign({ email, role: "admin" }, JWT_SECRET, { expiresIn: "1d" });
    return res.json({ token, user: { email, role: "admin" } });
  }
  
  res.status(401).json({ message: "Email dan password wajib diisi" });
});

// Middleware to verify JWT
const authenticate = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Dashboard Stats
app.get("/api/stats", authenticate, (req, res) => {
  const today = new Date().toISOString().split("T")[0];
  const presentToday = attendance.filter(a => a.date === today).length;
  res.json({
    totalParticipants: participants.length,
    presentToday,
    attendanceRate: participants.length > 0 ? (presentToday / participants.length) * 100 : 0,
    recentAttendance: attendance.slice(-5)
  });
});

// Participants
app.get("/api/participants", authenticate, (req, res) => {
  res.json(participants);
});

app.post("/api/participants", authenticate, (req, res) => {
  const newParticipant = {
    id: Math.random().toString(36).substr(2, 9),
    ...req.body,
    confirmed: false,
    qrCode: req.body.nisn
  };
  participants.push(newParticipant);
  res.json(newParticipant);
});

app.patch("/api/participants/:id/confirm", authenticate, (req, res) => {
  const { id } = req.params;
  const index = participants.findIndex(p => p.id === id);
  if (index !== -1) {
    participants[index].confirmed = true;
    return res.json(participants[index]);
  }
  res.status(404).json({ message: "Peserta tidak ditemukan" });
});

// Attendance
app.post("/api/attendance/scan", authenticate, (req, res) => {
  const { qrCode } = req.body;
  const participant = participants.find(p => p.qrCode === qrCode);
  
  if (!participant) {
    return res.status(404).json({ message: "QR Code tidak valid" });
  }

  const today = new Date().toISOString().split("T")[0];
  const alreadyAttended = attendance.find(a => a.participantId === participant.id && a.date === today);

  if (alreadyAttended) {
    return res.status(400).json({ message: "Peserta sudah absen hari ini" });
  }

  const newAttendance = {
    id: Math.random().toString(36).substr(2, 9),
    participantId: participant.id,
    name: participant.name,
    nisn: participant.nisn,
    class: participant.class,
    field: participant.field,
    date: today,
    time: new Date().toLocaleTimeString()
  };

  attendance.push(newAttendance);
  
  // Sync to Google Sheets asynchronously
  syncToGoogleSheets({
    NISN: newAttendance.nisn,
    Nama: newAttendance.name,
    Kelas: newAttendance.class,
    Bidang: newAttendance.field,
    Waktu: `${newAttendance.date} ${newAttendance.time}`
  });

  res.json({ message: "Absensi berhasil", participant: newAttendance });
});

app.get("/api/attendance", authenticate, (req, res) => {
  res.json(attendance);
});

// --- Vite / Static Setup ---
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } else {
    // In production (Vercel), static files are handled by vercel.json rewrites
    // But we keep this for local production testing
    const distPath = path.join(process.cwd(), "dist");
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }
  }
}

setupServer();

export default app;
