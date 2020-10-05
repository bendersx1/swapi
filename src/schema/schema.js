import graphql, { GraphQLInt } from "graphql";
import mongoose from "mongoose";
import { connectDB } from "../../config/db.js";
import { CharacterModel } from "../models/character.js";

const {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLList
} = graphql;

const prepareData = ({ character, matches }) => {
  const preparedMatches = matches.map(matchedCharacter => {
    if (!matchedCharacter.birthYear) return matchedCharacter;
    matchedCharacter.birthYear =
      matchedCharacter.birthYear < 0
        ? Math.abs(matchedCharacter.birthYear) + "ABY"
        : Math.abs(matchedCharacter.birthYear) + "BBY";
    return matchedCharacter;
  });
  return { character, matches: preparedMatches };
};

const countPercentage = ({ character, matches }) => {
  const percentageMatches = matches.map(matchedCharacter => {
    matchedCharacter.percentage = 0;
    if (character.species[0] === matchedCharacter.species[0]) {
      matchedCharacter.percentage += 30;
    }
    if (character.eyeColor === matchedCharacter.eyeColor) {
      matchedCharacter.percentage += 20;
    }
    if (character.homePlanet === matchedCharacter.homePlanet) {
      matchedCharacter.percentage += 5;
    }
    if (
      matchedCharacter.birthYear >= character.birthYear - 100 &&
      matchedCharacter.birthYear <= character.birthYear + 100
    ) {
      matchedCharacter.percentage += 5;
    }
    if (
      matchedCharacter.height >= character.height - 100 &&
      matchedCharacter.height <= character.height + 100
    ) {
      matchedCharacter.percentage += 17;
    }
    if (
      matchedCharacter.weight >= character.weight - 100 &&
      matchedCharacter.weight <= character.weight + 100
    ) {
      matchedCharacter.percentage += 23;
    }

    return matchedCharacter;
  });
  return { character, matches: percentageMatches };
};

const getMatchedCharacters = character => {
  const {
    name,
    species,
    eyeColor,
    birthYear,
    homePlanet,
    height,
    weight
  } = character;
  const query = {
    name: { $ne: name },
    $or: [{ eyeColor }, { homePlanet }]
  };
  if (height) {
    query["$or"].push({
      height: {
        $gte: height - 100,
        $lte: height + 100
      }
    });
  }
  if (weight) {
    query["$or"].push({
      weight: {
        $gte: weight - 100,
        $lte: weight + 100
      }
    });
  }
  if (birthYear) {
    query["$or"].push({
      birthYear: {
        $gte: birthYear - 100,
        $lte: birthYear + 100
      }
    });
  }
  if (species.length > 0) {
    query["$or"].push({ species: species });
  }

  return CharacterModel.find(query)
    .lean()
    .then(matches => {
      return { character, matches };
    });
};

const CharacterType = new GraphQLObjectType({
  name: "Character",
  fields: () => ({
    name: { type: GraphQLString },
    eyeColor: { type: GraphQLString },
    species: { type: new GraphQLList(GraphQLString) },
    percentage: { type: GraphQLInt },
    birthYear: { type: GraphQLString },
    homePlanet: { type: GraphQLString },
    matches: { type: new GraphQLList(CharacterType) }
  })
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    character: {
      type: CharacterType,
      args: { name: { type: GraphQLString } },
      resolve(parentValue, args) {
        return connectDB()
          .then(() => CharacterModel.findOne({ name: args.name }))
          .then(getMatchedCharacters)
          .then(countPercentage)
          .then(prepareData)
          .then(({ character, matches }) => {
            const topMatches = matches
              .sort((a, b) => b.percentage - a.percentage)
              .slice(0, 5);
            return { name: character.name, matches: topMatches };
          });
      }
    }
  }
});

export const schema = new GraphQLSchema({
  query: RootQuery
});
