import { MongoClient } from "https://deno.land/x/mongo@v0.7.0/mod.ts";

const client = new MongoClient();
client.connectWithUri("mongodb://localhost:27017");
const db = client.database("th_db");
const users = db.collection("users");

export {
    db,
    users
}