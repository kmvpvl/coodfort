import { configDotenv } from "dotenv";
import express from "express";
import { createHandler } from "graphql-http/lib/use/express";
import { buildSchema } from "graphql";
import { Eatery, IEatery, Types } from "./model/eateries";
import { randomUUID } from "crypto";

configDotenv();

// Construct a schema, using GraphQL schema language
const schema = buildSchema(`
  type Query {
    hello(id: String!): String!
  }
`)
 
// The root provides a resolver function for each API endpoint
const root = {
  hello(req: {id: string}) {
    return `Hello world!${req.id}`
  },
}
 
const app = express()
app.use(express.json())
 
// Create and use the GraphQL handler.
app.post(
  "/graphql",
  createHandler({
    schema: schema,
    rootValue: root,
  })
)
 
// Start the server at port
app.listen(4000)
console.log("Running a GraphQL API server at http://localhost:4000/graphql")

/*const eatery: IEatery = {
  id: BigInt(1),
  name: "EATERY",
  employeeIds: [],
  tables: [],
  entertainmentIds: [],
  deliveryPartnerIds: [],
  blocked: false,
  created: new Date(),
  history: []
}

for (const [propName, propValue] of Object.entries(eatery)) {
  console.log(propName, typeof (propValue), Array.isArray(propValue));
}
*/
/*const e1 = new Eatery('81c03471-a582-11ef-ace0-0242ac130002');
setTimeout(async ()=>{
  await e1.load();
  console.log(e1.data);
});
*/
const e2 = new Eatery({
  name: "EATERY1",
  employeeIds: [],
  deliveryPartnerIds: [],
  tables: [
    {name: "OS1"},
    {name: "OS2"}
  ],
  entertainmentIds: [],
},);
setTimeout(async ()=>{
  await e2.save();
  console.log(e2.data);
  e2.data.cuisines = JSON.stringify({c:1});
  await e2.save();
});