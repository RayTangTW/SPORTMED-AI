import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAuth(req, res)) return

  if (req.method === 'GET') {
    const { search } = req.query
    let query = supabase.from('clients').select('*').order('name')
    if (search) query = query.ilike('name', `%${search}%`)
    const { data, error } = await query
    if (error) return res.status(500).json({ error: error.message })
    return res.json(data)
  }

  if (req.method === 'POST') {
    const { name, notes } = req.body
    if (!name) return res.status(400).json({ error: '客戶名稱為必填' })

    // 先查是否已存在
    const { data: existing } = await supabase
      .from('clients').select('*').eq('name', name).single()
    if (existing) return res.json(existing)

    const { data, error } = await supabase
      .from('clients').insert({ name, notes }).select().single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(201).json(data)
  }

  res.status(405).end()
}
