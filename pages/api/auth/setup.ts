import type { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcryptjs'
import { supabase } from '@/lib/supabase'

// 此 API 只需執行一次來建立管理員帳號
// 部署後訪問 /api/auth/setup?secret=SETUP_SECRET 來初始化
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { secret } = req.query
  if (secret !== process.env.SETUP_SECRET) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  const email = 'tanghuipei@gmail.com'
  const password = 'tanghuipei'
  const hash = await bcrypt.hash(password, 12)

  const { error } = await supabase
    .from('admins')
    .upsert({ email, password_hash: hash }, { onConflict: 'email' })

  if (error) return res.status(500).json({ error: error.message })
  res.json({ success: true, message: '管理員帳號已建立' })
}
