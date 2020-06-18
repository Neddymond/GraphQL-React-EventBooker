const bcrypt = require("bcryptjs");
const Event = require("../../models/event")
const User = require("../../models/users");

const event = async (eventIds) => {
    try {
        const events = await Event.find({ _id: { $in: eventIds } });
        return events.map((event) => {
            return {
                ...event._doc ,
                date: new Date(event._doc.date).toISOString(),
                creator: user.bind(this, event.creator)
            };
        });

    } catch (err) { throw err; };
}

const user = async (userId) => {
    try {
        const user = await User.findById(userId);
        return {
            ...user._doc,
            date: new Date(event._doc.date).toISOString(),
            createdEvents: event.bind(this, user._doc.createdEvents)
        };
    } catch (err) { throw err; };
};

module.exports = {
    events: async () => {
        try {
            const events = await Event.find();
            
            return events.map((event) => {
                console.log({...event._doc });
                return {
                    ...event._doc,
                    date: new Date(event._doc.date).toISOString(),
                    creator: user.bind(this, event._doc.creator)
                };
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
                creator: "5eeba403267c9357d8c3697a"
            });

            const result = await event.save();
            // console.log(result);

            const existingUser = await User.findById("5eeba403267c9357d8c3697a");
            if(!existingUser) throw new Error("User not found");
            existingUser.createdEvents.push(event);
            await existingUser.save();

            return {
                ...result._doc,
                date: new Date(event._doc.date).toISOString(),
                creator: user.bind(this, result._doc.creator)
            };

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
            // console.log(result);
            return { ...result._doc, password: null };

        } catch (err) { throw err; };
    }
};