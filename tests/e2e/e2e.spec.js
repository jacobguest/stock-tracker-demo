const { test, expect } = require("@playwright/test");

test("Full stock tracker flow", async ({ page }) => {
    await page.goto("http://localhost");

    await page.click("text=View All Saved Apple Stock Prices");

    await page.waitForSelector("text=No saved prices yet.");

    await page.click("text=Save Latest Apple Stock Price");
    
    await page.waitForSelector("text=Saved latest price for AAPL.");

    await page.click("text=View All Saved Apple Stock Prices");

    await page.waitForSelector("table");

    const rows = await page.locator("tbody tr").count();
    expect(rows).toBeGreaterThan(0);
});
