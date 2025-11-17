import { supabase } from "../../../lib/supabaseClient"

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { data, error } = await supabase.from("tenants").select("*")
    return error ? res.status(500).json({ error }) : res.status(200).json(data)
  }

  if (req.method === "POST") {
    const body = req.body
    const { data, error } = await supabase.from("tenants").insert(body).select()
    return error ? res.status(500).json({ error }) : res.status(201).json(data)
  }

  return res.status(405).json({ error: "Method not allowed" })
}