import { StrategyOption } from "passport-linkedin-oauth2";

declare module "passport-linkedin-oauth2" {
  interface LinkedInStrategyOptions extends StrategyOption {
    state?: boolean;
  }
} 