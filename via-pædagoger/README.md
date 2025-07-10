# VIA Pædagoger Forum

Et online forum for pædagogstuderende på VIA University College, hvor studerende kan dele erfaringer, stille spørgsmål og hjælpe hinanden gennem studiet.

## Features

- **Brugerregistrering og login** - Studerende kan oprette konti med deres studieoplysninger
- **Kategorier** - Organiserede emneområder for forskellige aspekter af pædagoguddannelsen
- **Tråde og diskussioner** - Opret og deltag i diskussioner
- **Kommentarsystem** - Hierarkisk kommentarsystem med svar på kommentarer
- **Voting system** - Upvote/downvote på tråde og kommentarer (Reddit-lignende)
- **Karma system** - Brugere optjener karma baseret på deres bidrag
- **Søgning og filtrering** - Find relevante diskussioner nemt
- **Responsive design** - Fungerer på alle enheder

## Installation

### Forudsætninger
- Node.js (v14 eller nyere)
- MongoDB (lokal installation eller MongoDB Atlas)
- npm eller yarn

### Opsætning

1. Klon repository:
```bash
git clone <repository-url>
cd via-pædagoger
```

2. Installer dependencies:
```bash
npm install
cd client && npm install
cd ..
```

3. Opret en `.env` fil i rod-mappen med:
```
MONGODB_URI=mongodb://localhost:27017/via-forum
JWT_SECRET=din-hemmelige-nøgle-her
PORT=5000
```

4. Start MongoDB (hvis du kører lokalt)

5. Kør applikationen:
```bash
npm run dev
```

Dette starter både backend (port 5000) og frontend (port 3000).

## Projektstruktur

```
via-pædagoger/
├── server/
│   ├── models/         # MongoDB modeller
│   ├── routes/         # API endpoints
│   ├── middleware/     # Authentication osv.
│   └── index.js        # Server entry point
├── client/
│   ├── src/
│   │   ├── components/ # React komponenter
│   │   ├── pages/      # Side komponenter
│   │   ├── contexts/   # React contexts
│   │   └── App.js      # Hoved app komponent
│   └── public/
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Opret ny bruger
- `POST /api/auth/login` - Log ind
- `GET /api/auth/me` - Hent nuværende bruger

### Threads
- `GET /api/threads` - Hent alle tråde
- `GET /api/threads/:id` - Hent specifik tråd
- `POST /api/threads` - Opret ny tråd
- `PUT /api/threads/:id` - Opdater tråd
- `DELETE /api/threads/:id` - Slet tråd

### Comments
- `GET /api/comments/thread/:threadId` - Hent kommentarer for tråd
- `POST /api/comments` - Opret ny kommentar
- `PUT /api/comments/:id` - Opdater kommentar
- `DELETE /api/comments/:id` - Slet kommentar

### Votes
- `POST /api/votes/thread/:id/:voteType` - Stem på tråd
- `POST /api/votes/comment/:id/:voteType` - Stem på kommentar

## Teknologier

### Backend
- Node.js & Express
- MongoDB & Mongoose
- JWT authentication
- bcrypt for password hashing

### Frontend
- React
- React Router
- Tailwind CSS
- Axios for API calls
- React Hot Toast for notifications
- Date-fns for date formatting

## Licens

Dette projekt er udviklet til VIA University College.