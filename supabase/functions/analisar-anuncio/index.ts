import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Domínios permitidos para o proxy de scraping — evita SSRF (a function não deve buscar
// URL arbitrária vinda do cliente; só anúncios do Mercado Livre, que é o único uso legítimo).
const ALLOWED_HOSTS = [
  'mercadolivre.com.br',
  'produto.mercadolivre.com.br',
  'www.mercadolivre.com.br',
  'articulo.mercadolivre.com.br',
]

function isAllowedUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl)
    if (parsed.protocol !== 'https:') return false
    return ALLOWED_HOSTS.some(
      (host) => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`),
    )
  } catch {
    return false
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { url } = await req.json()

    if (!isAllowedUrl(url)) {
      return new Response(
        JSON.stringify({ error: 'URL não permitida. Só anúncios do Mercado Livre são aceitos.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      }
    })

    const htmlRaw = await response.text()
    // Limpeza de escape para facilitar a busca de texto simples
    const clean = htmlRaw.replace(/\\"/g, '"');

    // Buscamos os campos de erro que você mencionou
    const isCbt = clean.includes('"is_cbt_fulfillment_cn":true');
    const isPrescription = clean.includes('"is_prescription_required":true');
    const isOutOfCoverage = clean.includes('"is_out_of_coverage":true');
    
    // Captura da Reputação e Medalha (isso costuma vir mais fácil)
    const reputation = clean.match(/"reputation_level":"(.*?)"/)?.[1] || "5_green";
    const medalha = clean.match(/"power_seller_status":"(.*?)"/)?.[1] || "none";

    return new Response(
      JSON.stringify({
        success: true,
        reputation_level: reputation,
        power_seller_status: medalha,
        errors: {
          is_cbt: isCbt,
          is_prescription: isPrescription,
          out_of_coverage: isOutOfCoverage
        },
        // Enviamos um trecho do HTML para você ver no console o que está chegando
        html_preview: clean.substring(0, 1000) 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: corsHeaders })
  }
})