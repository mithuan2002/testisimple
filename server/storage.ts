import { 
  users, type User, type InsertUser,
  admins, type Admin, type InsertAdmin,
  contacts, type Contact, type InsertContact,
  campaigns, type Campaign, type InsertCampaign,
  submissions, type Submission, type InsertSubmission,
  activities, type Activity, type InsertActivity
} from "@shared/schema";

// Storage interface
export interface IStorage {
  // Admin methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Admin methods
  getAdmin(id: number): Promise<Admin | undefined>;
  getAdminByUsername(username: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
  
  // Contact methods
  getContact(id: number): Promise<Contact | undefined>;
  getAllContacts(): Promise<Contact[]>;
  createContact(contact: InsertContact): Promise<Contact>;
  updateContact(id: number, contact: Partial<InsertContact>): Promise<Contact>;
  deleteContact(id: number): Promise<void>;
  
  // Campaign methods
  getCampaign(id: number): Promise<Campaign | undefined>;
  getAllCampaigns(): Promise<Campaign[]>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: number, campaign: Partial<InsertCampaign>): Promise<Campaign>;
  deleteCampaign(id: number): Promise<void>;
  
  // Submission methods
  getSubmission(id: number): Promise<Submission | undefined>;
  getAllSubmissions(): Promise<Submission[]>;
  getSubmissionsByCampaign(campaignId: number): Promise<Submission[]>;
  createSubmission(submission: InsertSubmission): Promise<Submission>;
  
  // Activity methods
  getActivity(id: number): Promise<Activity | undefined>;
  getAllActivities(): Promise<Activity[]>;
  getRecentActivities(limit: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private admins: Map<number, Admin>;
  private contacts: Map<number, Contact>;
  private campaigns: Map<number, Campaign>;
  private submissions: Map<number, Submission>;
  private activities: Map<number, Activity>;
  
  private userId: number;
  private adminId: number;
  private contactId: number;
  private campaignId: number;
  private submissionId: number;
  private activityId: number;

  constructor() {
    this.users = new Map();
    this.admins = new Map();
    this.contacts = new Map();
    this.campaigns = new Map();
    this.submissions = new Map();
    this.activities = new Map();
    
    this.userId = 1;
    this.adminId = 1;
    this.contactId = 1;
    this.campaignId = 1;
    this.submissionId = 1;
    this.activityId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Admin methods
  async getAdmin(id: number): Promise<Admin | undefined> {
    return this.admins.get(id);
  }

  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    return Array.from(this.admins.values()).find(
      (admin) => admin.username === username
    );
  }

  async createAdmin(insertAdmin: InsertAdmin): Promise<Admin> {
    const id = this.adminId++;
    const admin: Admin = { ...insertAdmin, id };
    this.admins.set(id, admin);
    return admin;
  }
  
  // Contact methods
  async getContact(id: number): Promise<Contact | undefined> {
    return this.contacts.get(id);
  }
  
  async getAllContacts(): Promise<Contact[]> {
    return Array.from(this.contacts.values());
  }
  
  async createContact(insertContact: InsertContact): Promise<Contact> {
    const id = this.contactId++;
    const contact: Contact = { ...insertContact, id };
    this.contacts.set(id, contact);
    return contact;
  }
  
  async updateContact(id: number, contactUpdate: Partial<InsertContact>): Promise<Contact> {
    const contact = this.contacts.get(id);
    if (!contact) {
      throw new Error(`Contact with id ${id} not found`);
    }
    
    const updatedContact = { ...contact, ...contactUpdate };
    this.contacts.set(id, updatedContact);
    return updatedContact;
  }
  
  async deleteContact(id: number): Promise<void> {
    this.contacts.delete(id);
  }
  
  // Campaign methods
  async getCampaign(id: number): Promise<Campaign | undefined> {
    return this.campaigns.get(id);
  }
  
  async getAllCampaigns(): Promise<Campaign[]> {
    return Array.from(this.campaigns.values());
  }
  
  async createCampaign(insertCampaign: InsertCampaign): Promise<Campaign> {
    const id = this.campaignId++;
    const campaign: Campaign = { ...insertCampaign, id };
    this.campaigns.set(id, campaign);
    return campaign;
  }
  
  async updateCampaign(id: number, campaignUpdate: Partial<InsertCampaign>): Promise<Campaign> {
    const campaign = this.campaigns.get(id);
    if (!campaign) {
      throw new Error(`Campaign with id ${id} not found`);
    }
    
    const updatedCampaign = { ...campaign, ...campaignUpdate };
    this.campaigns.set(id, updatedCampaign);
    return updatedCampaign;
  }
  
  async deleteCampaign(id: number): Promise<void> {
    this.campaigns.delete(id);
  }
  
  // Submission methods
  async getSubmission(id: number): Promise<Submission | undefined> {
    return this.submissions.get(id);
  }
  
  async getAllSubmissions(): Promise<Submission[]> {
    return Array.from(this.submissions.values());
  }
  
  async getSubmissionsByCampaign(campaignId: number): Promise<Submission[]> {
    return Array.from(this.submissions.values()).filter(
      (submission) => submission.campaignId === campaignId
    );
  }
  
  async createSubmission(insertSubmission: InsertSubmission): Promise<Submission> {
    const id = this.submissionId++;
    const submission: Submission = { ...insertSubmission, id };
    this.submissions.set(id, submission);
    return submission;
  }
  
  // Activity methods
  async getActivity(id: number): Promise<Activity | undefined> {
    return this.activities.get(id);
  }
  
  async getAllActivities(): Promise<Activity[]> {
    return Array.from(this.activities.values());
  }
  
  async getRecentActivities(limit: number): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .sort((a, b) => {
        // Sort by timestamp (most recent first)
        // This is a simple comparison, in a real app we would parse dates
        return b.id - a.id;
      })
      .slice(0, limit);
  }
  
  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.activityId++;
    const activity: Activity = { ...insertActivity, id };
    this.activities.set(id, activity);
    return activity;
  }
}

export const storage = new MemStorage();

// Initialize with default admin user
(async () => {
  try {
    // Create both user and admin with same credentials for convenience
    const userExists = await storage.getUserByUsername("admin");
    if (!userExists) {
      await storage.createUser({
        username: "admin",
        password: "admin"
      });
      
      console.log("Default user created: admin/admin");
    }
    
    const adminExists = await storage.getAdminByUsername("admin");
    if (!adminExists) {
      await storage.createAdmin({
        username: "admin",
        password: "admin"
      });
      
      // Make a request to initialize demo data
      fetch("http://localhost:5000/api/init-demo-data", {
        method: "POST"
      }).catch(err => {
        console.log("Note: Demo data initialization will happen on the first request");
      });
    }
  } catch (error) {
    console.error("Error initializing storage:", error);
  }
})();
