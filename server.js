const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');
require('dotenv').config();

const app = express();
const port = 3000;
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

app.use(cors());
app.use(express.json());

app.post('/generate-workout', async (req, res) => {
    try {
        const { muscle, time, level, location } = req.body;

        const prompt = `
            You are an expert fitness coach. Generate a personalized workout plan.
            - **Primary Target:** ${muscle}
            - **Duration:** ${time}
            - **Fitness Level:** ${level}
            - **Location:** ${location}
            
            The workout should be structured clearly with a warm-up, a main workout, and a cool-down.
            Use markdown for bolding (e.g., **Warm-up**).
            For each exercise in the main workout, list the recommended sets and repetitions.

            ⚠️ IMPORTANT: After every exercise, ALWAYS add a line starting with EXACTLY:
            "Video Search: [exercise name]"  

            Example Format:
            **Warm-up:** ...

            Exercise 1: Push-ups – 3 sets of 10-12 reps  
            Video Search: push up

            **Cool-down:** ...
        `;

        console.log("Sending prompt to Groq:", prompt);

        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: "llama3-8b-8192",
        });

        const workoutText = chatCompletion.choices[0].message.content;
        res.json({ success: true, workout: workoutText });

    } catch (error) {
        console.error("Error generating workout:", error);
        res.status(500).json({ success: false, message: "Failed to generate workout." });
    }
});

app.listen(port, () => {
    console.log(`Server is listening on http://localhost:${port}`);
});
