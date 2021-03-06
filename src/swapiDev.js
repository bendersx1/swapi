import axios from "axios";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import { CharacterModel } from "./models/character.js";

const birthYearSign = {
  BBY: -1,
  ABY: 1
};

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

const importCharacters = () => {
  console.log("- import data to database...");
  return connectDB()
    .then(() => CharacterModel.deleteMany({}))
    .then(() => getData())
    .then(() => mongoose.disconnect())
    .catch(err => console.log(err));
};

importCharacters()
  .then(result => {
    console.log("- import complete\n");
  })
  .catch(err => console.log(err));
