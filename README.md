# Airalo Playwright Tests using Typescript

This project contains automated **UI and API tests** for the Airalo platform using [Playwright](https://playwright.dev/).

> Designed for maintainability, speed, and CI/CD integration.

---

## 📁 Project Structure

```
airalo/
|__pages/
    |__homepage.ts                  #Objects & Methods for ui-tests
|__tests/
    |__api-automation-test.spec.ts  #Tests for the api endpoints as per the task
    |__ui-automation-test.spec.ts   #Tests for the ui as per the task
```

---

## Getting Started

### 1. Clone and install dependencies

```bash
git clone https://github.com/rokinsubhasish/airalo.git
cd airalo
npm install
```

---

### 2. Configure Environment Variables

In the root directory of the project (where your package.json is), create a file named `.env` and paste the below:

```
CLIENT_ID=your_client_id
CLIENT_SECRET=your_client_secret
```

NOTE: Above is mandate for API test authentication.

---

## Running the Playwright Tests

### Run all tests (UI + API)

```bash
npm test
```

### Run only API tests

```bash
npx playwright test api-automation-test.spec.ts
```

### Run only UI tests

```bash
npx playwright test ui-automation-test.spec.ts
```

### View the latest report

```bash
npx playwright show-report
```

---

## GitHub Actions Integration

Run tests automatically on every push to `main`.

![CI](https://github.com/rokinsubhasish/airalo/actions/workflows/playwright.yml/badge.svg)

You’ll find the workflow config in:

```
.github/workflows/playwright.yml
```

---

## 🧱 Technologies Used

- [Playwright](https://playwright.dev/)
- TypeScript
- GitHub Actions (CI)
- Node.js 22.14
- EsLint

---

## References

API access provided by the [Airalo Partner Sandbox](https://www.airalo.com/partners).
