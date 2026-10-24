import { e2eConfig } from "../../config.ts";
import { expect, test } from "../../fixtures/test.ts";
import { CustomerPage } from "../../pages/customerPage.ts";
import { findCustomerId, ORDERS_SCENARIO } from "../../scenarios/orders.ts";

/**
 * Customer service keeps notes on a customer's record, and the people who write them hold
 * only the customer-management permission - so the story runs as that staff user, not the
 * superuser, on the orders scenario's customer.
 */
test.use({ scenario: ORDERS_SCENARIO, actor: "customer" });

const config = e2eConfig();

test("Customer-management staff saves a note on a customer #e2e", async ({ page }) => {
  // Arrange
  const customerPage = new CustomerPage(page);
  const note = "VIP, call before cancelling";

  await customerPage.goto(await findCustomerId(config));

  // Act & Assert
  await test.step("write a note and save the page", async () => {
    await customerPage.saveNote(note);
    await expect(customerPage.noteInput).toHaveValue(note);
  });

  await test.step("the note is saved on the customer", async () => {
    await page.reload();
    await expect(customerPage.noteInput).toHaveValue(note);
  });
});
