// spec: specs/customer-note.md
// seed: e2e/tests/seed.spec.ts
import { expect, test } from "../../fixtures/test.ts";
import { CUSTOMER, ORDERS_SCENARIO } from "../../scenarios/orders.ts";

/**
 * A staff member who can only manage customers writes a note on a customer and saves it:
 * the note shows after saving and is still there after a reload.
 */
test.use({ scenario: ORDERS_SCENARIO, actor: "customer" });

test.describe("Customer note (customer-manager actor, orders scenario)", () => {
  test("Customer manager saves a note on a customer and it persists after reload #e2e", async ({
    page,
  }) => {
    // Arrange
    // 1. The "orders" scenario is restored and the browser is signed in as the customer manager
    const note = "Prefers a phone call before any order is shipped.";
    const searchInput = page.getByTestId("search-input");
    const gridCanvas = page.locator('[data-testid="data-grid-canvas"]');
    const rowAnchor = page.getByTestId("datagrid-row-anchor");
    const emailInput = page.getByTestId("customer-email");
    const firstNameInput = page.getByTestId("customer-first-name");
    const lastNameInput = page.getByTestId("customer-last-name");
    const noteInput = page.getByTestId("customer-note");
    const saveButton = page.getByTestId("button-bar-confirm");
    const notification = page.getByRole("region", { name: /Notifications/ }).getByRole("listitem");

    // Act & Assert
    // 2. Find the customer from the customers list
    await test.step("find the customer from the customers list", async () => {
      await page.goto("/customers/");
      await expect(searchInput).toBeVisible();
      await searchInput.fill(CUSTOMER.email);
      await expect(page).toHaveURL(new RegExp(`query=${encodeURIComponent(CUSTOMER.email)}`));
      // Glide renders its accessible table as <canvas> fallback content, which is never
      // rendered, so the grid cells are only reachable with includeHidden
      await expect(
        page.getByRole("gridcell", { name: CUSTOMER.email, exact: true, includeHidden: true }),
      ).toHaveCount(1);
      await expect(
        page.getByRole("gridcell", {
          name: `${CUSTOMER.firstName} ${CUSTOMER.lastName}`,
          exact: true,
          includeHidden: true,
        }),
      ).toHaveCount(1);
    });

    // 3. Open the customer
    await test.step("open the customer", async () => {
      const box = await gridCanvas.boundingBox();

      if (!box) {
        throw new Error("the customers datagrid canvas is not rendered");
      }

      // Glide draws rows on a canvas under an overlay; hovering the single row reveals its link
      await page.mouse.move(box.x + 200, box.y + box.height - 20);
      await rowAnchor.click();
      await page.waitForURL(url => /\/customers\/[^/]+$/.test(url.pathname));
      await expect(page).toHaveTitle(new RegExp(CUSTOMER.email.replace(/\./g, "\\.")));
      await expect(emailInput).toHaveValue(CUSTOMER.email);
      await expect(firstNameInput).toHaveValue(CUSTOMER.firstName);
      await expect(lastNameInput).toHaveValue(CUSTOMER.lastName);
      await expect(noteInput).toBeEditable();
      await expect(saveButton).toBeDisabled();
    });

    // 4. Write a note and save
    await test.step("write a note and save", async () => {
      await noteInput.fill(note);
      await expect(saveButton).toBeEnabled();
      await saveButton.click();
      await expect(notification).toHaveCount(1);
      await expect(notification).toContainText("Success");
      await expect(notification).toContainText("Customer updated");
    });

    // 5. The note field shows the new note
    await test.step("the note field shows the new note", async () => {
      await expect(noteInput).toHaveValue(note);
      await expect(saveButton).toBeDisabled();
    });

    // 6. The note survives a reload
    await test.step("the note survives a reload", async () => {
      await page.reload();
      await expect(noteInput).toBeVisible();
      await expect(noteInput).toHaveValue(note);
      await expect(emailInput).toHaveValue(CUSTOMER.email);
      await expect(saveButton).toBeDisabled();
    });
  });
});
