import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const EMOTION_CONTEXT: Record<string, string> = {
  happy: '행복하고 설레는',
  sad: '슬프고 쓸쓸한',
  tired: '지치고 피곤한',
  stressed: '긴장되고 답답한',
  hopeful: '희망차고 기대되는',
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { emotion, location } = await req.json()
    const emotionContext = EMOTION_CONTEXT[emotion] ?? '복잡한'

    const systemPrompt = `당신은 릴레이 소설의 첫 문장을 써주는 작가입니다.
규칙:
- 반드시 한국어로 작성
- 1~2문장, 150자 이내
- 감정(${emotionContext})과 장소(${location})를 자연스럽게 반영
- 다음 사람이 이어 쓰고 싶어지는 열린 문체
- 직접적인 감정 설명 대신 상황과 감각 묘사 위주
- 주어는 생략하거나 '나'로 통일`

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Deno.env.get('LOVABLE_AI_KEY') ?? ''}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-flash-1.5',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `감정: ${emotion}, 장소: ${location}\n\n이야기의 첫 문장을 써주세요.`,
          },
        ],
        max_tokens: 200,
        temperature: 0.9,
      }),
    })

    if (response.status === 429) {
      return new Response(
        JSON.stringify({ error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (response.status === 402) {
      return new Response(
        JSON.stringify({ error: 'AI 크레딧이 부족합니다.' }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`)
    }

    const data = await response.json()
    const sentence = data.choices?.[0]?.message?.content?.trim() ?? ''

    return new Response(
      JSON.stringify({ sentence }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('generate-story-starter error:', err)
    return new Response(
      JSON.stringify({ error: '서버 오류가 발생했습니다.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
