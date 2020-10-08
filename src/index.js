import express from "express";
import { graphqlHTTP } from "express-graphql";
import { schema } from "./schema/schema.js";
import config from "config";

const PORT = config.get("port");

var app = express();
app.use(
  "/api",
  graphqlHTTP({
    schema,
    // rootValue: root,
    graphiql: true
  })
);
app.listen(PORT, () =>
  console.log(`Server started at http://localhost:${PORT}/api`)
);
