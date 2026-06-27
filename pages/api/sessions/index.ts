import type { NextApiRequest, NextApiResponse } from 'next'
import Anthropic from '@anthropic-ai/sdk'
import { supabase } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'
import { SYSTEM_PROMPT, buildPrompt } from '@/lib/prompt'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAuth(req, res)) return

  if (req.method === 'POST') {
    const { client_id, session_date, session_number, input_text, history } = req.body
    if (!client_id || !input_text) return res.status(400).json({ error: '缺少必要欄位' })

    // Call Claude
    let result_json = null
    try {
      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 4000,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: buildPrompt(input_text, history) }]
      })
      const raw = message.content.map((c: any) => c.text || '').join('')
      const clean = raw.replace(/```json|```/g, '').trim()
      const s = clean.indexOf('{'), e = clean.lastIndexOf('}')
      if (s !== -1 && e !== -1) result_json = JSON.parse(clean.slice(s, e + 1))
    } catch (err: any) {
      return res.status(500).json({ error: 'AI分析失敗：' + err.message })
    }

    // Save to DB
    const { data, error } = await supabase
      .from('sessions')
      .insert({ client_id, session_date, session_number, input_text, result_json })
      .select().single()

    if (error) return res.status(500).json({ error: error.message })
    return res.status(201).json(data)
  }

  res.status(405).end()
}
