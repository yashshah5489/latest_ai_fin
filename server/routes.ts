import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import multer from "multer";
import path from "path";
import fs from "fs";
import { aiService } from "./services/aiService";
import { newsService } from "./services/newsService";
import { documentService } from "./services/documentService";
import { investmentService } from "./services/investmentService";
import { riskAnalysisService } from "./services/riskAnalysisService";

// Set up multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads");
// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage2 = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniquePrefix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage2,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and Excel files are allowed.') as any);
    }
  }
});

// Authentication middleware
const requireAuth = (req: any, res: any, next: any) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Dashboard route
  app.get("/api/dashboard", requireAuth, (req, res) => {
    const userId = req.user!.id;
    const dashboardData = storage.getDashboardData(userId);
    res.json(dashboardData);
  });

  // AI advisor routes
  app.get("/api/ai/insight", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const insight = await aiService.getInsight(userId);
      res.json(insight);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/ai/chat", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { message } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }
      
      const response = await aiService.chatWithAI(userId, message);
      await storage.saveChatMessage(userId, message, response);
      
      res.json({ response });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/ai/chat/history", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const history = await storage.getChatHistory(userId);
      res.json(history);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // News routes
  app.get("/api/news", requireAuth, async (req, res) => {
    try {
      const news = await newsService.getFinancialNews();
      res.json(news);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Documents routes
  app.get("/api/documents", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const documents = await storage.getDocuments(userId);
      res.json(documents);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/documents/upload", requireAuth, upload.single('document'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const userId = req.user!.id;
      const file = req.file;
      
      // Analyze document with AI
      const analysis = await documentService.analyzeDocument(file.path);
      
      // Save document info to storage
      const document = await storage.saveDocument(userId, {
        name: file.originalname,
        path: file.path,
        type: file.mimetype,
        size: file.size,
        analysis
      });
      
      res.status(201).json(document);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/documents/:id/analysis", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const documentId = parseInt(req.params.id);
      
      const analysis = await storage.getDocumentAnalysis(userId, documentId);
      
      if (!analysis) {
        return res.status(404).json({ message: "Document analysis not found" });
      }
      
      res.json(analysis);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Investment routes
  app.get("/api/investments", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const investments = await storage.getInvestments(userId);
      res.json(investments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/investments/summary", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const summary = await storage.getPortfolioSummary(userId);
      res.json(summary);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/investments/import", requireAuth, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const userId = req.user!.id;
      const file = req.file;
      
      // Process the imported data
      const importedData = await investmentService.importInvestmentData(file.path);
      
      // Save imported investments to storage
      await storage.saveImportedInvestments(userId, importedData);
      
      res.json({ 
        success: true, 
        message: "Investment data imported successfully", 
        count: importedData.length 
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Risk analysis routes
  app.post("/api/risk-analysis", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const riskProfileData = req.body;
      
      const analysisResult = await riskAnalysisService.analyzeRiskProfile(riskProfileData);
      
      // Save the analysis result
      await storage.saveRiskAnalysis(userId, {
        ...riskProfileData,
        result: analysisResult
      });
      
      res.json(analysisResult);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
