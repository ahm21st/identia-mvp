const VERIFY_URL = 'https://qronkroomifebgcgawhi.supabase.co/functions/v1/verify-admin'

export async function loginAsAdmin(
  publicKey: string,
  signMessage: (message: Uint8Array) => Promise<Uint8Array>
): Promise<{ success: boolean; token?: string; error?: string }> {
  try {
    // 1. Créer un message unique
    const timestamp = Date.now()
    const message = `Identia Admin Login\nTimestamp: ${timestamp}\nAddress: ${publicKey}`

    // 2. Demander la signature au wallet
    const encodedMessage = new TextEncoder().encode(message)
    const signature = await signMessage(encodedMessage)

    // 3. Convertir la signature en base64
    const signatureBase64 = btoa(String.fromCharCode(...signature))

    // 4. Envoyer à l’Edge Function
    const response = await fetch(VERIFY_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer sb_publishable_SP1aF1WoKE27Q1EPfx-7-A_Ml7-tKlC`,
    'apikey': 'sb_publishable_SP1aF1WoKE27Q1EPfx-7-A_Ml7-tKlC',
  },
  body: JSON.stringify({
    address: publicKey,
    message,
    signature: signatureBase64,
  }),
})

    const data = await response.json()

    if (!response.ok) {
      return { success: false, error: data.error || 'Authentication failed' }
    }

    // 5. Sauvegarder le token
    localStorage.setItem('identia-admin-token', data.token)

    return { success: true, token: data.token }
  } catch (err: any) {
    console.error(err)
    return { success: false, error: err.message || 'Signature rejected' }
  }
}

export function getAdminToken(): string | null {
  const token = localStorage.getItem('identia-admin-token')
  if (!token) return null

  try {
    const payload = JSON.parse(atob(token))
    if (payload.exp < Date.now()) {
      localStorage.removeItem('identia-admin-token')
      return null
    }
    return token
  } catch {
    return null
  }
}

export function logoutAdmin() {
  localStorage.removeItem('identia-admin-token')
}

export function isAdminAuthenticated(): boolean {
  return !!getAdminToken()
}