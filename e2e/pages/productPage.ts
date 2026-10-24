import { type Page } from "@playwright/test";

type ProductUpdateResponse = {
  data: { productUpdate: { errors: unknown[] } };
};

/**
 * A product's details page: its general settings and the save bar. The header shows the
 * saved product, not the form, so it changes only after a save is refetched.
 */
export class ProductPage {
  readonly generalSettings = this.page.getByTestId("product-general-settings");

  readonly nameInput = this.page.getByRole("textbox", { name: "Name", exact: true });

  readonly pageHeader = this.page.getByTestId("page-header");

  readonly saveButton = this.page.getByTestId("button-bar-confirm");

  /** The check the save button shows for a few seconds after a successful save. */
  readonly saveSuccess = this.saveButton.getByTestId("button-success");

  constructor(readonly page: Page) {}

  async goto(productId: string) {
    await this.page.goto(`/products/${productId}`);
    await this.generalSettings.waitFor();
  }

  /**
   * Clicks Save and resolves with the `ProductUpdate` errors once the save has finished:
   * immediately when it failed, otherwise once the save button shows its success state.
   */
  async save(): Promise<unknown[]> {
    const productUpdate = this.page.waitForResponse(
      response =>
        response.request().method() === "POST" &&
        response.request().postDataJSON()?.operationName === "ProductUpdate",
    );

    await this.saveButton.click();

    const body: ProductUpdateResponse = await (await productUpdate).json();
    const { errors } = body.data.productUpdate;

    if (errors.length === 0) {
      await this.saveSuccess.waitFor();
    }

    return errors;
  }
}
