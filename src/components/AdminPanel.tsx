import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type Request = {
  id: number
  wallet: string
  skill: string
  level: string
  score: number
  total: number
  status: string
  requested_at: string
}
const API_URL = 'https://identia-api.onrender.com'
const API_SECRET = 'identia_secret_change_me'

export function AdminPanel() {
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'validated' | 'emitted'>('pending')
  const [emittingId, setEmittingId] = useState<number | null>(null)

  const fetchRequests = async () => {
    setLoading(true)
    let query = supabase
      .from('attestation_requests')
      .select('*')
      .order('requested_at', { ascending: false })

    if (filter !== 'all') {
      query = query.eq('status', filter)
    }

    const { data, error } = await query

    if (error) {
      console.error(error)
      alert('Erreur lors du chargement des demandes')
    } else {
      setRequests(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchRequests()
  }, [filter])

  const validateRequest = async (id: number) => {
    const { error } = await supabase
      .from('attestation_requests')
      .update({ status: 'validated' })
      .eq('id', id)

    if (error) {
      console.error(error)
      alert('Erreur lors de la validation')
      return
    }

    alert('Demande marquée comme validée')
    fetchRequests()
  }

  const emitOnChain = async (id: number) => {
    setEmittingId(id)
    try {
      const response = await fetch(`${API_URL}/emit-attestation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-secret': API_SECRET,
        },
        body: JSON.stringify({ requestId: id }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert('Erreur : ' + (data.error || 'Échec de l\'émission'))
        return
      }

      if (data.alreadyExists) {
        alert('Attestation déjà existante on-chain.\nStatut mis à jour.')
      } else {
        alert(
          `Attestation émise avec succès !\n\nSignature : ${data.signature?.slice(0, 20)}...\nExplorer : ${data.explorer}`
        )
      }

      fetchRequests()
    } catch (err: any) {
      console.error(err)
      alert('Erreur réseau : ' + err.message)
    } finally {
      setEmittingId(null)
    }
  }

  return (
    <div className="w-full max-w-2xl">
      <h2 className="text-xl font-semibold mb-4 text-center">Panel Admin</h2>

      {/* Filtres */}
      <div className="flex gap-2 mb-6 justify-center flex-wrap">
        {(['pending', 'validated', 'emitted', 'all'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-sm capitalize transition ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {f === 'pending'
              ? 'En attente'
              : f === 'validated'
              ? 'Validées'
              : f === 'emitted'
              ? 'Émises'
              : 'Toutes'}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Chargement...</p>
      ) : requests.length === 0 ? (
        <p className="text-center text-gray-500 py-8">Aucune demande</p>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <div
              key={req.id}
              className="bg-gray-900 border border-gray-700 rounded-xl p-4"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium">
                    {req.skill} — <span className="text-blue-400">{req.level}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Score : {req.score}/{req.total}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    req.status === 'pending'
                      ? 'bg-yellow-900/50 text-yellow-400'
                      : req.status === 'validated'
                      ? 'bg-blue-900/50 text-blue-400'
                      : 'bg-green-900/50 text-green-400'
                  }`}
                >
                  {req.status}
                </span>
              </div>

              <p className="text-xs font-mono text-gray-500 break-all mb-3">
                {req.wallet}
              </p>

              <div className="flex justify-between items-center gap-2">
                <p className="text-xs text-gray-600">
                  {new Date(req.requested_at).toLocaleString('fr-FR')}
                </p>

                <div className="flex gap-2">
                  {req.status === 'pending' && (
                    <button
                      onClick={() => validateRequest(req.id)}
                      className="text-sm px-3 py-1.5 bg-blue-700 hover:bg-blue-600 rounded-lg transition"
                    >
                      Valider
                    </button>
                  )}

                  {(req.status === 'pending' || req.status === 'validated') && (
                    <button
                      onClick={() => emitOnChain(req.id)}
                      disabled={emittingId === req.id}
                      className="text-sm px-3 py-1.5 bg-green-700 hover:bg-green-600 rounded-lg transition disabled:opacity-50"
                    >
                      {emittingId === req.id ? 'Émission...' : 'Émettre on-chain'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}