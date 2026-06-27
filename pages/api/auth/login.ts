import type { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcryptjs'
import { supabase } from '@/lib/supabase'
import { signToken } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: '請輸入帳號與密碼' })

  const { data: admin } = await supabase
    .from('admins')
    .select('*')
    .eq('email', email)
    .single()

  if (!admin) return res.status(401).json({ error: '帳號或密碼錯誤' })

  const valid = await bcrypt.compare(password, admin.password_hash)
  if (!valid) return res.status(401).json({ error: '帳號或密碼錯誤' })

  const token = signToken({ id: admin.id, email: admin.email })
  res.json({ token, email: admin.email })
}
