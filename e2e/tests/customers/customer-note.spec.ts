import { expect, test } from "../../fixtures/test.ts";
import { CustomerDetailsPage } from "../../pages/customerDetailsPage.ts";
import { CustomerListPage } from "../../pages/customerListPage.ts";
import { CUSTOMER, ORDERS_SCENARIO } from "../../scenarios/orders.ts";

/**
 * Ticket 06: a staff member holding only the customer-management permission (MANAGE_USERS)
 * finds a customer through the Customers list search, opens her details, writes a note in
 * the Contact card and saves it. The note shows after saving and is still there after a
 * reload. The customer is reached through the search rather than a URL because her id
 * changes with every build of the dump.
 */
test.use({ scenario: ORDERS_SCENARIO, actor: "customer" });

test.describe("Customer note", () => {
  test("Customer manager saves a note on a customer #e2e", async ({ page }) => {
    // Arrange
    // A fixed note is enough: the database is restored before the test.
    const note = "Prefers delivery after 5pm";
    const customerList = new CustomerListPage(page);
    const customerDetails = new CustomerDetailsPage(page);

    // Act & Assert
    await test.step("the customer manager finds the customer by email", async () => {
      await customerList.goto();
      await customerList.search(CUSTOMER.email);

      await expect(customerList.cell(CUSTOMER.email)).toBeAttached();
      await expect(customerList.cell(`${CUSTOMER.firstName} ${CUSTOMER.lastName}`)).toBeAttached();
      // The header row plus exactly one body row.
      await expect(customerList.rows).toHaveCount(2);
    });

    await test.step("opening the customer shows her details", async () => {
      await customerList.openFirstRow();

      await expect(customerDetails.emailInput).toHaveValue(CUSTOMER.email);
      await expect(customerDetails.firstNameInput).toHaveValue(CUSTOMER.firstName);
      await expect(customerDetails.lastNameInput).toHaveValue(CUSTOMER.lastName);
      // The scenario sets no note, so the later assertion proves the save, not seed data.
      await expect(customerDetails.noteInput).toHaveValue("");
      await expect(customerDetails.noteInput).toBeEditable();
      await expect(customerDetails.saveButton).toBeDisabled();
    });

    await test.step("writing a note and saving shows the new note", async () => {
      await customerDetails.fillNote(note);

      await expect(customerDetails.unsavedChanges).toHaveText("Unsaved changes: details");
      await expect(customerDetails.saveButton).toBeEnabled();

      await customerDetails.save();

      await expect(customerDetails.updatedNotification).toBeVisible();
      await expect(customerDetails.unsavedChanges).toBeHidden();
      await expect(customerDetails.noteInput).toHaveValue(note);
    });

    await test.step("the note survives a reload", async () => {
      await customerDetails.reload();

      await expect(customerDetails.emailInput).toHaveValue(CUSTOMER.email);
      await expect(customerDetails.noteInput).toHaveValue(note);
      await expect(customerDetails.saveButton).toBeDisabled();
    });
  });
});
