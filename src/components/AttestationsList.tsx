import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'

type Attestation = {
  id: string
  skill: string
  level: string
  issuedAt: string
  expiresAt: string
  issuer: string
  pda: string
  shortDate: string
}

export function AttestationsList() {
  const { connected, publicKey } = useWallet()
  const [openId, setOpenId] = useState<string | null>(null)

  const realAttestations: Attestation[] = [
    {
      id: '1',
      skill: 'React',
      level: 'Intermédiaire',
      issuedAt: '24 septembre 2026',
      expiresAt: '24 septembre 2027',
      issuer: 'IdentiaAdmin',
      pda: 'BEdPEgHMpY3jN2Nbvh2E28B4oAyhWA9x2ijVyR6QH6jt',
      shortDate: '24/09/26',
    },
    // Tu pourras en ajouter d'autres ici plus tard
  ]

  const PHANTOM_ADDRESS = 'GGRnWMxwvQ56QzxTUUNbpgyZ113LUrhVKnj4ugsxu6WS'

  if (!connected || !publicKey) return null

  const isOwner = publicKey.toBase58() === PHANTOM_ADDRESS
  const attestations = isOwner ? realAttestations : []

  const toggle = (id: string) => {
    setOpenId(openId === id ? null : id)
  }

  return (
    <div className="mt-8 w-full max-w-md">
      <h2 className="text-lg font-semibold mb-5 text-center text-white">
        Mes Attestations
      </h2>

      {attestations.length === 0 ? (
        <div className="text-center py-8 text-gray-500 bg-gray-900 rounded-xl border border-gray-700">
          <p>Aucune attestation pour le moment</p>
          <p className="text-sm mt-1">Elles apparaîtront ici une fois émises</p>
        </div>
      ) : (
        <div className="space-y-3">
          {attestations.map((att) => {
            const isOpen = openId === att.id

            return (
              <div key={att.id} className="rounded-lg overflow-hidden border border-gray-700">
                {/* Ligne cliquable (header de l'accordéon) */}
                <button
                  onClick={() => toggle(att.id)}
                  className="w-full flex items-center justify-between px-4 py-3.5 bg-gray-900 hover:bg-gray-800 transition text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-white">{att.skill}</span>
                    <span className="text-gray-500">—</span>
                    <span className="text-blue-300 text-sm">{att.level}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">{att.shortDate}</span>
                    <span className="text-gray-400 text-sm">{isOpen ? '▾' : '▸'}</span>
                  </div>
                </button>

                {/* Contenu déplié = Certificat vintage */}
                {isOpen && (
                  <div
                    className="bg-amber-50 text-stone-800 px-6 py-7 border-t border-amber-700/30"
                    style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                  >
                    {/* En-tête */}
                    <div className="text-center mb-5">
                      <p className="text-xs uppercase tracking-[0.2em] text-amber-800/80 font-medium">
                        Certificat de Compétence
                      </p>
                      <div className="w-20 h-px bg-amber-700/60 mx-auto mt-3"></div>
                    </div>

                    {/* Introduction */}
                    <p className="text-sm text-stone-600 text-center mb-6 leading-relaxed">
                      Ce wallet a reçu l'attestation suivante<br />
                      émise par <span className="font-semibold text-amber-900">{att.issuer}</span> :
                    </p>

                    {/* Compétence */}
                    <div className="text-center mb-6">
                      <h3 className="text-3xl font-bold text-stone-900 mb-2 tracking-wide">
                        {att.skill}
                      </h3>
                      <div className="w-14 h-px bg-amber-700/50 mx-auto mb-3"></div>
                      <p className="text-lg text-amber-900 italic">{att.level}</p>
                    </div>

                    {/* Dates */}
                    <div className="flex justify-between text-xs text-stone-600 mb-6 px-1">
                      <div>
                        <p className="text-stone-500 mb-0.5">Émise le</p>
                        <p className="font-medium">{att.issuedAt}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-stone-500 mb-0.5">Expire le</p>
                        <p className="font-medium">{att.expiresAt}</p>
                      </div>
                    </div>

                    {/* Pied */}
                    <div className="border-t border-amber-700/30 pt-4">
                      <p className="text-[11px] text-stone-500 font-mono truncate mb-4">
                        PDA : {att.pda}
                      </p>
                      <a
                        href={`https://explorer.solana.com/address/${att.pda}?cluster=devnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-center text-sm py-2.5 border border-amber-800/60 text-amber-900 hover:bg-amber-100/80 rounded-sm transition"
                      >
                        Vérifier on-chain →
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}