use("spotify");

// Завдання 1. Треки для вечірки
print("=== Завдання 1. Треки для вечірки ===");
const party = db.tracks.find({
  "audio_features.danceability": { $gt: 0.7 },
  "audio_features.energy": { $gt: 0.7 },
  duration_ms: { $gte: 180000, $lte: 300000 }
}, {
  track_name: 1,
  artists: 1,
  popularity: 1,
  duration_sec: 1,
  "audio_features.danceability": 1,
  "audio_features.energy": 1
}).limit(10).toArray();
printjson(party);
print("Всього: " + db.tracks.countDocuments({
  "audio_features.danceability": { $gt: 0.7 },
  "audio_features.energy": { $gt: 0.7 },
  duration_ms: { $gte: 180000, $lte: 300000 }
}));

// Завдання 2. Виконавці, у яких усі треки популярні
print("\n=== Завдання 2. Виконавці, у яких усі треки популярні ===");
const popularArtists = db.tracks.aggregate([
  { $unwind: "$artists" },
  {
    $group: {
      _id: "$artists",
      track_count: { $sum: 1 },
      min_popularity: { $min: "$popularity" },
      avg_popularity: { $avg: "$popularity" }
    }
  },
  { $match: { track_count: { $gte: 3 }, min_popularity: { $gte: 60 } } },
  { $sort: { avg_popularity: -1 } },
  { $limit: 20 },
  {
    $project: {
      _id: 0,
      artist: "$_id",
      track_count: 1,
      min_popularity: 1,
      avg_popularity: { $round: ["$avg_popularity", 1] }
    }
  }
]).toArray();
printjson(popularArtists);

// Завдання 3. Нетипові треки за темпом
print("\n=== Завдання 3. Нетипові треки ===");
const outliers = db.tracks.aggregate([
  {
    $group: {
      _id: "$track_genre",
      avg_tempo: { $avg: "$audio_features.tempo" },
      std_tempo: { $stdDevPop: "$audio_features.tempo" },
      tracks: { $push: "$$ROOT" }
    }
  },
  {
    $addFields: {
      outlier_threshold: { $add: ["$avg_tempo", { $multiply: [2, "$std_tempo"] }] }
    }
  },
  {
    $addFields: {
      outlier_tracks: {
        $filter: {
          input: "$tracks",
          as: "t",
          cond: { $gt: ["$$t.audio_features.tempo", "$outlier_threshold"] }
        }
      }
    }
  },
  { $match: { "outlier_tracks.0": { $exists: true } } },
  {
    $project: {
      _id: 0,
      genre: "$_id",
      avg_tempo: { $round: ["$avg_tempo", 1] },
      outlier_threshold: { $round: ["$outlier_threshold", 1] },
      outlier_tracks: {
        $map: {
          input: "$outlier_tracks",
          as: "t",
          in: {
            _id: "$$t._id",
            track_name: "$$t.track_name",
            popularity: "$$t.popularity",
            artists: "$$t.artists",
            audio_features: { tempo: "$$t.audio_features.tempo" }
          }
        }
      }
    }
  },
  { $sort: { genre: 1 } },
  { $limit: 5 }
]).toArray();
printjson(outliers);

// Завдання 4. Треки для фонової роботи
print("\n=== Завдання 4. Треки для фонової роботи ===");
const work = db.tracks.find({
  "audio_features.loudness": { $lt: -10 },
  "audio_features.speechiness": { $lt: 0.1 },
  "audio_features.instrumentalness": { $gt: 0.5 },
  explicit: false
}, {
  track_name: 1,
  artists: 1,
  popularity: 1,
  "audio_features.loudness": 1,
  "audio_features.speechiness": 1,
  "audio_features.instrumentalness": 1
}).limit(10).toArray();
printjson(work);
print("Всього: " + db.tracks.countDocuments({
  "audio_features.loudness": { $lt: -10 },
  "audio_features.speechiness": { $lt: 0.1 },
  "audio_features.instrumentalness": { $gt: 0.5 },
  explicit: false
}));
