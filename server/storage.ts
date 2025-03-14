import { users, type User, type InsertUser } from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";
import { v4 as uuidv4 } from 'uuid';

const MemoryStore = createMemoryStore(session);

// Types for dashboard data
interface DashboardData {
  totalBalance: number;
  balanceChange: number;
  totalInvestments: number;
  investmentsChange: number;
  monthlyExpenses: number;
  expensesChange: number;
  portfolioGrowth: number;
  growthChange: number;
}

// Types for chat
interface ChatMessage {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

// Types for documents
interface DocumentAnalysis {
  summary: string;
  insights: string[];
}

interface Document {
  id: number;
  name: string;
  path: string;
  type: string;
  size: number;
  uploadedAt: Date;
  analysisStatus: 'pending' | 'completed' | 'failed';
  analysis?: DocumentAnalysis;
}

interface SaveDocumentInput {
  name: string;
  path: string;
  type: string;
  size: number;
  analysis: DocumentAnalysis;
}

// Types for investments
interface Investment {
  id: string;
  name: string;
  type: string;
  value: number;
  allocation: number;
  return: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  icon: string;
}

interface PortfolioSummary {
  portfolioValue: number;
  valueChange: number;
  annualReturn: number;
  benchmarkDiff: number;
  dividendIncome: number;
  lastPaymentDate: string;
}

// Types for risk analysis
interface RiskProfileData {
  age: number;
  investmentHorizon: number;
  riskTolerance: number;
  emergencyFund: number;
  incomeStability: number;
}

interface RiskAnalysisResult {
  riskScore: number;
  riskCategory: string;
  assetAllocation: {
    equities: number;
    fixedIncome: number;
    gold: number;
    cash: number;
  };
  recommendations: string[];
}

interface RiskAnalysis extends RiskProfileData {
  result: RiskAnalysisResult;
  createdAt: Date;
}

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User>;
  updatePassword(id: number, hashedPassword: string): Promise<void>;
  
  // Dashboard methods
  getDashboardData(userId: number): DashboardData;
  
  // Chat methods
  saveChatMessage(userId: number, userMessage: string, aiResponse: string): Promise<void>;
  getChatHistory(userId: number): Promise<ChatMessage[]>;
  
  // Document methods
  saveDocument(userId: number, document: SaveDocumentInput): Promise<Document>;
  getDocuments(userId: number): Promise<Document[]>;
  getDocumentAnalysis(userId: number, documentId: number): Promise<DocumentAnalysis | undefined>;
  
  // Investment methods
  getInvestments(userId: number): Promise<Investment[]>;
  getPortfolioSummary(userId: number): Promise<PortfolioSummary>;
  saveImportedInvestments(userId: number, investments: Investment[]): Promise<void>;
  
  // Risk analysis methods
  saveRiskAnalysis(userId: number, analysis: RiskAnalysis): Promise<void>;
  getRiskAnalysis(userId: number): Promise<RiskAnalysis | undefined>;
  
  // Session store
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private dashboardData: Map<number, DashboardData>;
  private chatHistory: Map<number, ChatMessage[]>;
  private documents: Map<number, Document[]>;
  private investments: Map<number, Investment[]>;
  private portfolioSummaries: Map<number, PortfolioSummary>;
  private riskAnalyses: Map<number, RiskAnalysis>;
  private documentIdCounter: number;
  currentId: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.dashboardData = new Map();
    this.chatHistory = new Map();
    this.documents = new Map();
    this.investments = new Map();
    this.portfolioSummaries = new Map();
    this.riskAnalyses = new Map();
    this.currentId = 1;
    this.documentIdCounter = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
    
    // Create a demo user for development
    if (process.env.NODE_ENV === 'development') {
      this.createUser({
        username: 'demo@example.com',
        password: '$2b$10$demopasswordhash.saltsalt', // This is just a placeholder, will be overwritten
        fullName: 'Demo User'
      });
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    
    // Initialize data for the new user
    this.initializeUserData(id);
    
    return user;
  }
  
  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error('User not found');
    }
    
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    
    return updatedUser;
  }
  
  async updatePassword(id: number, hashedPassword: string): Promise<void> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error('User not found');
    }
    
    user.password = hashedPassword;
    this.users.set(id, user);
  }

  // Dashboard methods
  getDashboardData(userId: number): DashboardData {
    let data = this.dashboardData.get(userId);
    if (!data) {
      data = this.getDefaultDashboardData();
      this.dashboardData.set(userId, data);
    }
    return data;
  }

  // Chat methods
  async saveChatMessage(userId: number, userMessage: string, aiResponse: string): Promise<void> {
    let history = this.chatHistory.get(userId) || [];
    
    // Add user message
    history.push({
      id: uuidv4(),
      content: userMessage,
      role: "user",
      timestamp: new Date()
    });
    
    // Add AI response
    history.push({
      id: uuidv4(),
      content: aiResponse,
      role: "assistant",
      timestamp: new Date()
    });
    
    this.chatHistory.set(userId, history);
  }
  
  async getChatHistory(userId: number): Promise<ChatMessage[]> {
    return this.chatHistory.get(userId) || [];
  }

  // Document methods
  async saveDocument(userId: number, document: SaveDocumentInput): Promise<Document> {
    const userDocuments = this.documents.get(userId) || [];
    
    const newDocument: Document = {
      id: this.documentIdCounter++,
      ...document,
      uploadedAt: new Date(),
      analysisStatus: 'completed'
    };
    
    userDocuments.push(newDocument);
    this.documents.set(userId, userDocuments);
    
    return newDocument;
  }
  
  async getDocuments(userId: number): Promise<Document[]> {
    return this.documents.get(userId) || [];
  }
  
  async getDocumentAnalysis(userId: number, documentId: number): Promise<DocumentAnalysis | undefined> {
    const userDocuments = this.documents.get(userId) || [];
    const document = userDocuments.find(doc => doc.id === documentId);
    
    return document?.analysis;
  }

  // Investment methods
  async getInvestments(userId: number): Promise<Investment[]> {
    return this.investments.get(userId) || this.getDefaultInvestments();
  }
  
  async getPortfolioSummary(userId: number): Promise<PortfolioSummary> {
    return this.portfolioSummaries.get(userId) || this.getDefaultPortfolioSummary();
  }
  
  async saveImportedInvestments(userId: number, investments: Investment[]): Promise<void> {
    this.investments.set(userId, investments);
    
    // Update portfolio summary based on new investments
    const totalValue = investments.reduce((sum, inv) => sum + inv.value, 0);
    const summary = this.portfolioSummaries.get(userId) || this.getDefaultPortfolioSummary();
    
    summary.portfolioValue = totalValue;
    this.portfolioSummaries.set(userId, summary);
  }

  // Risk analysis methods
  async saveRiskAnalysis(userId: number, analysis: RiskAnalysis): Promise<void> {
    this.riskAnalyses.set(userId, {
      ...analysis,
      createdAt: new Date()
    });
  }
  
  async getRiskAnalysis(userId: number): Promise<RiskAnalysis | undefined> {
    return this.riskAnalyses.get(userId);
  }

  // Helper methods for default data
  private initializeUserData(userId: number): void {
    // Initialize dashboard data
    this.dashboardData.set(userId, this.getDefaultDashboardData());
    
    // Initialize chat history
    this.chatHistory.set(userId, []);
    
    // Initialize documents
    this.documents.set(userId, []);
    
    // Initialize investments
    this.investments.set(userId, this.getDefaultInvestments());
    
    // Initialize portfolio summary
    this.portfolioSummaries.set(userId, this.getDefaultPortfolioSummary());
  }

  private getDefaultDashboardData(): DashboardData {
    return {
      totalBalance: 24765.00,
      balanceChange: 3.2,
      totalInvestments: 12875.00,
      investmentsChange: 5.4,
      monthlyExpenses: 3450.00,
      expensesChange: 2.1,
      portfolioGrowth: 8.7,
      growthChange: 1.3
    };
  }

  private getDefaultInvestments(): Investment[] {
    return [
      {
        id: "inv1",
        name: "Nifty 50 ETF",
        type: "Equities",
        value: 5240.00,
        allocation: 40.7,
        return: 12.4,
        riskLevel: "Medium",
        icon: "description"
      },
      {
        id: "inv2",
        name: "Treasury Bonds",
        type: "Fixed Income",
        value: 3120.00,
        allocation: 24.2,
        return: -0.8,
        riskLevel: "Low",
        icon: "account_balance"
      },
      {
        id: "inv3",
        name: "International ETF",
        type: "Foreign Equities",
        value: 2650.00,
        allocation: 20.6,
        return: 9.2,
        riskLevel: "High",
        icon: "public"
      },
      {
        id: "inv4",
        name: "Gold ETF",
        type: "Commodities",
        value: 1865.00,
        allocation: 14.5,
        return: 4.7,
        riskLevel: "Medium",
        icon: "toll"
      }
    ];
  }

  private getDefaultPortfolioSummary(): PortfolioSummary {
    return {
      portfolioValue: 12875.00,
      valueChange: 1245.00,
      annualReturn: 14.2,
      benchmarkDiff: 2.3,
      dividendIncome: 450.00,
      lastPaymentDate: "2023-05-15"
    };
  }
}

export const storage = new MemStorage();
