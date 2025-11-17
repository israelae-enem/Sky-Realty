import { supabase } from "../../../lib/supabaseClient"

export default async function handler(req, res) {
  const { year, month } = req.query

  const { data, error } = await supabase.rpc("get_monthly_payment_summary", {
    year: parseInt(year),
    month: parseInt(month)
  })

  return error ? res.status(500).json({ error }) : res.status(200).json(data)
}