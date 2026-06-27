import type { NextApiRequest, NextApiResponse } from 'next'
import Anthropic from '@anthropic-ai/sdk'
import { supabase } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'
import { SYSTEM_PROMPT, buildPrompt } from '@/lib/prompt'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAuth(req, res)) return

  if (req.method === 'POST') {
    const { session_id, feedback_date, feedback_text } = req.body
    if (!session_id || !feedback_text) return res.status(400).json({ error: '缺少必要欄位' })

    // Get session + all previous feedbacks for context
    const { data: session } = await supabase
      .from('sessions')
      .select('*, feedbacks(*)')
      .eq('id', session_id)
      .single()

    if (!session) return res.status(404).json({ error: '找不到診斷記錄' })

    // Build history context
    const historyParts = [`原始問題：${session.input_text}`]
    if (session.result_json) {
      const r = session.result_json
      historyParts.push(`原始診斷：${r.diagnosis?.primary || ''}`)
      historyParts.push(`治療階段：${r.treatment?.phase || ''}`)
    }
    if (session.feedbacks?.length) {
      session.feedbacks.forEach((f: any, i: number) => {
        historyParts.push(`第${i + 1}次反饋（${f.feedback_date}）：${f.feedback_text}`)
      })
    }
    const history = historyParts.join('\n')

    // Call Claude with full context
    let followup_result_json = null
    try {
      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 4000,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: buildPrompt(feedback_text, history) }]
      })
      const raw = message.content.map((c: any) => c.text || '').join('')
      const clean = raw.replace(/```json|```/g, '').trim()
      const s = clean.indexOf('{'), e = clean.lastIndexOf('}')
      if (s !== -1 && e !== -1) followup_result_json = JSON.parse(clean.slice(s, e + 1))
    } catch (err: any) {
      return res.status(500).json({ error: 'AI分析失敗：' + err.message })
    }

    const { data, error } = await supabase
      .from('feedbacks')
      .insert({ session_id, feedback_date, feedback_text, followup_result_json })
      .select().single()

    if (error) return res.status(500).json({ error: error.message })
    return res.status(201).json(data)
  }

  res.status(405).end()
}
