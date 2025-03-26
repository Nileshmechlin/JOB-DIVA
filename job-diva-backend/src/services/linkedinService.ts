import axios from "axios";
import { User } from "../entity/User";
import { AppDataSource } from "../data-source";

interface JobDetails {
  title: string;
  description: string;
  companyName: string;
  location: string;
  applyLink: string;
  image?: string;
  linkedInId: string;
}

interface LinkedInProfile {
  sub: string;
  name: string;
  email: string;
  picture?: string;
}

export class LinkedInService {
  // Exchange code for access token
  static async getAccessToken(code: string): Promise<string> {
    const tokenUrl = "https://www.linkedin.com/oauth/v2/accessToken";
    const formData = new URLSearchParams({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: process.env.LINKEDIN_REDIRECT_URI!,
      client_id: process.env.LINKEDIN_CLIENT_ID!,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET!
    });

    const response = await axios({
      method: 'post',
      url: tokenUrl,
      data: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    return response.data.access_token;
  }

  // Handle the complete OAuth flow
  static async handleCallback(code: string) {
    try {
      const accessToken = await this.getAccessToken(code);
      const profile = await this.getProfile(accessToken);

      console.log("LinkedIn Profile:", profile);

      const userRepo = AppDataSource.getRepository(User);
      let user = await userRepo.findOne({ 
        where: [
          { email: profile.email },
          { linkedInId: profile.sub }
        ]
      });

      if (!user) {
        // Create new user
        user = userRepo.create({
          linkedInId: profile.sub,
          name: profile.name,
          email: profile.email,
          linkedInAccessToken: accessToken,
          role: "employer"
        });
      } else {
        // Update existing user
        user.linkedInId = profile.sub;
        user.linkedInAccessToken = accessToken;
        user.name = profile.name || user.name;
      }

      console.log("Saving user:", {
        id: user.id,
        email: user.email,
        linkedInId: user.linkedInId,
        hasToken: !!user.linkedInAccessToken
      });

      await userRepo.save(user);
      return user;
    } catch (error) {
      console.error("LinkedIn callback error:", error);
      throw error;
    }
  }

  // Get user profile
  static async getProfile(accessToken: string): Promise<LinkedInProfile> {
    const response = await axios.get("https://api.linkedin.com/v2/userinfo", {
      headers: { 
        'Authorization': `Bearer ${accessToken}`
      }
    });

    return {
      sub: response.data.sub,
      name: response.data.name,
      email: response.data.email,
      picture: response.data.picture
    };
  }

  // **4️⃣ Post Job on LinkedIn**
  static async postJobOnLinkedIn(accessToken: string, jobDetails: JobDetails) {
    const postUrl = "https://api.linkedin.com/v2/ugcPosts";

    const postData = {
      author: `urn:li:person:${jobDetails.linkedInId}`,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: {
            text: `🚀 New Job Opening!\n\n🏢 ${jobDetails.companyName}\n💼 ${jobDetails.title}\n📍 ${jobDetails.location}\n\n${jobDetails.description}\n\n👉 Apply here: ${jobDetails.applyLink}`
          },
          shareMediaCategory: "NONE"
        }
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
      }
    };

    try {
      const response = await axios.post(postUrl, postData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        }
      });

      console.log("✅ Job posted successfully:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("🔴 Error posting job:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw new Error("Failed to post job on LinkedIn");
    }
  }
}
