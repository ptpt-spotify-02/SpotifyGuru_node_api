import mongoose from 'mongoose';

const StatsSchema = new mongoose.Schema({
  acousticness    : { type: Number, required: true },
  danceability    : { type: Number, required: true },
  energy          : { type: Number, required: true },
  instrumentalness: { type: Number, required: true },
  key             : { type: Number, required: true },
  liveness        : { type: Number, required: true },
  loudness        : { type: Number, required: true },
  mode            : { type: Number, required: true },
  speechiness     : { type: Number, required: true },
  tempo           : { type: Number, required: true },
  valence         : { type: Number, required: true }
}, {
  createIndexes: true,
  toJSON       : {
    transform: function (doc, ret) {
      delete ret._id;
    }
  }
});

const SongSchema = new mongoose.Schema({
  spotifyID     : { type: String, required: true, unique: true },
  title         : { type: String, required: true },
  author        : { type: String, required: true },
  album         : { type: String, required: true },
  year          : { type: String, required: true },
  albumImageLink: { type: String, required: true },
  audioLink     : { type: String, required: true },
  stats         : { type: StatsSchema, required: true }
}, {
  createIndexes: true,
  toJSON       : {
    transform: function (doc, ret) {
      delete ret._id;
      delete ret.__v;
    }
  }
});

export default mongoose.model('Song', SongSchema);
