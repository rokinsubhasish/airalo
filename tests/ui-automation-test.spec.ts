import { test, expect } from "@playwright/test";
import { HomePage } from "../pages/homepage";

test("purchase Japan esim package", async ({ browser }) => {
	// Launch a new browser context
	const context = await browser.newContext({
		viewport: { width: 1280, height: 720 },
	});
	const page = await context.newPage();
	const homePage = new HomePage(page);

	// Navigate to the Airalo homepage
	await homePage.navigateToAiralo();

	// Accept the privacy policy if the window is visible
	await homePage.acceptPrivacyPolicy();

	// Dismiss the push notifications if the button is visible
	await homePage.dontAllowPushNotifications();

	// Expect the title to contain "Airalo"
	await expect(page).toHaveTitle("Buy eSIMs for international travel - Airalo");

	// Search for the country "Japan". We can also parametrize this test to search for different countries
	await homePage.searchForCountry("Japan");

	// Select the first eSIM package
	await homePage.selectFirstEsimPackage();

	// Verify the package details
	await expect(homePage.operatorTitle).toHaveText("Moshi Moshi");
	await expect(homePage.coverageValue).toHaveText("Japan");
	await expect(homePage.dataValue).toHaveText("1 GB");
	await expect(homePage.validityValue).toHaveText("7 Days");
	let price: string;
	const isCI = process.env.CI === "true";
	if (isCI) {
		price = "$4.50 USD";
	} else {
		price = "4.50 €";
	}
	await expect(homePage.priceValue).toHaveText(price);

	// Close the browser context
	await context.close();
	// Close the browser
	await browser.close();
});
