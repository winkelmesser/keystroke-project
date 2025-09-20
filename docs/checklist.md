# ✅ Keystroke Dynamics Lernprojekt – Checkliste

Diese Checkliste begleitet das Projekt Schritt für Schritt.  
Jede Phase kann abgehakt werden, wenn sie fertig ist.  

---

## Phase 0 – Setup
- [ ] Node.js LTS installiert (`node -v`)
- [ ] npm installiert (`npm -v`)
- [ ] Python 3.10+ installiert (`python --version`)
- [ ] Git installiert (`git --version`)
- [ ] VS Code installiert + Extensions (ESLint, Prettier, GitLens, Python)
- [ ] (Optional) Docker Desktop installiert
- [ ] Projektordner `keystroke-project` angelegt
- [ ] Git Repo initialisiert (`git init`)
- [ ] `.gitignore` angelegt
- [ ] README.md angelegt
- [ ] Erster Commit gemacht
- [ ] GitHub Repo erstellt
- [ ] Remote verbunden (`git remote -v`)
- [ ] Commit auf GitHub sichtbar
- [ ] Basis-Struktur angelegt: `frontend`, `backend`, `ml`, `infra`, `docs`

---

## Phase 1 – Frontend (React + Tailwind)
- [ ] React mit Vite eingerichtet
- [ ] Tailwind installiert und konfiguriert
- [ ] Consent-Dialog erstellt
- [ ] Textarea eingebaut
- [ ] Tipp-Events (keydown/keyup) loggen in Konsole

---

## Phase 2 – Backend (Express API)
- [ ] Express-Projekt eingerichtet
- [ ] Route `/collect` erstellt
- [ ] Events werden (zunächst in Memory) gespeichert
- [ ] Test mit Frontend erfolgreich

---

## Phase 3 – Datenbank (SQLite)
- [ ] SQLite eingebunden (`better-sqlite3`)
- [ ] Tabellen `sessions` & `events` erstellt
- [ ] `/collect` schreibt Events in DB
- [ ] `/sessions/:id` gibt Events zurück

---

## Phase 4 – Feature Engineering
- [ ] Feature-Funktion implementiert
- [ ] Route `/features/:id` gibt Features zurück

---

## Phase 5 – Machine Learning (Python)
- [ ] Python venv erstellt
- [ ] Pakete installiert (`pandas`, `scikit-learn`, `joblib`)
- [ ] `train.py` erstellt
- [ ] Modell trainiert (RandomForest)
- [ ] Modell gespeichert (`.joblib`)
- [ ] Klassifikationsreport geprüft

---

## Phase 6 – ML-Service
- [ ] Flask API erstellt
- [ ] Route `/predict` implementiert
- [ ] Backend ruft ML-Service erfolgreich auf

---

## Phase 7 – Git Workflow
- [ ] Branch-Strategie eingerichtet
- [ ] Feature-Branches genutzt
- [ ] PR-Workflow getestet

---

## Phase 8 – Tests & CI
- [ ] Linter eingerichtet (ESLint, Prettier)
- [ ] Jest/Vitest Tests für Frontend/Backend
- [ ] GitHub Actions Workflow erstellt
- [ ] CI läuft bei jedem PR

---

## Phase 9 – Docker
- [ ] Dockerfile für Backend
- [ ] Dockerfile für Frontend
- [ ] docker-compose eingerichtet
- [ ] Lokales Starten mit `docker-compose up` erfolgreich

---

## Phase 10 – Deployment
- [ ] Frontend auf Vercel/Netlify deployt
- [ ] Backend auf Render/Railway deployt
- [ ] PostgreSQL DB eingerichtet
- [ ] Umgebungsvariablen gesetzt
- [ ] CORS & HTTPS geprüft

---

## Phase 11 – UI & Visualisierung
- [ ] Recharts/Chart.js eingebaut
- [ ] Prediction mit Confidence angezeigt
- [ ] Animationen & UX verbessert

---

## Phase 12 – Dokumentation & Datenschutz
- [ ] README.md mit Setup & Deploy-Anleitung
- [ ] DSGVO-konformes Consent-Formular eingebunden
- [ ] Data-Retention Konzept umgesetzt
- [ ] Projekt fertig 🎉

