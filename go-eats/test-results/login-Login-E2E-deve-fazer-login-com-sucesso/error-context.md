# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: login.spec.ts >> Login E2E >> deve fazer login com sucesso
- Location: src\tests\e2e\login.spec.ts:4:7

# Error details

```
Test timeout of 120000ms exceeded.
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
  3  | test.describe("Login E2E", () => {
  4  |   test("deve fazer login com sucesso", async ({
  5  |     page,
  6  |   }) => {
  7  |     await page.goto("/login")
  8  | 
  9  |   await page
  10 |     .getByPlaceholder("you@company.com")
  11 |     .fill("teste@goeats.com")
  12 | 
  13 |   await page
  14 |     .getByPlaceholder("Enter your password")
  15 |     .fill("123456")
  16 | 
  17 |   // await page.screenshot({
  18 |   //   path: "antes-do-login.png",
  19 |   //   fullPage: true,
  20 |   // })
  21 | 
  22 |   await page.getByRole("button", {
  23 |     name: /entrar/i,
> 24 |   }).click()
     |      ^ Error: locator.click: Test timeout of 120000ms exceeded.
  25 | 
  26 |   await expect(page).toHaveURL(/dashboard/, {
  27 |     timeout: 60000
  28 |   })
  29 |   })
  30 | 
  31 |   test("deve exibir erro de email inexistente", async ({
  32 |     page,
  33 |   }) => {
  34 |     await page.goto("/login")
  35 | 
  36 |     await page
  37 |       .getByPlaceholder("you@company.com")
  38 |       .fill("naoexiste@email.com")
  39 | 
  40 |     await page
  41 |       .getByPlaceholder("Enter your password")
  42 |       .fill("123456")
  43 | 
  44 |     await page.getByRole("button", {
  45 |       name: /entrar/i,
  46 |     }).click()
  47 | 
  48 |     await expect(
  49 |       page.locator(".text-red-600")
  50 |     ).toBeVisible()
  51 |   })
  52 | 
  53 |   test("deve exibir erro de senha inválida", async ({
  54 |     page,
  55 |   }) => {
  56 |     await page.goto("/login")
  57 | 
  58 |     await page
  59 |       .getByPlaceholder("you@company.com")
  60 |       .fill("teste@goeats.com")
  61 | 
  62 |     await page
  63 |       .getByPlaceholder("Enter your password")
  64 |       .fill("senhaerrada")
  65 | 
  66 |     await page.getByRole("button", {
  67 |       name: /entrar/i,
  68 |     }).click()
  69 | 
  70 |     await expect(
  71 |       page.locator(".text-red-600")
  72 |     ).toBeVisible()
  73 |   })
  74 | })
```