import { supabase } from "../../../lib/supabaseClient"

export default async function handler(req, res) {
  const { id } = req.query

  if (req.method === "PUT") {
    const { data, error } = await supabase.from("appointments").update(req.body).eq("id", id).select()
    return error ? res.status(400).json({ error }) : res.status(200).json(data)
  }

  if (req.method === "DELETE") {
    const { error } = await supabase.from("appointments").delete().eq("id", id)
    return error ? res.status(400).json({ error }) : res.status(204).end()
  }

  res.status(405).json({ error: "Method not allowed" })
}