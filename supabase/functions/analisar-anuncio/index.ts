import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handshake para CORS (Permite que seu site chame a função)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { url } = await req.json()
    if (!url) throw new Error("URL não fornecida")

    // Busca o HTML do Mercado Livre simulando um navegador real
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept-Language': 'pt-BR,pt;q=0.9',
      }
    })

    const html = await response.text()

    // --- 1. EXTRAÇÃO DE TAGS (Lógica Sniper para o seu JSON) ---
    // Procuramos exatamente o padrão: "tags":["tag1","tag2"]
    const regexTags = /"tags":\s*\["([^"]+)"(?:,"([^"]+)")*\]/
    const matchTags = html.match(regexTags)
    let tagsFinais: string[] = []

    if (matchTags) {
      const trechoBruto = matchTags[0]
      tagsFinais = trechoBruto
        .replace(/"tags":\s*\[/, '') // Remove o início "tags":[
        .replace(/\]/, '')           // Remove o fim ]
        .replace(/"/g, '')           // Remove as aspas
        .split(',')                  // Transforma em array
        .map(t => t.trim())
    }

    // --- 2. EXTRAÇÃO DE REPUTAÇÃO E MEDALHA ---
    // Busca "reputation_level":"5_green"
    const reputacaoMatch = html.match(/"reputation_level":"([^"]+)"/)
    const reputacao = reputacaoMatch ? reputacaoMatch[1] : "5_green"

    // Busca "power_seller_status":"silver"
    const medalhaMatch = html.match(/"power_seller_status":"([^"]+)"/)
    const medalha = medalhaMatch ? medalhaMatch[1] : "none"

    // --- 3. VERIFICAÇÃO DE DESCRIÇÃO RICA ---
    // Verifica se o campo has_full_enhanced_descriptions está true
    const hasEnhancedDescription = html.includes('"has_full_enhanced_descriptions":true')

    // --- RETORNO DOS DADOS ---
    return new Response(
      JSON.stringify({
        success: true,
        tags: tagsFinais,
        reputation_level: reputacao,
        power_seller_status: medalha,
        has_full_enhanced_descriptions: hasEnhancedDescription,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 400, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})