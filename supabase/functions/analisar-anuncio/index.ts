// supabase/functions/analisar-anuncio/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Faz o "Handshake" do CORS para permitir que seu site chame a função
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { url } = await req.json()

    if (!url) {
      throw new Error("URL é obrigatória")
    }

    // Faz o fetch na página do Mercado Livre fingindo ser um navegador real (User-Agent)
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      }
    })

    if (!response.ok) {
      throw new Error(`Erro ao acessar o Mercado Livre: ${response.status}`)
    }

    const html = await response.text()

    // 1. EXTRAÇÃO DAS TAGS
    // Buscamos o padrão "tags":["valor1","valor2"] dentro do HTML
    const regexTags = /"tags":\s*\[(.*?)\]/;
    const matchTags = html.match(regexTags);
    let tags = [];

    if (matchTags && matchTags[1]) {
      // Limpa as aspas e transforma em um array limpo
      tags = matchTags[1].replace(/"/g, '').split(',').map(t => t.trim());
    }

    // 2. VERIFICAÇÃO DE DESCRIÇÃO RICA (ENHANCED DESCRIPTION)
    // Procuramos por IDs ou Classes que o ML usa apenas em anúncios com descrição avançada
    const hasEnhancedDescription = html.includes('enhanced-description') || 
                                   html.includes('vip-section-enhanced-description') ||
                                   html.includes('full-description');

    // 3. VERIFICAÇÃO ADICIONAL: VÍDEOS (CLIPS)
    const hasClips = tags.includes("has_published_clips");

    return new Response(
      JSON.stringify({
        success: true,
        tags: tags,
        has_full_enhanced_descriptions: hasEnhancedDescription,
        has_clips: hasClips,
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
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }), 
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