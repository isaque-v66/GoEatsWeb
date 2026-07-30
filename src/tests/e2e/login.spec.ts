import { test, expect } from "@playwright/test"

test.describe("Login E2E", () => {
  test("deve fazer login com sucesso", async ({
    page,
  }) => {
    await page.goto("/login")

  await page
    .getByPlaceholder("you@company.com")
    .fill("teste@goeats.com")

  await page
    .getByPlaceholder("Enter your password")
    .fill("123456")

  // await page.screenshot({
  //   path: "antes-do-login.png",
  //   fullPage: true,
  // })

  await page.getByRole("button", {
    name: /entrar/i,
  }).click()

  await page.pause()

  await expect(page).toHaveURL(/dashboard/, {
    timeout: 60000
  })
  })

  test("deve exibir erro de email inexistente", async ({
    page,
  }) => {
    await page.goto("/login")

    await page
      .getByPlaceholder("you@company.com")
      .fill("naoexiste@email.com")

    await page
      .getByPlaceholder("Enter your password")
      .fill("123456")

    await page.getByRole("button", {
      name: /entrar/i,
    }).click()

    await expect(
      page.locator(".text-red-600")
    ).toBeVisible()
  })

  test("deve exibir erro de senha inválida", async ({
    page,
  }) => {
    await page.goto("/login")

    await page
      .getByPlaceholder("you@company.com")
      .fill("teste@goeats.com")

    await page
      .getByPlaceholder("Enter your password")
      .fill("senhaerrada")

    await page.getByRole("button", {
      name: /entrar/i,
    }).click()

    await page.pause()

    await expect(
      page.locator(".text-red-600")
    ).toBeVisible()
  })
})