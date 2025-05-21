import { type Locator, type Page } from "@playwright/test";

export class HomePage {
	readonly page: Page;
	readonly privacyWindow: Locator;
	readonly privacyAcceptButton: Locator;
	readonly dontAllowButton: Locator;
	readonly searchInput: Locator;
	readonly firstEsimPackage: Locator;
	readonly operatorTitle: Locator;
	readonly coverageValue: Locator;
	readonly dataValue: Locator;
	readonly validityValue: Locator;
	readonly priceValue: Locator;

	constructor(page: Page) {
		this.page = page;
		this.privacyWindow = page.locator("#onetrust-group-container");
		this.privacyAcceptButton = page.getByRole("button", { name: "ACCEPT" });
		this.dontAllowButton = page.getByRole("button", { name: "DON'T ALLOW" });
		this.searchInput = page.getByTestId("search-input");
		this.firstEsimPackage = page
			.getByRole("link", {
				name: "VALIDITY 7 Days",
			})
			.getByRole("button", { name: "BUY NOW" });
		this.operatorTitle = page.getByTestId("sim-detail-operator-title");
		this.coverageValue = page
			.getByTestId("sim-detail-info-list")
			.getByTestId("COVERAGE-value");
		this.dataValue = page
			.getByTestId("sim-detail-info-list")
			.getByTestId("DATA-value");
		this.validityValue = page
			.getByTestId("sim-detail-info-list")
			.getByTestId("VALIDITY-value");
		this.priceValue = page
			.getByTestId("sim-detail-info-list")
			.getByTestId("PRICE-value");
	}

	async navigateToAiralo() {
		await this.page.goto("/");
	}

	async acceptPrivacyPolicy() {
		try {
			await this.privacyWindow.waitFor({ state: "visible" });
			await this.privacyAcceptButton.click();
			await this.page.waitForTimeout(1000); // Wait for 1 seconds to ensure the privacy window is closed
		} catch (error) {
			console.error("Privacy window not found or already accepted", error);
		}
	}

	async dontAllowPushNotifications() {
		const buttonIsVisible = await this.dontAllowButton.isVisible();
		if (buttonIsVisible) {
			await this.dontAllowButton.click();
		} else {
			console.log(
				"Push notifications dont allow button is not visible. Proceeding with other tests."
			);
		}
	}

	async searchForCountry(country: string) {
		try {
			await this.searchInput.fill(country);
			await this.page
				.getByRole("listitem")
				.filter({ hasText: country })
				.click();
		} catch (error) {
			console.error(`Error selecting country: ${country}`, error);
			throw new Error(`Country ${country} not found`);
		}
	}

	async selectFirstEsimPackage() {
		await this.firstEsimPackage.click();
	}
}
