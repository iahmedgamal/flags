import { test, expect } from "@playwright/test";

async function setupPlayer(page: import("@playwright/test").Page) {
  // Create player via API
  const res = await page.request.post("/api/players", {
    data: { displayName: "TestBot", avatar: "😎" },
  });
  const player = await res.json();

  // Set localStorage so the app recognizes the player
  await page.addInitScript((id: string) => {
    localStorage.setItem("flags_player_id", id);
  }, player.id);
}

test.describe("Home page", () => {
  test.beforeEach(async ({ page }) => {
    await setupPlayer(page);
  });

  test("should show title and play button", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("🌍 Flags")).toBeVisible();
    await expect(page.getByRole("button", { name: "Play" })).toBeVisible();
  });

  test("should navigate to game on play click", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Play" }).click();

    await expect(page).toHaveURL("/play");
  });
});

test.describe("Game flow", () => {
  test.beforeEach(async ({ page }) => {
    await setupPlayer(page);
  });

  test("should show flag, timer, and 4 options", async ({ page }) => {
    await page.goto("/play?fast=1");

    // Wait for questions to load
    await expect(page.getByText("What's the capital?")).toBeVisible();

    // Should show question counter
    await expect(page.getByText("1 / 40")).toBeVisible();

    // Should show timer
    await expect(page.getByText("7s")).toBeVisible();

    // Should show 4 answer buttons (plus the disabled state buttons in the grid)
    const options = page.locator("button").filter({ hasNotText: "Score" });
    await expect(options).toHaveCount(4);
  });

  test("should render flag as Twemoji image with country name", async ({ page }) => {
    await page.goto("/play?fast=1");
    await expect(page.getByText("What's the capital?")).toBeVisible();

    // Flag should be an <img> loading from Twemoji CDN
    const flagImg = page.locator("img[src*='cdn.jsdelivr.net']");
    await expect(flagImg).toBeVisible();
    await expect(flagImg).toHaveAttribute("src", /twemoji.*\.svg$/);

    // Country name should appear near the flag
    const countryName = page.locator("img[src*='cdn.jsdelivr.net'] + span");
    await expect(countryName).toBeVisible();
    await expect(countryName).not.toHaveText("");
  });

  test("should advance to next question after answering", async ({ page }) => {
    await page.goto("/play?fast=1");
    await expect(page.getByText("1 / 40")).toBeVisible();

    // Click the first option
    const buttons = page.locator("button").filter({ hasNotText: "Score" });
    await buttons.first().click();

    // Wait for next question
    await expect(page.getByText("2 / 40")).toBeVisible({ timeout: 3000 });
  });

  test("should show correct answer in green after selection", async ({ page }) => {
    await page.goto("/play?fast=1");
    await expect(page.getByText("What's the capital?")).toBeVisible();

    // Click first option
    const buttons = page.locator("button").filter({ hasNotText: "Score" });
    await buttons.first().click();

    // One button should have green background (correct answer)
    const greenButton = page.locator("button.bg-emerald-600");
    await expect(greenButton).toBeVisible();
  });

  test("should auto-advance when timer runs out", async ({ page }) => {
    await page.goto("/play?fast=1");
    await expect(page.getByText("1 / 40")).toBeVisible();

    // Wait for timer to expire (7s + 1s transition)
    await expect(page.getByText("2 / 40")).toBeVisible({ timeout: 10_000 });
  });

  test("should complete game and show results", async ({ page }) => {
    // Play a fast game — click first option for all 40 questions
    await page.goto("/play?fast=1");
    await expect(page.getByText("What's the capital?")).toBeVisible();

    for (let i = 0; i < 40; i++) {
      const buttons = page.locator(
        "button:not([disabled])"
      ).filter({ hasNotText: "Score" });
      await buttons.first().click();

      if (i < 39) {
        // Wait for next question
        await expect(
          page.getByText(`${i + 2} / 40`)
        ).toBeVisible({ timeout: 3000 });
      }
    }

    // Should navigate to results
    await expect(page).toHaveURL("/results", { timeout: 5000 });
  });
});

test.describe("Results page", () => {
  test.beforeEach(async ({ page }) => {
    await setupPlayer(page);
  });

  test("should show score, correct count, streak, time, and continent breakdown", async ({ page }) => {
    // Play a quick game
    await page.goto("/play?fast=1");
    await expect(page.getByText("What's the capital?")).toBeVisible();

    for (let i = 0; i < 40; i++) {
      const buttons = page.locator(
        "button:not([disabled])"
      ).filter({ hasNotText: "Score" });
      await buttons.first().click();

      if (i < 39) {
        await expect(
          page.getByText(`${i + 2} / 40`)
        ).toBeVisible({ timeout: 3000 });
      }
    }

    await expect(page).toHaveURL("/results", { timeout: 5000 });

    // Should show stats
    await expect(page.getByText("Score")).toBeVisible();
    await expect(page.getByText("Correct", { exact: true })).toBeVisible();
    await expect(page.getByText("Best Streak")).toBeVisible();
    await expect(page.getByText("Time")).toBeVisible();

    // Should show continent breakdown
    await expect(
      page.getByText("How well do you know each continent?")
    ).toBeVisible();
    await expect(page.getByText("Africa")).toBeVisible();

    // Should show play again and home buttons
    await expect(page.getByRole("button", { name: "Play Again" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Home" })).toBeVisible();
  });

  test("should navigate back to game on play again", async ({ page }) => {
    await page.goto("/play?fast=1");
    await expect(page.getByText("What's the capital?")).toBeVisible();

    for (let i = 0; i < 40; i++) {
      const buttons = page.locator(
        "button:not([disabled])"
      ).filter({ hasNotText: "Score" });
      await buttons.first().click();

      if (i < 39) {
        await expect(
          page.getByText(`${i + 2} / 40`)
        ).toBeVisible({ timeout: 3000 });
      }
    }

    await expect(page).toHaveURL("/results", { timeout: 5000 });
    await page.getByRole("button", { name: "Play Again" }).click();
    await expect(page).toHaveURL("/play");
  });
});
