import { Request, Response } from "express";
import { LinkedInService } from "../services/linkedinService";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import puppeteer from "puppeteer";

export class LinkedInController {
  static authRedirect(req: Request, res: Response) {
    try {
      const authUrl = new URL(
        "https://www.linkedin.com/oauth/v2/authorization"
      );
      authUrl.searchParams.append("response_type", "code");
      authUrl.searchParams.append("client_id", process.env.LINKEDIN_CLIENT_ID!);
      authUrl.searchParams.append(
        "redirect_uri",
        process.env.LINKEDIN_REDIRECT_URI!
      );
      authUrl.searchParams.append(
        "scope",
        "openid profile email w_member_social"
      );

      res.redirect(authUrl.toString());
    } catch (error) {
      console.error("Auth error:", error);
      res.status(500).json({ error: "Auth failed" });
    }
  }

  // Step 2: Handle Callback
  static async handleCallback(req: Request, res: Response) {
    try {
      const { code } = req.query;
      if (!code) return res.status(400).json({ error: "No code provided" });

      const user = await LinkedInService.handleCallback(code as string);

      console.log("🔹 LinkedIn User:", user);

      // 👇 Yeh check karna zaroori hai
      if (!user.linkedInAccessToken) {
        return res.status(500).json({ error: "Token missing" });
      }

      res.json({ user, message: "Login successful" });
    } catch (error) {
      console.error("Callback error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  }

  // **🔹 Step 3: Post Job on LinkedIn**
  static async postJob(req: Request, res: Response): Promise<void> {
    try {
      const {
        title,
        company,
        location,
        remote,
        employmentType,
        workAuth,
        description,
        platform,
      } = req.body;
      const jobRepo = AppDataSource.getRepository(Job);
      const newJob = jobRepo.create({
        title,
        company,
        location,
        remote,
        employmentType,
        workAuth,
        description,
        platform,
      });
      await jobRepo.save(newJob);

      // Launch Puppeteer for automation
      const browser = await puppeteer.launch({ headless: false });
      const page = await browser.newPage();

      // Check and post to Benchinf
      if (platform.includes("Benchinfo")) {
        await loginToBenchinfo(page);
        await page.goto("https://www.benchinfo.com/employer/jobpost");
        await page.type("#jobTitle", title);
        await page.type("#companyName", company);
        await page.type("#location", location);
        if (remote) await page.click("#remoteCheckbox");
        await page.select("#employmentType", employmentType);
        await page.select("#workAuth", workAuth);
        await page.type("#jobDescription", description);
        await page.click("#submitButton");
      }

      // Check and post to LinkedIn (Example)
      if (platform.includes("LinkedIn")) {
        await page.goto("https://www.linkedin.com/jobs/post");
        await page.type("#jobTitle", title);
        await page.type("#companyName", company);
        await page.type("#location", location);
        await page.type("#jobDescription", description);
        await page.click("#submitJob");
      }

      await browser.close();

      res
        .status(201)
        .json({ message: "Job posted successfully to selected platforms." });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}
