import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import { format } from "date-fns";
import session from "express-session";
import { 
  insertCampaignSchema, 
  insertContactSchema,
  insertSubmissionSchema,
  insertActivitySchema,
  loginSchema
} from "@shared/schema";

// Extend express-session with our custom properties
declare module 'express-session' {
  interface SessionData {
    userId?: number;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up session middleware
  app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    }
  }));
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      // Validate request body
      const validatedData = loginSchema.parse(req.body);
      
      // Check if user exists
      const user = await storage.getUserByUsername(validatedData.username);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // In a real app, we would compare hashed passwords
      // For this demo, we'll just check if passwords match
      const passwordMatch = validatedData.password === user.password;
      
      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Create a session for the user
      if (!req.session) {
        return res.status(500).json({ message: "Session setup failed" });
      }
      
      req.session.userId = user.id;
      
      // Log the activity
      await storage.createActivity({
        type: "auth",
        message: `Admin user <span class="font-medium">${user.username}</span> logged in`,
        timestamp: format(new Date(), "PPpp"),
      });
      
      return res.status(200).json({ 
        message: "Login successful",
        user: { id: user.id, username: user.username }
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(400).json({ message: "Invalid request data" });
    }
  });
  
  app.post("/api/auth/logout", (req, res) => {
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ message: "Failed to logout" });
        }
        res.clearCookie("connect.sid");
        return res.status(200).json({ message: "Logout successful" });
      });
    } else {
      return res.status(200).json({ message: "No active session" });
    }
  });
  
  app.get("/api/auth/status", (req, res) => {
    if (req.session && req.session.userId) {
      return res.status(200).json({ authenticated: true });
    } else {
      return res.status(401).json({ authenticated: false });
    }
  });
  
  // Auth middleware to protect routes
  const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.session && req.session.userId) {
      return next();
    }
    return res.status(401).json({ message: "Unauthorized" });
  };
  
  // Stats routes
  app.get("/api/stats", isAuthenticated, async (req, res) => {
    try {
      const campaigns = await storage.getAllCampaigns();
      const contacts = await storage.getAllContacts();
      
      const activeCampaigns = campaigns.filter(c => c.status === "active").length;
      const totalContacts = contacts.length;
      
      // For a real app, these would be actual metrics
      const statsData = {
        activeCampaigns,
        totalContacts,
        messageDelivery: "98%",
        formSubmissions: 648,
        campaignIncrease: 12,
        contactIncrease: 8,
        deliveryIncrease: 2,
        submissionIncrease: 15
      };
      
      return res.status(200).json(statsData);
    } catch (error) {
      console.error("Stats error:", error);
      return res.status(500).json({ message: "Failed to fetch stats" });
    }
  });
  
  // Campaign routes
  app.get("/api/campaigns", isAuthenticated, async (req, res) => {
    try {
      const campaigns = await storage.getAllCampaigns();
      return res.status(200).json(campaigns);
    } catch (error) {
      console.error("Get campaigns error:", error);
      return res.status(500).json({ message: "Failed to fetch campaigns" });
    }
  });
  
  app.get("/api/campaigns/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid campaign ID" });
      }
      
      const campaign = await storage.getCampaign(id);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      return res.status(200).json(campaign);
    } catch (error) {
      console.error("Get campaign error:", error);
      return res.status(500).json({ message: "Failed to fetch campaign" });
    }
  });
  
  app.post("/api/campaigns", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertCampaignSchema.parse(req.body);
      
      // First create the campaign to get the ID
      const campaign = await storage.createCampaign({
        ...validatedData,
        status: 'active',
        platforms: Array.isArray(validatedData.platforms) ? validatedData.platforms : [validatedData.platforms],
      });

      // Then update it with the form URL
      const baseUrl = process.env.BASE_URL || `http://localhost:5000`;
      const formUrl = `${baseUrl}/campaign/${campaign.id}`;
      
      const updatedCampaign = await storage.updateCampaign(campaign.id, {
        ...campaign,
        formUrl
      });

      // Send notifications
      const contacts = await storage.getAllContacts();
      const activeContacts = contacts.filter(contact => contact.isActive);

      // Create activity logs
      await storage.createActivity({
        type: "campaign",
        message: `<span class="font-medium">New campaign created</span>: ${campaign.title}`,
        timestamp: format(new Date(), "PPpp"),
      });

      return res.status(201).json(updatedCampaign);
        ...validatedData,
        status: 'active',
        platforms: Array.isArray(validatedData.platforms) ? validatedData.platforms : [validatedData.platforms],
        formUrl: formUrl
      });

      // Get actual active contacts and send SMS
      const contacts = await storage.getAllContacts();
      const activeContacts = contacts.filter(contact => contact.isActive);

      // Send SMS to each active contact using Twilio
      const twilioClient = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      
      for (const contact of activeContacts) {
        try {
          await twilioClient.messages.create({
            body: campaign.smsMessage,
            to: contact.phone,
            from: process.env.TWILIO_PHONE_NUMBER
          });
          
          await storage.createActivity({
            type: "notification",
            message: `SMS sent to <span class="font-medium">${contact.name}</span>`,
            timestamp: format(new Date(), "PPpp"),
          });
        } catch (error) {
          console.error(`Failed to send SMS to ${contact.phone}:`, error);
          await storage.createActivity({
            type: "error",
            message: `Failed to send SMS to <span class="font-medium">${contact.name}</span>`,
            timestamp: format(new Date(), "PPpp"),
          });
        }
      }

      // Log campaign creation activity
      await storage.createActivity({
        type: "campaign",
        message: `<span class="font-medium">New campaign created</span>: ${campaign.title}`,
        timestamp: format(new Date(), "PPpp"),
      });

      if (activeContacts.length > 0) {
        // Log SMS notification activity with real count
        await storage.createActivity({
          type: "notification",
          message: `SMS notifications sent to <span class="font-medium">${activeContacts.length} contacts</span> for ${campaign.title}`,
          timestamp: format(new Date(), "PPpp"),
        });
      }

      return res.status(201).json(campaign);
    } catch (error) {
      console.error("Create campaign error:", error);
      return res.status(400).json({ message: "Invalid campaign data" });
    }
  });
  
  app.delete("/api/campaigns/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid campaign ID" });
      }
      
      const campaign = await storage.getCampaign(id);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      await storage.deleteCampaign(id);
      
      // Log the activity
      await storage.createActivity({
        type: "campaign",
        message: `<span class="font-medium">Campaign deleted</span>: ${campaign.title}`,
        timestamp: format(new Date(), "PPpp"),
      });
      
      return res.status(200).json({ message: "Campaign deleted successfully" });
    } catch (error) {
      console.error("Delete campaign error:", error);
      return res.status(500).json({ message: "Failed to delete campaign" });
    }
  });
  
  app.post("/api/campaigns/:id/resend-sms", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid campaign ID" });
      }
      
      const campaign = await storage.getCampaign(id);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      // Get all active contacts to send SMS
      const contacts = await storage.getAllContacts();
      const activeContacts = contacts.filter(contact => contact.isActive);
      
      // In a real app, this would resend SMS to all contacts
      // For this demo, we'll just log the activity
      await storage.createActivity({
        type: "notification",
        message: `SMS notifications resent to <span class="font-medium">${activeContacts.length} contacts</span> for ${campaign.title}`,
        timestamp: format(new Date(), "PPpp"),
      });
      
      return res.status(200).json({ message: "SMS resent successfully" });
    } catch (error) {
      console.error("Resend SMS error:", error);
      return res.status(500).json({ message: "Failed to resend SMS" });
    }
  });
  
  // Route to get all submissions
  app.get("/api/submissions", isAuthenticated, async (req, res) => {
    try {
      const submissions = await storage.getAllSubmissions();
      return res.status(200).json(submissions);
    } catch (error) {
      console.error("Get submissions error:", error);
      return res.status(500).json({ message: "Failed to fetch submissions" });
    }
  });
  
  // Campaign submissions
  app.get("/api/campaigns/:id/submissions", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.id);
      if (isNaN(campaignId)) {
        return res.status(400).json({ message: "Invalid campaign ID" });
      }
      
      const submissions = await storage.getSubmissionsByCampaign(campaignId);
      return res.status(200).json(submissions);
    } catch (error) {
      console.error("Get submissions error:", error);
      return res.status(500).json({ message: "Failed to fetch submissions" });
    }
  });
  
  app.post("/api/submissions", async (req, res) => {
    try {
      // Validate request body
      const validatedData = insertSubmissionSchema.parse(req.body);
      
      // In a real app, the screenshot would be uploaded to storage
      // For this demo, we'll just store the URL
      
      // Create the submission
      const submission = await storage.createSubmission(validatedData);
      
      // Log the activity
      const campaign = await storage.getCampaign(submission.campaignId);
      const campaignTitle = campaign ? campaign.title : 'a campaign';
      
      await storage.createActivity({
        type: "upload",
        message: `<span class="font-medium">${submission.name}</span> submitted a new screenshot for <span class="font-medium">${campaignTitle}</span>`,
        timestamp: format(new Date(), "PPpp"),
      });
      
      return res.status(201).json(submission);
    } catch (error) {
      console.error("Create submission error:", error);
      return res.status(400).json({ message: "Invalid submission data" });
    }
  });
  
  // Update submission points
  app.patch("/api/submissions/:id/points", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid submission ID" });
      }
      
      const { engagementCount } = req.body;
      if (typeof engagementCount !== 'number' || engagementCount < 0) {
        return res.status(400).json({ message: "Invalid points value" });
      }
      
      const submission = await storage.getSubmission(id);
      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }
      
      // Update the submission points
      const updatedSubmission = await storage.updateSubmission(id, { engagementCount });
      
      // Log the activity
      await storage.createActivity({
        type: "points",
        message: `<span class="font-medium">${updatedSubmission.name}</span> was awarded <span class="font-medium">${engagementCount} points</span> for their submission`,
        timestamp: format(new Date(), "PPpp"),
      });
      
      return res.status(200).json(updatedSubmission);
    } catch (error) {
      console.error("Update submission points error:", error);
      return res.status(500).json({ message: "Failed to update submission points" });
    }
  });
  
  // Contact routes
  app.get("/api/contacts", isAuthenticated, async (req, res) => {
    try {
      const contacts = await storage.getAllContacts();
      return res.status(200).json(contacts);
    } catch (error) {
      console.error("Get contacts error:", error);
      return res.status(500).json({ message: "Failed to fetch contacts" });
    }
  });
  
  app.post("/api/contacts", isAuthenticated, async (req, res) => {
    try {
      // Validate request body
      const validatedData = insertContactSchema.parse(req.body);
      
      // Create the contact
      const contact = await storage.createContact(validatedData);
      
      // Log the activity
      await storage.createActivity({
        type: "contact",
        message: `<span class="font-medium">New contact added</span>: ${contact.name}`,
        timestamp: format(new Date(), "PPpp"),
      });
      
      return res.status(201).json(contact);
    } catch (error) {
      console.error("Create contact error:", error);
      return res.status(400).json({ message: "Invalid contact data" });
    }
  });
  
  app.patch("/api/contacts/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid contact ID" });
      }
      
      // Validate request body
      const validatedData = insertContactSchema.partial().parse(req.body);
      
      const contact = await storage.getContact(id);
      if (!contact) {
        return res.status(404).json({ message: "Contact not found" });
      }
      
      // Update the contact
      const updatedContact = await storage.updateContact(id, validatedData);
      
      // Log the activity
      await storage.createActivity({
        type: "contact",
        message: `<span class="font-medium">Contact updated</span>: ${updatedContact.name}`,
        timestamp: format(new Date(), "PPpp"),
      });
      
      return res.status(200).json(updatedContact);
    } catch (error) {
      console.error("Update contact error:", error);
      return res.status(400).json({ message: "Invalid contact data" });
    }
  });
  
  app.patch("/api/contacts/:id/status", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid contact ID" });
      }
      
      const { isActive } = req.body;
      if (typeof isActive !== 'boolean') {
        return res.status(400).json({ message: "Invalid status value" });
      }
      
      const contact = await storage.getContact(id);
      if (!contact) {
        return res.status(404).json({ message: "Contact not found" });
      }
      
      // Update the contact
      const updatedContact = await storage.updateContact(id, { isActive });
      
      // Log the activity
      await storage.createActivity({
        type: "contact",
        message: `Contact <span class="font-medium">${updatedContact.name}</span> ${isActive ? 'activated' : 'deactivated'}`,
        timestamp: format(new Date(), "PPpp"),
      });
      
      return res.status(200).json(updatedContact);
    } catch (error) {
      console.error("Update contact status error:", error);
      return res.status(500).json({ message: "Failed to update contact status" });
    }
  });
  
  app.delete("/api/contacts/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid contact ID" });
      }
      
      const contact = await storage.getContact(id);
      if (!contact) {
        return res.status(404).json({ message: "Contact not found" });
      }
      
      await storage.deleteContact(id);
      
      // Log the activity
      await storage.createActivity({
        type: "contact",
        message: `<span class="font-medium">Contact deleted</span>: ${contact.name}`,
        timestamp: format(new Date(), "PPpp"),
      });
      
      return res.status(200).json({ message: "Contact deleted successfully" });
    } catch (error) {
      console.error("Delete contact error:", error);
      return res.status(500).json({ message: "Failed to delete contact" });
    }
  });
  
  app.post("/api/contacts/:id/test-sms", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid contact ID" });
      }
      
      const contact = await storage.getContact(id);
      if (!contact) {
        return res.status(404).json({ message: "Contact not found" });
      }
      
      // In a real app, this would send a test SMS
      // For this demo, we'll just log the activity
      await storage.createActivity({
        type: "notification",
        message: `Test SMS sent to <span class="font-medium">${contact.name}</span> (${contact.phone})`,
        timestamp: format(new Date(), "PPpp"),
      });
      
      return res.status(200).json({ message: "Test SMS sent successfully" });
    } catch (error) {
      console.error("Test SMS error:", error);
      return res.status(500).json({ message: "Failed to send test SMS" });
    }
  });
  
  // Leaderboard routes
  app.get("/api/leaderboard", isAuthenticated, async (req, res) => {
    try {
      const submissions = await storage.getAllSubmissions();
      
      // Group submissions by name and email
      const promoterMap = new Map();
      
      submissions.forEach(submission => {
        const key = `${submission.name}:${submission.email}`;
        
        if (!promoterMap.has(key)) {
          promoterMap.set(key, {
            id: submission.id, // Using first submission ID as promoter ID
            name: submission.name,
            email: submission.email,
            points: 0,
            submissionCount: 0,
            topCampaign: "",
            lastSubmission: "",
            campaigns: new Map(),
          });
        }
        
        const promoter = promoterMap.get(key);
        promoter.points += submission.engagementCount;
        promoter.submissionCount += 1;
        promoter.lastSubmission = submission.submittedAt;
        
        // Track submissions by campaign
        if (!promoter.campaigns.has(submission.campaignId)) {
          promoter.campaigns.set(submission.campaignId, {
            count: 0,
            engagement: 0,
            name: ""
          });
        }
        
        const campaign = promoter.campaigns.get(submission.campaignId);
        campaign.count += 1;
        campaign.engagement += submission.engagementCount;
        
        // We'll set the campaign name later when we process top campaigns
      });
      
      // Convert to array and sort
      let promoters = Array.from(promoterMap.values());
      
      // Find top campaign for each promoter
      for (const promoter of promoters) {
        if (promoter.campaigns.size > 0) {
          let topCampaignId = null;
          let topEngagement = 0;
          
          promoter.campaigns.forEach((campaign, campaignId) => {
            if (campaign.engagement > topEngagement) {
              topEngagement = campaign.engagement;
              topCampaignId = campaignId;
            }
          });
          
          if (topCampaignId !== null) {
            const campaign = await storage.getCampaign(topCampaignId);
            if (campaign) {
              promoter.topCampaign = campaign.title;
            }
          }
        }
        
        // Remove campaigns map before sending
        delete promoter.campaigns;
      }
      
      // Sort by points
      promoters.sort((a, b) => b.points - a.points);
      
      // Add rank
      promoters = promoters.map((promoter, index) => ({
        ...promoter,
        rank: index + 1
      }));
      
      return res.status(200).json(promoters);
    } catch (error) {
      console.error("Leaderboard error:", error);
      return res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });
  
  app.get("/api/leaderboard/top", isAuthenticated, async (req, res) => {
    try {
      const submissions = await storage.getAllSubmissions();
      
      // Group submissions by name
      const promoterMap = new Map();
      
      submissions.forEach(submission => {
        if (!promoterMap.has(submission.name)) {
          promoterMap.set(submission.name, {
            id: submission.id, // Using first submission ID as promoter ID
            name: submission.name,
            points: 0
          });
        }
        
        const promoter = promoterMap.get(submission.name);
        promoter.points += submission.engagementCount;
      });
      
      // Convert to array, sort by points, and take top 5
      let promoters = Array.from(promoterMap.values())
        .sort((a, b) => b.points - a.points)
        .slice(0, 5)
        .map((promoter, index) => ({
          ...promoter,
          rank: index + 1
        }));
      
      return res.status(200).json(promoters);
    } catch (error) {
      console.error("Top promoters error:", error);
      return res.status(500).json({ message: "Failed to fetch top promoters" });
    }
  });
  
  // Activity routes
  app.get("/api/activities/recent", isAuthenticated, async (req, res) => {
    try {
      const activities = await storage.getRecentActivities(5);
      return res.status(200).json(activities);
    } catch (error) {
      console.error("Recent activities error:", error);
      return res.status(500).json({ message: "Failed to fetch recent activities" });
    }
  });
  
  // Initialize demo data
  app.post("/api/init-demo-data", async (req, res) => {
    try {
      // Create admin user
      const admin = await storage.createAdmin({
        username: "admin",
        password: "admin" // In a real app, this would be hashed
      });
      
      // Create sample contacts
      const contactNames = [
        "Sarah Johnson", "Michael Chen", "Aisha Rodriguez", 
        "David Wilson", "Emily Patel", "James Lee",
        "Maria Garcia", "Robert Kim", "Olivia Brown",
        "Thomas Nguyen"
      ];
      
      for (const name of contactNames) {
        await storage.createContact({
          name,
          phone: `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`,
          email: `${name.toLowerCase().replace(' ', '.')}@example.com`,
          isActive: true
        });
      }
      
      // Create sample campaigns
      const campaigns = [
        {
          title: "Summer Photo Contest",
          description: "Share your summer memories with our products and win amazing prizes! Top 3 most engaging posts will receive gift cards.",
          startDate: "Jul 15, 2023",
          endDate: "Aug 15, 2023",
          smsMessage: "Join our Summer Photo Contest! Share pics with our products on Instagram or Snapchat & win prizes. Submit your post engagement screenshot: https://example.com/contest",
          status: "active",
          platforms: ["instagram", "snapchat"],
          createdAt: "2023-07-10T10:00:00"
        },
        {
          title: "Product Launch Celebration",
          description: "Help us celebrate our new product line! Post a creative story with our products and tag us to enter the contest.",
          startDate: "Jun 25, 2023",
          endDate: "Jul 25, 2023",
          smsMessage: "🎉 New Product Alert! Share a creative story with our new products on social media and win exclusive merchandise. Submit here: https://example.com/launch",
          status: "active",
          platforms: ["instagram", "snapchat"],
          createdAt: "2023-06-20T14:30:00"
        },
        {
          title: "Customer Testimonial Drive",
          description: "Share your experience with our products on social media. Best testimonials will win loyalty points and feature on our website!",
          startDate: "Jul 5, 2023",
          endDate: "Aug 5, 2023",
          smsMessage: "We want to hear from you! Share your experience with our products on social media. Best testimonials win rewards! Submit here: https://example.com/testimonial",
          status: "active",
          platforms: ["instagram"],
          createdAt: "2023-07-01T09:15:00"
        }
      ];
      
      for (const campaignData of campaigns) {
        await storage.createCampaign(campaignData);
      }
      
      // Create sample submissions
      const sampleSubmissions = [
        {
          campaignId: 1,
          name: "Sarah Johnson",
          email: "sarah.johnson@example.com",
          platform: "instagram",
          screenshotUrl: "/uploads/screenshot1.jpg",
          engagementCount: 2840,
          submittedAt: "Jul 20, 2023"
        },
        {
          campaignId: 1,
          name: "Michael Chen",
          email: "michael.chen@example.com",
          platform: "snapchat",
          screenshotUrl: "/uploads/screenshot2.jpg",
          engagementCount: 2450,
          submittedAt: "Jul 22, 2023"
        },
        {
          campaignId: 2,
          name: "Aisha Rodriguez",
          email: "aisha.rodriguez@example.com",
          platform: "instagram",
          screenshotUrl: "/uploads/screenshot3.jpg",
          engagementCount: 2218,
          submittedAt: "Jun 30, 2023"
        },
        {
          campaignId: 3,
          name: "David Wilson",
          email: "david.wilson@example.com",
          platform: "instagram",
          screenshotUrl: "/uploads/screenshot4.jpg",
          engagementCount: 1985,
          submittedAt: "Jul 10, 2023"
        },
        {
          campaignId: 3,
          name: "Emily Patel",
          email: "emily.patel@example.com",
          platform: "instagram",
          screenshotUrl: "/uploads/screenshot5.jpg",
          engagementCount: 1756,
          submittedAt: "Jul 12, 2023"
        }
      ];
      
      for (const submission of sampleSubmissions) {
        await storage.createSubmission(submission);
      }
      
      // Create sample activities
      const activities = [
        {
          type: "upload",
          message: "<span class=\"font-medium\">Sarah Johnson</span> submitted a new screenshot for <span class=\"font-medium\">Summer Photo Contest</span>",
          timestamp: "10 minutes ago"
        },
        {
          type: "contact",
          message: "<span class=\"font-medium\">10 new contacts</span> were added to the database",
          timestamp: "25 minutes ago"
        },
        {
          type: "campaign",
          message: "<span class=\"font-medium\">Customer Testimonial Drive</span> campaign was launched",
          timestamp: "1 hour ago"
        },
        {
          type: "award",
          message: "<span class=\"font-medium\">Michael Chen</span> advanced to 2nd place on the leaderboard",
          timestamp: "2 hours ago"
        },
        {
          type: "notification",
          message: "SMS notifications sent to <span class=\"font-medium\">2,540 contacts</span> for new campaign",
          timestamp: "3 hours ago"
        }
      ];
      
      for (const activity of activities) {
        await storage.createActivity(activity);
      }
      
      return res.status(200).json({ message: "Demo data initialized successfully" });
    } catch (error) {
      console.error("Init demo data error:", error);
      return res.status(500).json({ message: "Failed to initialize demo data" });
    }
  });

  // Route to update submission points
  app.patch("/api/submissions/:id/points", isAuthenticated, async (req, res) => {
    try {
      const submissionId = parseInt(req.params.id);
      const { points } = req.body;

      if (typeof points !== 'number' || isNaN(points) || points < 0) {
        return res.status(400).json({ message: "Invalid points value" });
      }

      const submission = await storage.getSubmission(submissionId);
      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }

      const updatedSubmission = await storage.updateSubmission(submissionId, { points });
      
      // Create activity log for points assignment
      await storage.createActivity({
        type: "points",
        message: `<span class="font-medium">${updatedSubmission.name}</span> was awarded <span class="font-medium">${points} points</span>`,
        timestamp: new Date().toLocaleString(),
      });

      return res.status(200).json(updatedSubmission);
    } catch (error) {
      console.error("Update submission points error:", error);
      return res.status(500).json({ message: "Failed to update submission points" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
