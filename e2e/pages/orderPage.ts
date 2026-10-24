import { type Page } from "@playwright/test";

import { AddressDialog } from "./addressDialog.ts";

/**
 * A placed order: payment, fulfillment, tracking and addresses. Ported from the legacy
 * `OrdersPage` and its dialogs; the locators carry over, except that tracking now lives in
 * the timeline view of the order's lines, which is not the default.
 */
export class OrderPage {
  readonly addressDialog = new AddressDialog(this.page);

  readonly dialog = this.page.getByRole("dialog");

  readonly statusInfo = this.page.getByTestId("status-info");

  readonly markAsPaidButton = this.page.getByTestId("mark-as-paid-button");

  readonly transactionReferenceInput = this.page.getByTestId("transaction-reference-input");

  readonly paymentStatusBadges = this.page.getByTestId("payment-status-badges");

  readonly transactions = this.page.getByTestId("orderTransactionsList");

  readonly manualTransactionButton = this.page.getByTestId("captureManualTransactionButton");

  readonly transactionDescriptionInput = this.page.getByTestId("transactionDescription");

  readonly transactionAmountInput = this.page.getByTestId("transactAmountInput");

  readonly manualTransactionSubmit = this.page.getByTestId("manualTransactionSubmit");

  readonly fulfillButton = this.page.getByTestId("order-items-fulfill-button");

  readonly confirmFulfillmentButton = this.page.getByTestId("button-bar-confirm");

  readonly timelineView = this.page.getByTestId("order-items-view-timeline");

  readonly addTrackingButton = this.page.getByTestId("add-tracking-button");

  readonly trackingNumberInput = this.page.getByTestId("tracking-number-input");

  readonly confirmTrackingButton = this.page.getByTestId("confirm-tracking-number-button");

  readonly trackingNumber = this.page.getByTestId("tracking-number-set");

  readonly fulfillmentCard = this.page.getByTestId("fulfilled-order-section");

  readonly fulfillmentMenuButton = this.fulfillmentCard.getByTestId("fulfillment-menu-button");

  // The card's dropdown is portaled to the document body, so it is scoped to the open menu.
  readonly cancelFulfillmentMenuItem = this.page.getByRole("menu").getByTestId("cancel-fulfillment");

  readonly cancelFulfillmentWarehouse = this.dialog
    .getByTestId("cancel-fulfillment-select-field")
    .getByRole("combobox");

  // The picker's listbox is portaled outside the dialog, so it cannot be scoped to it.
  readonly warehouseOptions = this.page.getByRole("listbox").getByRole("option");

  readonly total = this.page.getByTestId("order-total");

  readonly shippingAddressSection = this.page.getByTestId("shipping-address-section");

  readonly billingAddressSection = this.page.getByTestId("billing-address-section");

  readonly editShippingAddressButton = this.page.getByTestId("edit-shipping-address");

  readonly editBillingAddressButton = this.page.getByTestId("edit-billing-address");

  constructor(readonly page: Page) {}

  async goto(orderId: string) {
    await this.page.goto(`/orders/${orderId}`);
    await this.statusInfo.waitFor();
  }

  async markAsPaid(reference: string) {
    await this.markAsPaidButton.click();
    await this.transactionReferenceInput.fill(reference);
    await this.dialog.getByTestId("submit").click();
    await this.dialog.waitFor({ state: "hidden" });
  }

  async captureManually({ description, amount }: { description: string; amount: number }) {
    await this.manualTransactionButton.click();
    await this.transactionDescriptionInput.fill(description);
    await this.transactionAmountInput.fill(amount.toFixed(2));
    await this.manualTransactionSubmit.click();
    await this.dialog.waitFor({ state: "hidden" });
  }

  /** Fulfills every line from the warehouses the fulfillment page proposes. */
  async fulfillAll() {
    await this.fulfillButton.click();
    await this.page.waitForURL(url => url.pathname.endsWith("/fulfill"));
    await this.confirmFulfillmentButton.click();
    await this.page.waitForURL(url => !url.pathname.endsWith("/fulfill"));
  }

  async addTracking(trackingNumber: string) {
    await this.timelineView.click();
    await this.addTrackingButton.click();
    await this.trackingNumberInput.fill(trackingNumber);
    await this.confirmTrackingButton.click();
    await this.dialog.waitFor({ state: "hidden" });
  }

  async cancelFulfillment() {
    // The fulfillment card only renders in the Timeline view; the default is Line matrix.
    await this.timelineView.click();
    await this.fulfillmentMenuButton.click();
    await this.cancelFulfillmentMenuItem.click();
    await this.dialog.waitFor();
    // The warehouse the fulfillment shipped from is pre-selected; one is chosen explicitly so
    // the restock choice is exercised. Any warehouse offered is valid.
    await this.cancelFulfillmentWarehouse.click();
    await this.warehouseOptions.first().click();
    await this.dialog.getByTestId("submit").click();
    await this.dialog.waitFor({ state: "hidden" });
  }

  /** The order total as a number - it is rendered without its currency. */
  async readTotal(): Promise<number> {
    return Number((await this.total.innerText()).trim());
  }
}
