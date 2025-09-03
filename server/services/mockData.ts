import { IUser } from "../models/User";
import { ISociety } from "../models/Society";
import { ITransaction } from "../models/Transaction";
import AuthUtils from "../utils/auth";

// Mock data for demo purposes
export class MockDataService {
  private static users: Array<Partial<IUser> & { _id: string }> = [];
  private static societies: Array<Partial<ISociety> & { _id: string }> = [];
  private static transactions: Array<Partial<ITransaction> & { _id: string }> =
    [];
  private static initialized = false;

  static async initialize() {
    if (this.initialized) return;

    // Create default societies
    const defaultSocieties = [
      {
        _id: "society1",
        name: "Green Valley Residents Association",
        address: {
          street: "123 Green Valley Road",
          city: "Mumbai",
          state: "Maharashtra",
          zipCode: "400001",
          country: "India",
        },
        registrationNumber: "REG001",
        contactInfo: {
          phone: "+91-9876543210",
          email: "contact@greenvalley.org",
          website: "www.greenvalley.org",
        },
        status: "active" as const,
        createdBy: "admin1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: "society2",
        name: "Sunrise Heights Society",
        address: {
          street: "456 Sunrise Avenue",
          city: "Delhi",
          state: "Delhi",
          zipCode: "110001",
          country: "India",
        },
        registrationNumber: "REG002",
        contactInfo: {
          phone: "+91-9876543211",
          email: "info@sunriseheights.org",
        },
        status: "active" as const,
        createdBy: "admin1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    this.societies.push(...defaultSocieties);

    // Create default users
    const adminPassword = await AuthUtils.hashPassword("admin123");
    const userPassword = await AuthUtils.hashPassword("user123");
    const agentPassword = await AuthUtils.hashPassword("agent123");

    const defaultUsers = [
      {
        _id: "admin1",
        name: "System Administrator",
        email: "admin@societyhub.com",
        password: adminPassword,
        role: "admin" as const,
        permissions: { canRead: true, canWrite: true },
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: "manager1",
        name: "John Manager",
        email: "manager@greenvalley.org",
        password: userPassword,
        role: "society_user" as const,
        societyId: "society1",
        permissions: { canRead: true, canWrite: true },
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: "treasurer1",
        name: "Sarah Treasurer",
        email: "treasurer@greenvalley.org",
        password: userPassword,
        role: "society_user" as const,
        societyId: "society1",
        permissions: { canRead: true, canWrite: false },
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: "agent1",
        name: "Processing Agent",
        email: "agent@societyhub.com",
        password: agentPassword,
        role: "agent" as const,
        societyId: "society1",
        permissions: { canRead: true, canWrite: true },
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: "manager2",
        name: "Mike Manager",
        email: "manager@sunriseheights.org",
        password: userPassword,
        role: "society_user" as const,
        societyId: "society2",
        permissions: { canRead: true, canWrite: true },
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    this.users.push(...defaultUsers);

    // Create sample transactions
    const sampleTransactions = [
      {
        _id: "txn1",
        vendorName: "ABC Maintenance Services",
        nature: "Building Maintenance",
        amount: 25000,
        status: "pending_on_agent" as const,
        remarks: [
          {
            text: "Initial submission for monthly maintenance work",
            author: "manager1",
            timestamp: new Date(),
            type: "info" as const,
          },
        ],
        attachments: [
          {
            fileName: "maintenance_invoice.pdf",
            filePath: "/uploads/maintenance_invoice.pdf",
            fileSize: 245678,
            mimeType: "application/pdf",
            uploadedBy: "manager1",
            uploadedAt: new Date(),
          },
        ],
        createdBy: "manager1",
        societyId: "society1",
        assignedToAgent: "agent1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: "txn2",
        vendorName: "XYZ Security Agency",
        nature: "Security Services",
        amount: 15000,
        status: "completed" as const,
        remarks: [
          {
            text: "Monthly security service payment",
            author: "manager1",
            timestamp: new Date(Date.now() - 86400000),
            type: "info" as const,
          },
          {
            text: "Approved and processed",
            author: "agent1",
            timestamp: new Date(),
            type: "approval" as const,
          },
        ],
        attachments: [],
        createdBy: "manager1",
        societyId: "society1",
        assignedToAgent: "agent1",
        createdAt: new Date(Date.now() - 86400000),
        updatedAt: new Date(),
        completedAt: new Date(),
      },
      {
        _id: "txn3",
        vendorName: "DEF Electrical Works",
        nature: "Electrical Repairs",
        amount: 8500,
        status: "pending_for_clarification" as const,
        remarks: [
          {
            text: "Emergency electrical repair in Block A",
            author: "manager1",
            timestamp: new Date(Date.now() - 172800000),
            type: "info" as const,
          },
          {
            text: "Need detailed breakdown of costs and work description",
            author: "agent1",
            timestamp: new Date(),
            type: "clarification" as const,
          },
        ],
        attachments: [],
        createdBy: "manager1",
        societyId: "society1",
        assignedToAgent: "agent1",
        createdAt: new Date(Date.now() - 172800000),
        updatedAt: new Date(),
      },
    ];

    this.transactions.push(...sampleTransactions);
    this.initialized = true;
  }

  // User operations
  static async findUserByEmail(email: string) {
    await this.initialize();
    return this.users.find((user) => user.email === email);
  }

  static async findUserById(id: string) {
    await this.initialize();
    const user = this.users.find((user) => user._id === id);
    if (user && user.societyId) {
      const society = this.societies.find((s) => s._id === user.societyId);
      return { ...user, societyId: society };
    }
    return user;
  }

  static async createUser(userData: Partial<IUser>) {
    await this.initialize();
    const newUser = {
      _id: `user_${Date.now()}`,
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.push(newUser);
    return newUser;
  }

  static async updateUser(id: string, updates: Partial<IUser>) {
    await this.initialize();
    const userIndex = this.users.findIndex((user) => user._id === id);
    if (userIndex !== -1) {
      this.users[userIndex] = {
        ...this.users[userIndex],
        ...updates,
        updatedAt: new Date(),
      };
      return this.users[userIndex];
    }
    return null;
  }

  // Society operations
  static async getAllSocieties() {
    await this.initialize();
    return this.societies;
  }

  static async findSocietyById(id: string) {
    await this.initialize();
    return this.societies.find((society) => society._id === id);
  }

  static async createSociety(societyData: Partial<ISociety>) {
    await this.initialize();
    const newSociety = {
      _id: `society_${Date.now()}`,
      ...societyData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.societies.push(newSociety);
    return newSociety;
  }

  // Transaction operations
  static async getTransactions(filters?: {
    societyId?: string;
    assignedToAgent?: string;
    status?: string;
    createdBy?: string;
  }) {
    await this.initialize();
    let transactions = [...this.transactions];

    if (filters) {
      if (filters.societyId) {
        transactions = transactions.filter(
          (t) => t.societyId === filters.societyId,
        );
      }
      if (filters.assignedToAgent) {
        transactions = transactions.filter(
          (t) => t.assignedToAgent === filters.assignedToAgent,
        );
      }
      if (filters.status) {
        transactions = transactions.filter((t) => t.status === filters.status);
      }
      if (filters.createdBy) {
        transactions = transactions.filter(
          (t) => t.createdBy === filters.createdBy,
        );
      }
    }

    return transactions.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  static async findTransactionById(id: string) {
    await this.initialize();
    return this.transactions.find((transaction) => transaction._id === id);
  }

  static async createTransaction(transactionData: Partial<ITransaction>) {
    await this.initialize();
    const newTransaction = {
      _id: `txn_${Date.now()}`,
      status: "pending_on_society" as const,
      remarks: [],
      attachments: [],
      ...transactionData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.transactions.push(newTransaction);
    return newTransaction;
  }

  static async updateTransaction(id: string, updates: Partial<ITransaction>) {
    await this.initialize();
    const transactionIndex = this.transactions.findIndex(
      (transaction) => transaction._id === id,
    );
    if (transactionIndex !== -1) {
      this.transactions[transactionIndex] = {
        ...this.transactions[transactionIndex],
        ...updates,
        updatedAt: new Date(),
      };

      // Set completion date if status is completed
      if (updates.status === "completed") {
        this.transactions[transactionIndex].completedAt = new Date();
      }

      return this.transactions[transactionIndex];
    }
    return null;
  }

  static async addRemarkToTransaction(
    transactionId: string,
    remark: {
      text: string;
      author: string;
      type: "info" | "clarification" | "approval" | "rejection";
    },
  ) {
    await this.initialize();
    const transaction = this.transactions.find((t) => t._id === transactionId);
    if (transaction) {
      if (!transaction.remarks) transaction.remarks = [];
      transaction.remarks.push({
        ...remark,
        timestamp: new Date(),
      });
      transaction.updatedAt = new Date();
      return transaction;
    }
    return null;
  }

  // Statistics
  static async getDashboardStats(
    userRole: string,
    userId: string,
    societyId?: string,
  ) {
    await this.initialize();

    if (userRole === "admin") {
      return {
        totalSocieties: this.societies.length,
        totalUsers: this.users.length,
        totalTransactions: this.transactions.length,
        pendingTransactions: this.transactions.filter(
          (t) => t.status !== "completed",
        ).length,
      };
    }

    if (userRole === "society_user" && societyId) {
      const societyTransactions = this.transactions.filter(
        (t) => t.societyId === societyId,
      );
      return {
        myTransactions: societyTransactions.filter(
          (t) => t.createdBy === userId,
        ).length,
        pendingTransactions: societyTransactions.filter(
          (t) => t.status !== "completed",
        ).length,
        completedTransactions: societyTransactions.filter(
          (t) => t.status === "completed",
        ).length,
        pendingClarifications: societyTransactions.filter(
          (t) => t.status === "pending_for_clarification",
        ).length,
      };
    }

    if (userRole === "agent") {
      const agentTransactions = this.transactions.filter(
        (t) => t.assignedToAgent === userId,
      );
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return {
        assignedTransactions: agentTransactions.length,
        pendingReview: agentTransactions.filter(
          (t) => t.status === "pending_on_agent",
        ).length,
        completedToday: agentTransactions.filter(
          (t) =>
            t.status === "completed" &&
            t.completedAt &&
            new Date(t.completedAt) >= today,
        ).length,
        avgProcessingTime: "2.3 days",
      };
    }

    return {};
  }
}

export default MockDataService;
