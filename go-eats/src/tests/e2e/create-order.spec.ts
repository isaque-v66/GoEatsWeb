import { test, expect } from "@playwright/test"

test.describe("Create Order E2E", () => {
  test.beforeEach(async ({ page }) => {
 
    await page.addInitScript(() => {
      const fixedDate = new Date("2026-05-12T12:00:00")

      const OriginalDate = Date

      class MockDate extends OriginalDate {
        constructor(...args: any[]) {
          if (args.length === 0) {
            super(fixedDate)
          } else {
            super(...args)
          }
        }

        static now() {
          return fixedDate.getTime()
        }
      }

      
      window.Date = MockDate
    })

    await page.goto("/login")

    await page
      .getByPlaceholder("you@company.com")
      .fill("teste@goeats.com")

    await page
      .getByPlaceholder("Enter your password")
      .fill("123456")

    await page.getByRole("button", {
      name: /entrar/i,
    }).click()

    await expect(page).toHaveURL(/dashboard/)
  })

  test("deve habilitar botão após adicionar item", async ({
    page,
  }) => {
    
    await page
      .getByRole("button", {
        name: /adicionar ao pedido/i,
      })
      .last()
      .click()

    const button = page.getByRole("button", {
      name: /fazer pedido/i,
    })

    await expect(button).toBeEnabled()
  })
})