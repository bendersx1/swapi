import axios from "axios";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { CharacterModel } from "./models/character.js";

const birthYearSign = {
  BBY: -1,
  ABY: 1
};

// const characterSchema = new mongoose.Schema({
//   _id: mongoose.Schema.Types.ObjectId,
//   name: String,
//   species: [String],
//   birthYear: Number,
//   homePlanet: String,
//   eye_color: String,
//   height: Number,
//   mass: Number
// });

// const CharacterModel = mongoose.model("Character", characterSchema);

const prepareCharacterBeforeSave = character => {
  const {
    name,
    birth_year,
    homeworld,
    eye_color,
    height,
    mass,
    species
  } = character;
  const parsedBirthYear = /(?<count>[\d\.]+)(?<by>\w+)/.exec(birth_year);
  const birthYear = parsedBirthYear
    ? birthYearSign[parsedBirthYear.groups.by] * parsedBirthYear.groups.count
    : undefined;

  return {
    name,
    birthYear,
    homePlanet: homeworld,
    species,
    eyeColor: eye_color,
    height: height === "unknown" ? undefined : height,
    weight: mass === "unknown" ? undefined : mass.replace(",", ".")
  };
};

const getData = (uri = "http://swapi.dev/api/people/") => {
  if (!uri) return Promise.resolve("import complete");
  return axios.get(uri).then(res => {
    const characters = JSON.parse(JSON.stringify(res.data.results)).map(
      prepareCharacterBeforeSave
    );

    const savePromises = characters.map(character =>
      new CharacterModel({
        _id: new mongoose.Types.ObjectId(),
        ...character
      }).save()
    );

    return Promise.all([...savePromises, getData(res.data.next)]);
  });
};

export const importData = () => {
  return connectDB()
    .then(() => CharacterModel.deleteMany({}))
    .then(() => getData())
    .then(() => mongoose.disconnect())
    .catch(err => console.log(err));
};

importData()
  .then(result => {
    console.log("import complete");
  })
  .catch(err => console.log(err));
