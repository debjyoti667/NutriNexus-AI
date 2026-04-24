import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const modelName = "gemini-1.5-flash"; // Use flash for speed/cost in MVP

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // AI API Proxy Routes
  app.post("/api/ai/analyze", async (req, res) => {
    try {
      const { image } = req.body;
      const model = genAI.getGenerativeModel({ 
        model: modelName,
        generationConfig: { responseMimeType: "application/json" }
      });
      
      const prompt = "Analyze this meal. Provide a nutrition breakdown (calories, protein, carbs, fats), a health score (1-100), ingredient insights, warnings for unhealthy components, and healthier alternatives. Respond in JSON format.";
      
      const result = await model.generateContent([
        prompt,
        { inlineData: { data: image, mimeType: "image/jpeg" } }
      ]);
      
      res.json(JSON.parse(result.response.text()));
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/ai/recommend", async (req, res) => {
    try {
      const { userProfile, context } = req.body;
      const model = genAI.getGenerativeModel({ 
        model: modelName,
        generationConfig: { responseMimeType: "application/json" }
      });
      
      const prompt = `Based on the following user profile: ${JSON.stringify(userProfile)}. 
      Context: ${context}.
      Suggest 3 healthier meal options or snacks. Include food name, estimated cost (under ${userProfile.budgetLimit || 100}), preparation time, and why it's a good choice. Respond in JSON format.`;
      
      const result = await model.generateContent(prompt);
      res.json(JSON.parse(result.response.text()));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/ai/nudge", async (req, res) => {
    try {
      const { history } = req.body;
      const model = genAI.getGenerativeModel({ 
        model: modelName,
        generationConfig: { responseMimeType: "application/json" }
      });
      
      const prompt = `Review the following meal history and habits: ${JSON.stringify(history)}. 
      Identify 1-2 unhealthy patterns (e.g., meal skipping, late night high-calorie intake).
      Provide a friendly, proactive nudge and 2 quick healthy suggestions to counter this pattern.
      Respond in JSON format.`;
      
      const result = await model.generateContent(prompt);
      res.json(JSON.parse(result.response.text()));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
