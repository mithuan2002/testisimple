import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import session from "express-session";
import createMemoryStore from "memorystore";
import { format } from "date-fns";
import { IStorage } from "./storage";
import { 
  users, admins, contacts, campaigns, submissions, activities,
  type User, type Admin, type Contact, type Campaign, type Submission, type Activity,
  type InsertUser, type InsertAdmin, type InsertContact, type InsertCampaign, type InsertSubmission, type InsertActivity
} from "@shared/schema";
import { eq } from 'drizzle-orm';

const MemoryStore = createMemoryStore(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  private db: any;
  private pool: Pool;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000
    });

    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    this.db = drizzle(this.pool);
  }

  // Campaign methods
  async getCampaign(id: number): Promise<Campaign | undefined> {
    const [campaign] = await this.db.select().from(campaigns).where(eq(campaigns.id, id));
    return campaign;
  }

  async getAllCampaigns(): Promise<Campaign[]> {
    return await this.db.select().from(campaigns);
  }

  async createCampaign(insertCampaign: InsertCampaign): Promise<Campaign> {
    try {
      // Ensure platforms is an array
      if (typeof insertCampaign.platforms === 'object' && !Array.isArray(insertCampaign.platforms)) {
        insertCampaign.platforms = Object.values(insertCampaign.platforms);
      }

      // Set default status
      if (!insertCampaign.status) {
        insertCampaign.status = 'active';
      }

      // Create the campaign
      const [campaign] = await this.db.insert(campaigns).values({
        title: insertCampaign.title,
        description: insertCampaign.description,
        startDate: insertCampaign.startDate,
        endDate: insertCampaign.endDate,
        smsMessage: insertCampaign.smsMessage,
        platforms: insertCampaign.platforms,
        status: insertCampaign.status,
        createdAt: new Date().toISOString()
      }).returning();

      if (!campaign) {
        throw new Error('Failed to create campaign');
      }

      // Log activity
      await this.createActivity({
        type: "campaign",
        message: `<span class="font-medium">New campaign created</span>: ${campaign.title}`,
        timestamp: format(new Date(), "PPpp"),
      });

      return campaign;
    } catch (error) {
      console.error('Create campaign error:', error);
      throw error;
    }
  }

  async updateCampaign(id: number, campaignUpdate: Partial<InsertCampaign>): Promise<Campaign> {
    const [campaign] = await this.db
      .update(campaigns)
      .set(campaignUpdate)
      .where(eq(campaigns.id, id))
      .returning();

    if (!campaign) {
      throw new Error(`Campaign with id ${id} not found`);
    }

    return campaign;
  }

  async deleteCampaign(id: number): Promise<void> {
    await this.db.delete(campaigns).where(eq(campaigns.id, id));
  }

  // Activity methods
  async getActivity(id: number): Promise<Activity | undefined> {
    const [activity] = await this.db.select().from(activities).where(eq(activities.id, id));
    return activity;
  }

  async getAllActivities(): Promise<Activity[]> {
    return await this.db.select().from(activities);
  }

  async getRecentActivities(limit: number): Promise<Activity[]> {
    return await this.db
      .select()
      .from(activities)
      .orderBy(activities.id, 'desc')
      .limit(limit);
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const [activity] = await this.db.insert(activities).values(insertActivity).returning();
    return activity;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await this.db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await this.db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await this.db.insert(users).values(insertUser).returning();
    return user;
  }

  // Admin methods
  async getAdmin(id: number): Promise<Admin | undefined> {
    const [admin] = await this.db.select().from(admins).where(eq(admins.id, id));
    return admin;
  }

  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    const [admin] = await this.db.select().from(admins).where(eq(admins.username, username));
    return admin;
  }

  async createAdmin(insertAdmin: InsertAdmin): Promise<Admin> {
    const [admin] = await this.db.insert(admins).values(insertAdmin).returning();
    return admin;
  }

  // Contact methods
  async getContact(id: number): Promise<Contact | undefined> {
    const [contact] = await this.db.select().from(contacts).where(eq(contacts.id, id));
    return contact;
  }

  async getAllContacts(): Promise<Contact[]> {
    try {
      const result = await this.db.select().from(contacts);
      return result || [];
    } catch (error) {
      console.error('Error fetching contacts:', error);
      return [];
    }
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const [contact] = await this.db.insert(contacts).values(insertContact).returning();
    return contact;
  }

  async updateContact(id: number, contactUpdate: Partial<InsertContact>): Promise<Contact> {
    const [contact] = await this.db
      .update(contacts)
      .set(contactUpdate)
      .where(eq(contacts.id, id))
      .returning();

    if (!contact) {
      throw new Error(`Contact with id ${id} not found`);
    }

    return contact;
  }

  async deleteContact(id: number): Promise<void> {
    await this.db.delete(contacts).where(eq(contacts.id, id));
  }

  // Submission methods
  async getSubmission(id: number): Promise<Submission | undefined> {
    const [submission] = await this.db.select().from(submissions).where(eq(submissions.id, id));
    return submission;
  }

  async getAllSubmissions(): Promise<Submission[]> {
    return await this.db.select().from(submissions);
  }

  async getSubmissionsByCampaign(campaignId: number): Promise<Submission[]> {
    return await this.db
      .select()
      .from(submissions)
      .where(eq(submissions.campaignId, campaignId));
  }

  async createSubmission(insertSubmission: InsertSubmission): Promise<Submission> {
    // Ensure points is set to 0 if not provided
    const submissionWithPoints = {
      ...insertSubmission,
      points: insertSubmission.points || 0
    };

    const [submission] = await this.db.insert(submissions).values(submissionWithPoints).returning();
    return submission;
  }

  async updateSubmission(id: number, submissionUpdate: Partial<InsertSubmission>): Promise<Submission> {
    const [submission] = await this.db
      .update(submissions)
      .set(submissionUpdate)
      .where(eq(submissions.id, id))
      .returning();

    if (!submission) {
      throw new Error(`Submission with id ${id} not found`);
    }

    return submission;
  }
}