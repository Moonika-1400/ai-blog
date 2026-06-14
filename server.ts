import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import app from "./src/server-app";

const PORT = 3000;

// Configure Vite or production static serving
async function configureServer() {
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
    console.log(`[AI Blog & CMS] Server fully loaded on host 0.0.0.0, running on port ${PORT}`);
  });
}

configureServer();
