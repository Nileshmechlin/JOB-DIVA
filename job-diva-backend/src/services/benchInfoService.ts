import puppeteer from "puppeteer";

interface JobDetails {
  title: string;
  description: string;
  companyName: string;
  location: string;

  employmentType: string;
  workAuth: string;
  remote?: boolean;
}

export class BenchInfoService {
    private static BENCHINFO_LOGIN_URL = "https://www.benchinfo.com/employer/auth/login";
    private static BENCHINFO_JOB_POST_URL = "https://www.benchinfo.com/employer/jobpost";
    private static EMAIL = "nilesh.vijay@mechlintechnologies.com";
    private static PASSWORD = "Nil@esh2025";
  
    public static async postJobOnBenchInfo(jobDetails: JobDetails): Promise<void> {
      const browser = await puppeteer.launch({ headless: false });
      const page = await browser.newPage();
  
      try {
        console.log("🔹 Logging into BenchInfo...");

        await page.goto(this.BENCHINFO_LOGIN_URL, { waitUntil: "networkidle2" }); // Wait for the network to be idle
    
        // Debugging: Take a screenshot of the page after loading
        await page.screenshot({ path: 'benchinfo_login_page.png' });
    
        // Wait for the login section to be available
        await page.waitForSelector("#mm-0 > section.our-log-reg.bgc-fa", { timeout: 15000 });
    
        // Wait for the email input to be available
        await page.waitForSelector("#login", { timeout: 15000 }); // Updated selector to match the HTML
        await page.type("#login", this.EMAIL); // Updated to use the correct ID
    
        // Wait for the password input to be available
        await page.waitForSelector("#password", { timeout: 15000 });
        await page.type("#password", this.PASSWORD);
    
        // Click the submit button
        await page.click("button[type='submit']"); 
        await page.waitForNavigation({ waitUntil: "networkidle2" });
    
        console.log("✅ Login successful!");
        console.log("🔹 Navigating to job posting page...");
        await page.goto(this.BENCHINFO_JOB_POST_URL, { waitUntil: "networkidle2" });
        
        // Wait for the job form section to be available
        await page.waitForSelector("#mm-0 > section > div > div > div.col-sm-12.col-lg-8.col-xl-9 > div > div > form", { timeout: 10000 });
        
        // Wait for the title input to be available
        await page.waitForSelector("#title", { timeout: 10000 });
        await page.type("#title", jobDetails.title);
        
        // Wait for the location input to be available
        await page.waitForSelector("#search_data-tokenfield", { timeout: 10000 }); // Correct selector
        
        // Debugging: Take a screenshot before typing into the location field
        await page.screenshot({ path: 'before_typing_location.png' });
        
        // Ensure the input field is visible
        const isVisible = await page.evaluate(() => {
            const element = document.querySelector("#search_data-tokenfield") as HTMLElement;
            return element ? element.offsetWidth > 0 && element.offsetHeight > 0 : false;
        });

        if (isVisible) {
            await page.type("#search_data-tokenfield", jobDetails.location); // Type the location
        } else {
            console.error("❌ The location input field is not visible.");
        }
        
        // Ensure the input field is visible
      
  
        if (jobDetails.remote) {
          await page.click("#remote-checkbox");
        }
        if (jobDetails.employmentType === "Direct Hire") {
          await page.click("input[type='checkbox'][value='7']"); // Selector for Direct Hire checkbox
      } else if (jobDetails.employmentType === "Contract") {
          await page.click("input[type='checkbox'][value='1']"); // Selector for Contract checkbox
      } else {
          console.warn("⚠️ Invalid employment type specified!");
      }
      await page.waitForSelector('input[name="workauth"]', { timeout: 10000 });
      await page.type('input[name="workauth"]', jobDetails.workAuth);
      
       // Get the iframe element
// ... existing code ...
const frameHandle = await page.$("#jobdesc_ifr");

if (frameHandle) {
    const frame = await frameHandle.contentFrame();

    if (frame) {
        // Wait for the body element in the iframe to be ready
        await frame.waitForSelector("body", { visible: true });

        // Set the job description inside the TinyMCE editor
        await frame.evaluate((description) => {
            document.body.innerHTML = description;
        }, jobDetails.description);
    } else {
        console.error("❌ Could not retrieve the content frame from the iframe.");
    }
} else {
    console.error("❌ The iframe with selector '#jobdesc_ifr' was not found.");
}
// ... existing code ...

  
        const promotedCheckbox = await page.$("#promoted-job-checkbox");
        if (promotedCheckbox) {
          console.log("🔹 Selecting Promoted Job Posting...");
          await promotedCheckbox.click();
        } else {
          console.warn("⚠️ Could not find Promoted Job Posting checkbox!");
        }
        await page.waitForSelector("button[type='submit']", { timeout: 10000 });
        await page.click("button[type='submit']");
        
  
        console.log("🎉 Job posted successfully on BenchInfo!");
      } catch (error) {
        console.error("❌ Error posting job on BenchInfo:", error);
      } finally {
        await browser.close();
      }
    }
  }
  