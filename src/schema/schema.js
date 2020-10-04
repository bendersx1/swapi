import graphql from "graphql";
import mongoose from "mongoose";
import { connectDB } from "../../config/db.js";
import { CharacterModel } from "../models/character.js";

const {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLList
} = graphql;

const CharacterType = new GraphQLObjectType({
  name: "Character",
  fields: () => ({
    // _id: {type: GraphQLString},
    name: { type: GraphQLString },
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
        return (
          connectDB()
            .then(() => CharacterModel.findOne({ name: args.name }))
            .then(character => {
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
                $or: [
                  { eyeColor },
                  { homePlanet },
                  {
                    birthYear: {
                      $gte: birthYear - 100,
                      $lte: birthYear + 100
                    }
                  },
                  {
                    height: { $gte: height - 100, $lte: height + 100 }
                  },
                  {
                    weight: { $gte: weight - 100, $lte: weight + 100 }
                  }
                ]
              };
              if (species.length > 0) {
                query["$or"].push({ species: species });
              }

              return CharacterModel.find(query).then(matches => {
                return { character, matches };
              });
            })
            // .then(({ character, matches }) => {
            //   // console.log(character);
            //   const percentageMatches = matches.map(matchedCharacter => {
            //     const percentage = Object.keys(matchedCharacter).reduce(
            //       (percentageAcc, field) => {
            //         console.log(character[field], matchedCharacter[field]);
            //         return 0;
            //         return character[field] === matchedCharacter[field]
            //           ? percentageAcc + 10
            //           : percentageAcc;
            //       }
            //     );
            //     // console.log(percentage);
            //     return { ...matchedCharacter, percentage };
            //   });

            //   return percentageMatches;
            // })
            .then(data => {
              console.log(data);
              return data;
            })
        );
        // .then(() => ({ name: 5 }));
        // return { name: 5 };
      }
    }
  }
});

export const schema = new GraphQLSchema({
  query: RootQuery
});
