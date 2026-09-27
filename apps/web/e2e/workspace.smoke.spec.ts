import { expect, test } from "@playwright/test";

test("workspace boot page renders", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Workspace đã sẵn sàng/i })).toBeVisible();
});
