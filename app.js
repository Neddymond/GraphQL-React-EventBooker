const express = require("express");
const bodyParser = require("body-parser");
const graphqlHTTP = require("express-graphql");
const { buildSchema } = require("graphql");
const mongoose = require("mongoose");
const Event = require("./models/event");
const User = require("./models/users");
const bcrypt = require("bcryptjs");

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

        type User {
            _id: ID!
            email: String!
            password: String
        }

        input UserInput {
            email: String!
            password: String!
        }

        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
            createUser(userInput: UserInput): User
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
                    date: new Date(args.eventInput.date),
                    creator: "5eea08fd71c65627e428ca92"
                });

                const result = await event.save();
                console.log(result);

                const existingUser = await User.findById("5eea08fd71c65627e428ca92");
                if(!existingUser) throw new Error("User not found");
                existingUser.createdEvents.push(event);
                await existingUser.save();

                return { ...result._doc };

            } catch (err) {
                console.log(err);
                throw err;
            } 
        },
        createUser: async (args) => {
            try {
                const existingUser = await User.findOne({ email: args.userInput.email });
                if(existingUser) throw new Error("User exists already");
                
                const hashedPassword = await bcrypt.hash(args.userInput.password, 12);

                const user = new User({
                    email: args.userInput.email,
                    password: hashedPassword
                });
    
                const result = await user.save();
                console.log(result);
                return { ...result._doc, password: null };

            } catch (err) { throw err; };
        }
    },
    graphiql: true
}))

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-naofv.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority&useNewUrlParser=true&useUnifiedTopology=true`)
.then(() => app.listen(port, () => console.log("server is listening on port " + port)))
.catch((err) => console.log(err));
