import { Request, Response } from "express";
import { LinkedInService } from "../services/linkedinService";
import { BenchInfoService } from "../services/benchInfoService"; 
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import { Job } from "../entity/Job";

// 🟢 **Step 1: Redirect to LinkedIn Authorization**
export const authRedirect = (req: Request, res: Response) => {
  try {
    const authUrl = new URL("https://www.linkedin.com/oauth/v2/authorization");
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("client_id", process.env.LINKEDIN_CLIENT_ID!);
    authUrl.searchParams.append("redirect_uri", process.env.LINKEDIN_REDIRECT_URI!);
    authUrl.searchParams.append("scope", "openid profile email w_member_social");

    res.redirect(authUrl.toString());
  } catch (error) {
    console.error("Auth error:", error);
    res.status(500).json({ error: "Auth failed" });
  }
};

// 🟢 **Step 2: Handle LinkedIn Callback**
export const handleCallback = async (req: Request, res: Response) => {
  try {
    const { code } = req.query;
    if (!code) return res.status(400).json({ error: "No code provided" });

    const user = await LinkedInService.handleCallback(code as string);
    console.log("🔹 LinkedIn User:", user);

    if (!user.linkedInAccessToken) {
      return res.status(500).json({ error: "Token missing" });
    }

    res.json({ user, message: "Login successful" });
  } catch (error) {
    console.error("Callback error:", error);
    res.status(500).json({ error: "Login failed" });
  }
};

// 🟢 **Step 3: Post Job on Both LinkedIn & BenchInfo**
export const postJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, companyName, location, applyLink, image, employmentType, workAuth, remote } = req.body;

    // 🔹 Validate required fields
    if (!title || !description || !companyName || !location || !applyLink || !employmentType || !workAuth) {
      res.status(400).json({ 
        error: "Missing required fields",
        required: ["title", "description", "companyName", "location", "applyLink", "employmentType", "workAuth"]
      });
      return;
    }

    const userRepo = AppDataSource.getRepository(User);
    const jobRepo = AppDataSource.getRepository(Job);
    const user = await userRepo.findOne({ where: { id: req.user!.id } });

    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // 🔹 Prepare job details
    const jobDetails = {
      title,
      description,
      companyName, 
      location,
      applyLink,
      image,
      employmentType,
      workAuth,
      remote: remote || false,
      user,
      platforms: [], // Initially empty, will update after posting
      linkedInId: user.linkedInId ?? "", // Added missing field
    };

    // 🔹 Save Job in Database
    const job = jobRepo.create(jobDetails);
    await jobRepo.save(job);

    const platforms: string[] = [];

    // 🟢 **Post Job on LinkedIn**
    if (user.linkedInAccessToken) {
      try {
        await LinkedInService.postJobOnLinkedIn(user.linkedInAccessToken, jobDetails);
        platforms.push("LinkedIn");
      } catch (error) {
        console.error("Error posting on LinkedIn:", error);
      }
    }

    // 🟢 **Post Job on BenchInfo**
    try {
      await BenchInfoService.postJobOnBenchInfo(jobDetails);
      platforms.push("BenchInfo");
    } catch (error) {
      console.error("Error posting on BenchInfo:", error);
    }

    // 🔹 Update Job with Posted Platforms
    job.platforms = platforms;
    await jobRepo.save(job);

    res.status(201).json({ 
      message: "Job posted successfully",
      jobId: job.id,
      postedOn: platforms
    });

  } catch (error) {
    console.error("Error posting job:", error);
    res.status(500).json({ error: "Failed to post job" });
  }
};
