import passport from "passport";
import { Strategy as LinkedInStrategy } from "passport-linkedin-oauth2";
import { User, UserRole } from "../entity/User";
import { AppDataSource } from "../data-source";
import dotenv from "dotenv";

dotenv.config();

interface LinkedInProfile {
  id: string;
  displayName: string;
  emails?: Array<{ value: string }>;
  photos?: Array<{ value: string }>;
  provider: string;
  _json: any;
}

passport.use(
  new LinkedInStrategy(
    {
      clientID: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
      callbackURL: process.env.LINKEDIN_REDIRECT_URI!,
      scope: ["openid", "profile", "email", "w_member_social"],
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: LinkedInProfile,
      done: (error: any, user?: Express.User | false) => void
    ) => {
      try {
        const userRepo = AppDataSource.getRepository(User);
        let user = await userRepo.findOne({
          where: { linkedInId: profile.id },
        });

        if (!user) {
          user = userRepo.create({
            linkedInId: profile.id,
            name: profile.displayName,
            email: profile.emails?.[0]?.value ?? undefined, // ✅ Fix: Use undefined instead of null
            linkedInAccessToken: accessToken,
            role: UserRole.EMPLOYER,
          });
          await userRepo.save(user);
        } else {
          user.linkedInAccessToken = accessToken;
          await userRepo.save(user);
        }

        return done(null, user);
      } catch (error) {
        console.error("LinkedIn Auth Error:", error);
        return done(error, false);
      }
    }
  )
);

// **Serialize User**
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// **Deserialize User**
passport.deserializeUser(async (id: string, done) => {
  try {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id } });
    done(null, user || null);
  } catch (error) {
    console.error("Deserialize Error:", error);
    done(error, null);
  }
});

export { passport };
