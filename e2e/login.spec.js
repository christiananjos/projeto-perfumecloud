import { test, expect } from "@playwright/test";

// Credenciais de um usuário de teste real, cadastrado no Supabase Auth do backend.
// Nunca hardcode credenciais aqui — ver e2e/README.md para como configurar.
const usuario = process.env.E2E_TEST_EMAIL;
const senha = process.env.E2E_TEST_SENHA;
const backendUrl = process.env.E2E_BACKEND_URL;

test.beforeEach(async ({ page }) => {
  test.skip(
    !usuario || !senha,
    "E2E_TEST_EMAIL/E2E_TEST_SENHA não configuradas — ver e2e/README.md",
  );

  if (backendUrl) {
    // index.html define window.API_URL via <script> inline, que roda DEPOIS de qualquer
    // addInitScript e sobrescreveria uma tentativa de setar o global diretamente. Em vez
    // disso, intercepta as chamadas de API na camada de rede e refaz a chamada (via Node,
    // sem CORS) contra o backend local — route.continue({url}) não serve aqui porque não
    // permite trocar de protocolo (produção é https, backend local costuma ser http).
    await page.route("**/api/**", async (route) => {
      const req = route.request();
      if (req.url().startsWith(backendUrl)) {
        await route.continue();
        return;
      }

      const reqUrl = new URL(req.url());
      const headers = req.headers();
      delete headers["host"];
      delete headers["content-length"];

      const response = await fetch(backendUrl + reqUrl.pathname + reqUrl.search, {
        method: req.method(),
        headers,
        body: ["GET", "HEAD"].includes(req.method()) ? undefined : req.postData(),
      });
      await route.fulfill({
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        body: await response.text(),
      });
    });
  }
});

test("login com credenciais reais leva ao dashboard", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /acesso restrito/i })).toBeVisible();

  await page.locator('input[type="text"]').fill(usuario);
  await page.locator('input[type="password"]').fill(senha);
  await page.getByRole("button", { name: /entrar/i }).click();

  // Tela de login some e o menu principal (pós-login) aparece — não valida dados
  // específicos do banco (mutáveis), só a transição estrutural de tela.
  await expect(page.getByRole("heading", { name: /acesso restrito/i })).toBeHidden();
  await expect(page.getByText("Dashboard", { exact: true })).toBeVisible();
});

test("login com credenciais inválidas mostra erro e não navega", async ({ page }) => {
  await page.goto("/");

  await page.locator('input[type="text"]').fill("usuario-que-nao-existe");
  await page.locator('input[type="password"]').fill("senha-errada-123");
  await page.getByRole("button", { name: /entrar/i }).click();

  await expect(page.getByText(/usuário ou senha inválidos/i)).toBeVisible();
  await expect(page.getByRole("heading", { name: /acesso restrito/i })).toBeVisible();
});
