import { test, expect, APIResponse, APIRequestContext } from "@playwright/test";

// Define an interface for the token data object of request token response
interface TokenData {
	token_type: string;
	expires_in: number;
	access_token: string;
}
// Define an interface for the complete response object of request token response
interface TokenResponse {
	data: TokenData;
	meta: {
		message: string;
	};
}

// Define an interface for the sim object within sims array of create order response
interface SimDetails {
	id: string;
	created_at: string;
	iccid: string;
	matching_id: string;
	is_roaming: boolean;
}

// Define an interface for the main data object of create order response
interface OrderData {
	currency: string;
	package_id: string;
	quantity: number;
	description: string;
	esim_type: string;
	validity: number;
	data: string;
	manual_installation: string;
	sims: SimDetails[];
}

// Define an interface for the complete response object of create order response
interface CreateOrderResponse {
	data: OrderData;
	meta: {
		message: string;
	};
}

// Define an interface for the complete response object of get esim response
interface GetEsimResponse {
	data: SimDetails[];
	links: {
		first: string;
		last: string;
		next: string;
	};
	meta: {
		message: string;
		current_page: number;
		path: string;
		per_page: string;
		total: number;
	};
}

const baseURL = "https://sandbox-partners-api.airalo.com/v2";

async function getAccessToken(request: APIRequestContext): Promise<string> {
	const storedToken = process.env.ACCESS_TOKEN;
	if (storedToken) {
		console.log("Using stored access token: ", storedToken);
		return storedToken;
	}
	const clientId = process.env.CLIENT_ID; // Ensure you have this environment variable set
	const clientSecret = process.env.CLIENT_SECRET; // Ensure you have this environment variable set

	expect(clientId, "CLIENT_ID environment variable must be set").toBeDefined();
	expect(
		clientSecret,
		"CLIENT_SECRET environment variable must be set"
	).toBeDefined();
	const tokenResponse: APIResponse = await request.post(`${baseURL}/token`, {
		headers: {
			Accept: "application/json",
		},
		form: {
			client_id: clientId!,
			client_secret: clientSecret!,
			grant_type: "client_credentials",
		},
	});
	expect(tokenResponse.ok()).toBeTruthy();
	const tokenResponseBody: TokenResponse = await tokenResponse.json();
	expect(tokenResponseBody.data).toHaveProperty("access_token");
	const accessToken = tokenResponseBody.data.access_token;
	// To store this token in an environment variable
	// for subsequent test runs to avoid hitting the token endpoint too often.
	process.env.ACCESS_TOKEN = accessToken;

	return accessToken;
}

test.describe("API response validation for order creation", () => {
	let response: APIResponse;
	let responseBody: CreateOrderResponse;

	test.beforeAll(async ({ request }) => {
		const accessToken = await getAccessToken(request);

		response = await request.post(`${baseURL}/orders`, {
			headers: {
				Accept: "application/json",
				Authorization: `Bearer ${accessToken}`,
			},
			form: {
				package_id: "kallur-digital-7days-1gb",
				quantity: "6",
				description: "This is a test order for 6 eSIMs",
			},
		});
		responseBody = await response.json();
	});

	test("should return a 200 ok status", async () => {
		expect(response.status()).toBe(200);
		expect(response.ok()).toBeTruthy();
	});

	test("should have expected properties", async () => {
		expect(responseBody).toHaveProperty("data");
		expect(responseBody).toHaveProperty("meta");
	});

	test("should validate the meta object", async () => {
		expect(typeof responseBody.meta.message).toBe("string");
		expect(responseBody.meta.message).toBe("success");
	});

	test("should validate the data object properties and types", async () => {
		const data = responseBody.data;
		expect(data).toHaveProperty("currency");
		expect(typeof data.currency).toBe("string");
		expect(data.currency).toBe("USD"); // Specific value check

		expect(data).toHaveProperty("package_id");
		expect(typeof data.package_id).toBe("string");
		expect(data.package_id).toBe("kallur-digital-7days-1gb"); // Specific value check

		expect(data).toHaveProperty("quantity");
		expect(typeof data.quantity).toBe("number");
		expect(data.quantity).toBe(6); // Specific value check

		expect(data).toHaveProperty("description");
		expect(typeof data.description).toBe("string");
		expect(data.description).toBe("This is a test order for 6 eSIMs"); // Specific value check

		expect(data).toHaveProperty("esim_type");
		expect(typeof data.esim_type).toBe("string");
		expect(data.esim_type).toBe("Prepaid"); // Specific value check

		expect(data).toHaveProperty("validity");
		expect(typeof data.validity).toBe("number");
		expect(data.validity).toBe(7); // Specific value check

		expect(data).toHaveProperty("data");
		expect(typeof data.data).toBe("string");
		expect(data.data).toBe("1 GB"); // Specific value check

		// For HTML strings we can check for specific strings
		expect(typeof data.manual_installation).toBe("string");
		expect(data.manual_installation).toContain("eSIM name:");
		expect(data.manual_installation).toContain("To manually activate");
	});

	test("should validate the sims array and its first element", async () => {
		const sims = responseBody.data.sims;
		expect(Array.isArray(sims)).toBeTruthy();
		expect(sims.length).toEqual(6); // Expect at 6 SIMs

		const firstSim = sims[0];
		expect(firstSim).toHaveProperty("id");
		expect(typeof firstSim.id).toBe("number");

		expect(firstSim).toHaveProperty("created_at");
		expect(typeof firstSim.created_at).toBe("string");

		expect(firstSim).toHaveProperty("iccid");
		expect(typeof firstSim.iccid).toBe("string");

		expect(firstSim).toHaveProperty("matching_id");
		expect(typeof firstSim.matching_id).toBe("string");
		expect(firstSim.matching_id).toBe("TEST"); // Specific value check

		expect(firstSim).toHaveProperty("is_roaming");
		expect(typeof firstSim.is_roaming).toBe("boolean");
	});
});

test.describe("API response validation for getting a list of esims", () => {
	let response: APIResponse;
	let responseBody: GetEsimResponse;
	test.beforeAll(async ({ request }) => {
		const accessToken = await getAccessToken(request);
		response = await request.get(`${baseURL}/sims`, {
			headers: {
				Accept: "application/json",
				Authorization: `Bearer ${accessToken}`,
			},
			// No form data needed for GET request. There are optional parameters
			// that can be passed, but they are not mandatory
		});
		responseBody = await response.json();
	});
	test("should return a 200 ok status", async () => {
		expect(response.status()).toBe(200);
		expect(response.ok()).toBeTruthy();
	});

	test("should have expected properties", async () => {
		expect(responseBody).toHaveProperty("data");
		expect(responseBody).toHaveProperty("links");
		expect(responseBody).toHaveProperty("meta");
	});

	test("should validate the sim details array", async () => {
		expect(Array.isArray(responseBody.data)).toBe(true);
		expect(responseBody.data.length).toBeGreaterThan(0);
		responseBody.data.forEach((sim: SimDetails) => {
			expect(sim).toHaveProperty("id");
			expect(typeof sim.id).toBe("number");
			expect(sim).toHaveProperty("created_at");
			expect(typeof sim.created_at).toBe("string");
			expect(sim).toHaveProperty("iccid");
			expect(typeof sim.iccid).toBe("string");
			expect(sim).toHaveProperty("matching_id");
			expect(typeof sim.matching_id).toBe("string");
			expect(sim).toHaveProperty("is_roaming");
			expect(typeof sim.is_roaming).toBe("boolean");
		});
	});

	test("should validate the links object", async () => {
		expect(responseBody.links).toHaveProperty("first");
		expect(typeof responseBody.links.first).toBe("string");
		expect(responseBody.links.first).toContain(`${baseURL}/sims?page=1`); // Specific URL check

		expect(responseBody.links).toHaveProperty("last");
		expect(typeof responseBody.links.last).toBe("string");
		expect(responseBody.links.last).toContain(`${baseURL}/sims?page=`); // Specific URL check

		expect(responseBody.links).toHaveProperty("next");
		expect(typeof responseBody.links.next).toBe("string");
		expect(responseBody.links.next).toContain(`${baseURL}/sims?page=2`); // Specific URL check
	});

	test("should validate the meta object", async () => {
		expect(typeof responseBody.meta.message).toBe("string");
		expect(responseBody.meta.message).toBe("success");
		expect(typeof responseBody.meta.current_page).toBe("number");
		expect(responseBody.meta.current_page).toBe(1); // Specific value check
		expect(typeof responseBody.meta.path).toBe("string");
		expect(responseBody.meta.path).toBe(`${baseURL}/sims`); // Specific path check
		expect(typeof responseBody.meta.per_page).toBe("string");
		expect(responseBody.meta.per_page).toBe("25"); // Specific value check
		expect(typeof responseBody.meta.total).toBe("number");
	});
});
