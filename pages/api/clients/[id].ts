import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAuth(req, res)) return
  const { id } = req.query

  if (req.method === 'GET') {
    const { data: client, error } = await supabase
      .from('clients').select('*').eq('id', id).single()
    if (error || !client) return res.status(404).json({ error: '找不到客戶' })

    const { data: sessions } = await supabase
      .from('sessions')
      .select('*, feedbacks(*)')
      .eq('client_id', id)
      .order('session_date', { ascending: false })
      .order('session_number', { ascending: false })

    return res.json({ client, sessions: sessions || [] })
  }

  res.status(405).end()
}
