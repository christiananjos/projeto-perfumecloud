export function canalLabel(nome) {
  const n = (nome || "").toUpperCase();
  if (n.includes("LIVRE") || n === "ML") return "ML";
  if (n.includes("SHOPEE")) return "SHOPEE";
  return n;
}

export function precoSugeridoPorCanal(produto, canalNome) {
  if (!produto) return 0;
  return canalLabel(canalNome) === "SHOPEE"
    ? produto.precoSugerShopee || 0
    : produto.precoSugerMl || 0;
}

export function custoProduto(produto) {
  return produto ? Number(produto.custo).toFixed(2) : "0.00";
}

export function calcularLucroVenda(produto, precoRecebido, quantidade) {
  if (!produto) return "0.00";
  const entradaLiquida = Number(precoRecebido);
  const custoUnitario = Number(produto.custo);
  return ((entradaLiquida - custoUnitario) * quantidade).toFixed(2);
}
