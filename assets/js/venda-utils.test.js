import { describe, it, expect } from "vitest";
import {
  canalLabel,
  precoSugeridoPorCanal,
  custoProduto,
  calcularLucroVenda,
} from "./venda-utils.js";

describe("canalLabel", () => {
  it.each([
    ["Mercado Livre", "ML"],
    ["ML", "ML"],
    ["Shopee", "SHOPEE"],
    ["SHOPEE OFICIAL", "SHOPEE"],
    ["Site Próprio", "SITE PRÓPRIO"],
    [undefined, ""],
    [null, ""],
  ])("canalLabel(%s) deve retornar %s", (entrada, esperado) => {
    expect(canalLabel(entrada)).toBe(esperado);
  });
});

describe("precoSugeridoPorCanal", () => {
  const produto = { precoSugerMl: 100, precoSugerShopee: 80 };

  it("retorna o preço sugerido do ML para canal Mercado Livre", () => {
    expect(precoSugeridoPorCanal(produto, "Mercado Livre")).toBe(100);
  });

  it("retorna o preço sugerido da Shopee para canal Shopee", () => {
    expect(precoSugeridoPorCanal(produto, "Shopee")).toBe(80);
  });

  it("não depende do ID do canal, só do nome (regressão do número mágico canalId===2)", () => {
    // Um canal Shopee cadastrado com qualquer ID deve resolver corretamente pelo nome.
    expect(precoSugeridoPorCanal(produto, "Shopee Full")).toBe(80);
  });

  it("retorna 0 quando o produto é nulo", () => {
    expect(precoSugeridoPorCanal(null, "Shopee")).toBe(0);
  });

  it("usa 0 como fallback quando o produto não tem preço sugerido para o canal", () => {
    expect(precoSugeridoPorCanal({}, "Mercado Livre")).toBe(0);
  });
});

describe("custoProduto", () => {
  it("formata o custo do produto com 2 casas decimais", () => {
    expect(custoProduto({ custo: 42.5 })).toBe("42.50");
  });

  it("retorna '0.00' quando o produto é nulo", () => {
    expect(custoProduto(null)).toBe("0.00");
  });
});

describe("calcularLucroVenda", () => {
  it("calcula o lucro líquido (entrada - custo) * quantidade", () => {
    const produto = { custo: 30 };
    expect(calcularLucroVenda(produto, 50, 2)).toBe("40.00");
  });

  it("retorna '0.00' quando o produto é nulo", () => {
    expect(calcularLucroVenda(null, 50, 2)).toBe("0.00");
  });

  it("lida com prejuízo (entrada menor que o custo)", () => {
    const produto = { custo: 100 };
    expect(calcularLucroVenda(produto, 80, 1)).toBe("-20.00");
  });
});
