import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { url } = await req.json()
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      }
    })

    const htmlRaw = await response.text()
    
    // LIMPEZA: Remove as barras invertidas que o ML coloca no JSON do script
    const htmlClean = htmlRaw.replace(/\\"/g, '"').replace(/\\\//g, '/');

    // 1. EXTRAÇÃO DE TAGS (Busca o array literal ["tag1","tag2"])
    const tagsMatch = htmlClean.match(/"tags"\s*:\s*\[(.*?)\]/);
    let tagsFinais: string[] = [];
    if (tagsMatch && tagsMatch[1]) {
      tagsFinais = tagsMatch[1].replace(/"/g, '').split(',').map(t => t.trim());
    }

    // 2. EXTRAÇÃO DE REPUTAÇÃO E STATUS LÍDER
    const reputacao = htmlClean.match(/"reputation_level"\s*:\s*"(.*?)"/)?.[1] || "5_green";
    const medalha = htmlClean.match(/"power_seller_status"\s*:\s*"(.*?)"/)?.[1] || "none";

    // 3. VERIFICAÇÃO DE DESCRIÇÃO RICA (Dinâmica)
    const hasEnhanced = htmlClean.includes('"has_full_enhanced_descriptions":true');

    return new Response(
      JSON.stringify({
        success: true,
        tags: tagsFinais,
        reputation_level: reputacao,
        power_seller_status: medalha,
        has_full_enhanced_descriptions: hasEnhanced,
        // Enviamos o bloco bruto para o seu teste manual
        debug_raw: htmlClean.substring(htmlClean.indexOf('initialState'), htmlClean.indexOf('initialState') + 2000)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: corsHeaders })
  }
})