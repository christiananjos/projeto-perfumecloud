# Testes E2E (Playwright)

Testes de ponta a ponta que rodam o frontend de verdade contra o backend .NET **real** (não mockado, não Testcontainers) — não fazem parte do pipeline de CI ainda (rodar backend + Postgres + frontend juntos no GitHub Actions do repositório do frontend, cruzando com o repositório do backend, é escopo maior e não foi feito aqui).

## Pré-requisitos

Suba os dois serviços manualmente, em terminais separados:

```bash
# Terminal 1 — backend real (perfil HTTP, evita problema de certificado
# dev self-signed no Chromium headless do Playwright)
cd c:\Projetos\backend
dotnet run --project PerfumeCloudPro.Api --launch-profile http

# Terminal 2 — frontend estático
cd c:\Projetos\projeto-perfumecloud
npm run build:css
npx serve -l 3000
```

Depois, rode os testes num terceiro terminal:

```bash
cd c:\Projetos\projeto-perfumecloud
npx playwright install chromium   # só na primeira vez
E2E_TEST_EMAIL=seu-usuario-de-teste E2E_TEST_SENHA=sua-senha npm run test:e2e
```

## Variáveis de ambiente

| Variável            | Obrigatória | Descrição                                                                                   |
| ------------------- | ----------- | --------------------------------------------------------------------------------------------- |
| `E2E_TEST_EMAIL`     | Sim         | **Usuário sem o sufixo** (ex: `vendedor-teste`) — o mesmo texto que você digitaria no campo "Usuário" do formulário de login. `Login.js` já adiciona `@meusistema.com` antes de enviar. |
| `E2E_TEST_SENHA`     | Sim         | Senha desse usuário.                                                                          |
| `E2E_FRONTEND_URL`   | Não         | URL onde o frontend está servido. Default: `http://localhost:3000`.                          |
| `E2E_BACKEND_URL`    | Não         | Sobrescreve `window.API_URL` (que por padrão aponta pra produção, hardcoded em `index.html`) para apontar pro backend local, ex: `http://localhost:5298` (perfil `http` do backend). Default: usa a URL já embutida em `index.html`. |

**Nunca commite credenciais reais.** `E2E_TEST_EMAIL`/`E2E_TEST_SENHA` precisam ser de um usuário de teste dedicado (não um admin de produção), cadastrado no Supabase Auth do projeto — não é possível inventar essas credenciais, quem sobe o ambiente precisa criá-las.

Se as variáveis não estiverem definidas, os testes são pulados automaticamente (`test.skip`) em vez de falhar.

## Por que a porta 3000 (não 8000)

O CORS do backend (`AllowedOrigins` em `appsettings.json`) libera `http://localhost:3000`, `:5173`, `:5500` — não libera `:8000`. Sirva o frontend numa dessas portas, ou os testes vão falhar por causa de CORS, não por bug real.
