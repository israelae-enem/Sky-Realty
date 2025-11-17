import { supabase } from "../../../lib/supabaseClient"

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { data, error } = await supabase.from("properties").select("*")
    return error ? res.status(500).json({ error }) : res.status(200).json(data)
  }

  if (req.method === "POST") {
    const { data, error } = await supabase.from("properties").insert(req.body).select()
    return error ? res.status(500).json({ error }) : res.status(201).json(data)
  }

  res.status(405).json({ error: "Method not allowed" })
}