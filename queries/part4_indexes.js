use("spotify");

// === Завдання 1. Аналіз запиту та індексація ===
print("=== Завдання 1.1: explain БЕЗ індексу ===");
db.tracks.dropIndexes();

const q1 = { track_genre: "pop", "audio_features.danceability": { $gte: 0.7 } };
const s1 = { popularity: -1 };

printjson(
  db.tracks.find(q1).sort(s1).explain("executionStats")
);

print("\n=== Завдання 1.2: створюємо індекс ===");
db.tracks.createIndex(
  { track_genre: 1, "audio_features.danceability": 1, popularity: -1 },
  { name: "idx_genre_dance_pop" }
);

print("\n=== Завдання 1.3: explain ПІСЛЯ створення індексу ===");
printjson(
  db.tracks.find(q1).sort(s1).explain("executionStats")
);

// === Завдання 2. Індекс для роботи (instrumentalness / speechiness / explicit) ===
print("\n=== Завдання 2. Індекс для інших полів ===");
db.tracks.createIndex(
  { explicit: 1, "audio_features.speechiness": 1, "audio_features.instrumentalness": 1 },
  { name: "idx_work_music" }
);

const q2 = {
  explicit: false,
  "audio_features.speechiness": { $lt: 0.1 },
  "audio_features.instrumentalness": { $gt: 0.5 }
};
printjson(
  db.tracks.find(q2).explain("executionStats")
);

// === Завдання 3. Перевірка покривного запиту ===
print("\n=== Завдання 3. Покривний запит ===");
const q3 = { track_genre: "pop", popularity: { $gte: 70 } };
printjson(
  db.tracks.find(q3, { _id: 0, track_genre: 1, popularity: 1 }).explain("executionStats")
);

print("\n=== Список індексів ===");
printjson(db.tracks.getIndexes());
