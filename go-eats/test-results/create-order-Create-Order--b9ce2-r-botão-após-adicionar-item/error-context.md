# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: create-order.spec.ts >> Create Order E2E >> deve habilitar botão após adicionar item
- Location: src\tests\e2e\create-order.spec.ts:41:7

# Error details

```
Test timeout of 120000ms exceeded while running "beforeEach" hook.
```

```
Error: locator.click: Test timeout of 120000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: /entrar/i })
    - locator resolved to <button type="submit" class="   h-12 w-full rounded-xl   bg-gradient-to-r from-orange-500 to-orange-600   text-white font-semibold text-base   transition-all duration-300   hover:from-orange-600 hover:to-orange-700   hover:shadow-lg hover:shadow-orange-200   active:scale-[0.99] active:shadow-md   focus:outline-none focus:ring-3 focus:ring-orange-500/40   ">…</button>
  - attempting click action
    - waiting for element to be visible, enabled and stable

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e4]:
    - generic [ref=e5]:
      - img [ref=e7]
      - generic [ref=e10]:
        - heading "Go Eats" [level=1] [ref=e11]
        - paragraph [ref=e12]: Entre e faça seu pedido
    - generic [ref=e13]:
      - generic [ref=e14]:
        - text: Email
        - textbox "you@company.com" [ref=e15]: teste@goeats.com
      - generic [ref=e16]:
        - text: Senha
        - textbox "Enter your password" [active] [ref=e17]: "123456"
      - button "Entrar" [ref=e18]
  - button "Alternar tema" [ref=e19]:
    - img [ref=e20]
  - button "Open Next.js Dev Tools" [ref=e27] [cursor=pointer]:
    - img [ref=e28]
  - alert [ref=e31]
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test"
  2  | 
  3  | test.describe("Create Order E2E", () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.addInitScript(() => {
  6  |       const fixedDate = new Date("2026-05-12T12:00:00")
  7  |       const OriginalDate = Date
  8  | 
  9  |       class MockDate extends OriginalDate {
  10 |         constructor(value?: string | number | Date) {
  11 |           super(value ?? fixedDate.getTime())
  12 |         }
  13 | 
  14 |         static now(): number {
  15 |           return fixedDate.getTime()
  16 |         }
  17 |       }
  18 | 
  19 |       window.Date = MockDate as DateConstructor
  20 |     })
  21 | 
  22 |     await page.goto("/login")
  23 | 
  24 |     await page
  25 |       .getByPlaceholder("you@company.com")
  26 |       .fill("teste@goeats.com")
  27 | 
  28 |     await page
  29 |       .getByPlaceholder("Enter your password")
  30 |       .fill("123456")
  31 | 
  32 |     await page.getByRole("button", {
  33 |       name: /entrar/i,
> 34 |     }).click()
     |        ^ Error: locator.click: Test timeout of 120000ms exceeded.
  35 | 
  36 |     await expect(page).toHaveURL(/dashboard/, {
  37 |       timeout: 60000,
  38 |     })
  39 |   })
  40 | 
  41 |   test("deve habilitar botão após adicionar item", async ({
  42 |     page,
  43 |   }) => {
  44 |     await page
  45 |       .getByRole("button", {
  46 |         name: /adicionar ao pedido/i,
  47 |       })
  48 |       .last()
  49 |       .click()
  50 | 
  51 |     const button = page.getByRole("button", {
  52 |       name: /fazer pedido/i,
  53 |     })
  54 | 
  55 |     await expect(button).toBeEnabled()
  56 |   })
  57 | })
```