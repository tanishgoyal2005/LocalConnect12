require("dotenv").config();

// FIX FOR querySrv ECONNREFUSED: Force Google Public DNS
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const mongoose = require("mongoose");
const EventColRef = require("./models/ModelEventServices");

// ================= ALL EVENTS & SERVICES =================

const events = [
    {
        event: "Birthday",
        services: [
            "Decoration", "Photography", "Catering", "DJ & Sound",
            "Cake", "Lighting", "Invitation Cards", "Sweets", "Cleaning"
        ]
    },
    {
        event: "Wedding",
        services: [
            "Decoration", "Photography", "Catering", "DJ & Sound",
            "Mehndi Artist", "Bridal Makeup", "Wedding Planner",
            "Cake", "Tent House", "Lighting", "Invitation Cards",
            "Wedding Cake", "Sweets", "Bridal Wear", "Bhangra Group",
            "Cleaning"
        ]
    },
    {
        event: "Engagement",
        services: [
            "Decoration", "Photography", "Catering", "DJ & Sound",
            "Mehndi Artist", "Bridal Makeup", "Wedding Planner",
            "Tent House", "Lighting", "Invitation Cards", "Sweets",
            "Bridal Wear", "Bhangra Group"
        ]
    },
    {
        event: "Anniversary",
        services: [
            "Decoration", "Photography", "Catering", "Cake",
            "DJ & Sound", "Lighting", "Sweets"
        ]
    },
    {
        event: "Jagran",
        services: [
            "Decoration", "Tent House", "Lighting", "DJ & Sound",
            "Jagran Party", "Catering", "Sweets", "Photography",
            "Invitation Cards", "Cleaning"
        ]
    },
    {
        event: "Bhog",
        services: [
            "Catering", "Tent House", "Decoration", "Photography",
            "Sweets", "Invitation Cards", "Lighting", "Cleaning",
            "Pandit"
        ]
    },
    {
        event: "Sukhmani Sahib Path",
        services: [
            "Tent House", "Catering", "Decoration", "Photography",
            "Sweets", "Invitation Cards", "Lighting", "Cleaning"
        ]
    },
    {
        event: "Akhand Path Sahib",
        services: [
            "Tent House", "Catering", "Decoration", "Photography",
            "Sweets", "Invitation Cards", "Lighting", "Cleaning"
        ]
    },
    {
        event: "Housewarming",
        services: [
            "Decoration", "Catering", "Photography", "Tent House",
            "Lighting", "Sweets", "Pandit", "Cleaning"
        ]
    },
    {
        event: "Lohri",
        services: [
            "Decoration", "DJ & Sound", "Catering", "Photography",
            "Lighting", "Tent House", "Bhangra Group", "Sweets",
            "Cleaning"
        ]
    },
    {
        event: "Mata Ki Chowki",
        services: [
            "Decoration", "Tent House", "Lighting", "Catering",
            "Jagran Party", "Photography", "Sweets", "Cleaning"
        ]
    },
    {
        event: "Kirtan Darbar",
        services: [
            "Tent House", "Catering", "Decoration", "Lighting",
            "Photography", "Sweets", "Invitation Cards", "Cleaning"
        ]
    },
    {
        event: "Baby Shower",
        services: [
            "Decoration", "Photography", "Catering", "Cake",
            "Lighting", "Invitation Cards", "Sweets"
        ]
    },
    {
        event: "Retirement Party",
        services: [
            "Decoration", "Photography", "Catering", "DJ & Sound",
            "Cake", "Lighting", "Invitation Cards"
        ]
    },
    {
        event: "Corporate Event",
        services: [
            "Decoration", "Photography", "Catering", "DJ & Sound",
            "Tent House", "Lighting", "Invitation Cards", "Cleaning"
        ]
    },
    {
        event: "Griha Pravesh",
        services: [
            "Decoration", "Catering", "Photography", "Pandit",
            "Sweets", "Lighting", "Cleaning"
        ]
    },
    {
        event: "Bhangra Night",
        services: [
            "Decoration", "DJ & Sound", "Photography", "Catering",
            "Lighting", "Bhangra Group", "Tent House"
        ]
    },
    {
        event: "Farewell Party",
        services: [
            "Decoration", "Photography", "Catering", "DJ & Sound",
            "Cake", "Lighting", "Invitation Cards"
        ]
    }
];

// ================= INSERT / UPDATE EVENTS =================

async function insertEvents() {
    try {
        if (!process.env.ATLAS_URL) {
            throw new Error("ATLAS_URL is missing from your .env file");
        }

        console.log("Connecting to MongoDB Atlas...");
        await mongoose.connect(process.env.ATLAS_URL);
        console.log(" MongoDB Connected Successfully!");

        const operations = events.map((item) => ({
            updateOne: {
                filter: { event: item.event },
                update: { $set: { services: item.services } },
                upsert: true
            }
        }));

        const result = await EventColRef.bulkWrite(operations);

        console.log(" All events and services saved successfully!");
        console.log("Total events:", events.length);
        console.log("Matched:", result.matchedCount);
        console.log("Inserted:", result.upsertedCount);
        console.log("Updated:", result.modifiedCount);

    } catch (error) {
        console.error(" Error:", error.message);
    } finally {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
            console.log(" Disconnected cleanly.");
        }
    }
}

insertEvents();