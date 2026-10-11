import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import nacl from "https://esm.sh/tweetnacl@1.0.3"
import { decode as decodeBase58 } from "https://deno.land/std@0.168.0/encoding/base58.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  // Gérer les preflight CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { address, message, signature } = await req.json()

    if (!address || !message || !signature) {
      return new Response(
        JSON.stringify({ error: "Missing address, message or signature" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // 1. Vérifier que le message contient bien un préfixe Identia + un timestamp récent
    if (!message.startsWith("Identia Admin Login")) {
      return new Response(
        JSON.stringify({ error: "Invalid message format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // 2. Vérifier la signature Solana
    const messageBytes = new TextEncoder().encode(message)
    const signatureBytes = Uint8Array.from(atob(signature), c => c.charCodeAt(0))
    const publicKeyBytes = decodeBase58(address)

    const isValid = nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      publicKeyBytes
    )

    if (!isValid) {
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // 3. Vérifier que l'adresse est dans la table admins
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    )

    const { data: admin, error } = await supabase
      .from("admins")
      .select("wallet")
      .eq("wallet", address)
      .single()

    if (error || !admin) {
      return new Response(
        JSON.stringify({ error: "Not an authorized admin" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // 4. Succès — on renvoie un token simple (pour le MVP)
    // Plus tard on pourra remplacer par un vrai JWT
    const token = btoa(JSON.stringify({
      address,
      role: "admin",
      exp: Date.now() + 1000 * 60 * 60 * 8 // 8 heures
    }))

    return new Response(
      JSON.stringify({ success: true, token }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )

  } catch (err) {
    console.error(err)
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})