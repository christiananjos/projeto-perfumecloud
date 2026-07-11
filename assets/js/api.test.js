// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { normalizeRole, normalizeText, buildSessionFromToken } from "./api.js";

function fakeJwt(payload) {
  const base64url = (obj) =>
    Buffer.from(JSON.stringify(obj))
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  const header = base64url({ alg: "HS256", typ: "JWT" });
  const body = base64url(payload);
  return `${header}.${body}.assinatura-fake`;
}

describe("normalizeRole", () => {
  it.each([
    ["Admin", "admin"],
    ["VENDEDOR", "vendedor"],
    ["  admin  ", "admin"],
    [undefined, "vendedor"],
    [null, "vendedor"],
    ["", "vendedor"],
  ])("normalizeRole(%s) deve retornar %s", (entrada, esperado) => {
    expect(normalizeRole(entrada)).toBe(esperado);
  });
});

describe("normalizeText (correção de mojibake)", () => {
  it("corrige encoding quebrado de acentuação comum", () => {
    expect(normalizeText("Estrat�gia")).toBe("Estratégia");
    expect(normalizeText("An�lise")).toBe("Análise");
  });

  it("não altera texto já correto", () => {
    expect(normalizeText("Estratégia normal")).toBe("Estratégia normal");
  });

  it("retorna o valor original se não for string", () => {
    expect(normalizeText(42)).toBe(42);
    expect(normalizeText(null)).toBe(null);
  });
});

describe("buildSessionFromToken", () => {
  it("extrai email e papel normalizado do payload do JWT", () => {
    const token = fakeJwt({ email: "admin@meusistema.com", role: "Admin", exp: 123 });
    const session = buildSessionFromToken(token);

    expect(session).toEqual({
      email: "admin@meusistema.com",
      role: "admin",
      exp: 123,
      token,
    });
  });

  it("usa fallback seguro 'vendedor' quando não há claim de papel (regressão de segurança)", () => {
    // Antes da auditoria, a ausência do claim de papel virava "admin" por padrão.
    const token = fakeJwt({ email: "alguem@meusistema.com" });
    const session = buildSessionFromToken(token);

    expect(session.role).toBe("vendedor");
  });

  it("retorna null para um token malformado", () => {
    expect(buildSessionFromToken("nao-e-um-jwt")).toBeNull();
  });

  it("retorna null para um payload que não é JSON válido", () => {
    const tokenComPayloadInvalido = "header.bmFvLWUtanNvbg.assinatura";
    expect(buildSessionFromToken(tokenComPayloadInvalido)).toBeNull();
  });
});
