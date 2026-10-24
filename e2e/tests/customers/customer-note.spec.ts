import { e2eConfig } from "../../config.ts";
import { expect, test } from "../../fixtures/test.ts";
import { CustomerPage } from "../../pages/customerPage.ts";
import { CUSTOMER, findCustomerId, ORDERS_SCENARIO } from "../../scenarios/orders.ts";

/**
 * Customer service staff can keep a note on a customer (ticket 06), the first e2e coverage
 * of the customers area. It runs as the `customer` actor, whose only permission is
 * MANAGE_USERS, because that is the staff member the story is about: the note has to be
 * writable without admin rights. The reload proves the note was persisted, not just held in
 * form state.
 */
test.use({ scenario: ORDERS_SCENARIO, actor: "customer" });

const config = e2eConfig();

test("customer service staff can save a note on a customer #e2e #customers", async ({
  page,
}) => {
  // Arrange
  const customerPage = new CustomerPage(page);
  const note = "Prefers delivery after 5pm";

  // Act & Assert
  await test.step("open the scenario customer", async () => {
    const customerId = await findCustomerId(config, CUSTOMER.email);

    await customerPage.goto(customerId);
    await expect(page).toHaveURL(url => url.pathname === `/customers/${customerId}`);
    await expect(customerPage.contactCard.getByTestId("customer-email")).toHaveValue(
      CUSTOMER.email,
    );
    await expect(customerPage.contactCard.getByTestId("customer-first-name")).toHaveValue(
      CUSTOMER.firstName,
    );
    await expect(customerPage.saveButton).toBeDisabled();
  });

  await test.step("write a note and save", async () => {
    await customerPage.writeNote(note);
    await expect(customerPage.saveButton).toBeEnabled();
    await customerPage.save();
    await expect(customerPage.notifications.getByText("Customer updated")).toBeVisible();
    await expect(customerPage.noteInput).toHaveValue(note);
    await expect(customerPage.saveButton).toBeDisabled();
  });

  await test.step("the note is still there after a reload", async () => {
    await page.reload();
    await customerPage.noteInput.waitFor();
    await expect(customerPage.noteInput).toHaveValue(note);
    // A clean form after a fresh load means the value came from the server.
    await expect(customerPage.saveButton).toBeDisabled();
  });
});
