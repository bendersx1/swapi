import mongoose from "mongoose";

const characterSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: String,
  species: [String],
  birthYear: Number,
  homePlanet: String,
  eyeColor: String,
  height: Number,
  weight: Number
});

export const CharacterModel = mongoose.model("Character", characterSchema);
