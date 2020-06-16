const express = require("express");
const bodyParser = require("body-parser");
const graphqlHTTP = require("express-graphql");
const { buildSchema } = require("graphql");
const mongoose = require("mongoose");
const Event = require("./models/event");

const app = express();

const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.use ("/graphql", graphqlHTTP({
    schema: buildSchema(`
        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
        events: async () => {
            try {
                const events = await Event.find();
                
                return events.map((event) => {
                    console.log({...event._doc });
                    return { ...event._doc };
                });

            } catch (err) { throw err; };
        },
        createEvent: async (args) => {
            try {
                const event = new Event({
                    title: args.eventInput.title,
                    description: args.eventInput.description,
                    price: args.eventInput.price,
                    date: new Date(args.eventInput.date)
                });

                const result = await event.save();
                console.log(result);
                return { ...result._doc };

            } catch (err) {
                console.log(err);
                throw err;
            }

            // return; event;
        }
    },
    graphiql: true
}))

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-naofv.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority&useNewUrlParser=true&useUnifiedTopology=true`)
.then(() => app.listen(port, () => console.log("server is listening on port " + port)))
.catch((err) => console.log(err));
