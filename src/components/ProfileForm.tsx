import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'

export function ProfileForm() {
  const { publicKey, connected } = useWallet()
  const [displayName, setDisplayName] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  // Charger le nom sauvegardé
  useEffect(() => {
    if (publicKey) {
      const saved = localStorage.getItem(`identia-name-${publicKey.toBase58()}`)
      if (saved) {
        setDisplayName(saved)
      }
    }
  }, [publicKey])

  const saveName = () => {
    if (!publicKey || !displayName.trim()) return
    localStorage.setItem(`identia-name-${publicKey.toBase58()}`, displayName.trim())
    setIsEditing(false)
  }

  if (!connected || !publicKey) return null

  return (
    <div className="mt-6 p-5 bg-gray-900 rounded-xl border border-gray-700 w-full max-w-md">
      <h2 className="text-lg font-semibold mb-3">Profil</h2>

      {isEditing ? (
        <div className="flex flex-col gap-3">
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Ton nom d'affichage"
            className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:border-blue-500"
            maxLength={32}
          />
          <div className="flex gap-2">
            <button
              onClick={saveName}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium"
            >
              Enregistrer
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
            >
              Annuler
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Nom d'affichage</p>
            <p className="font-medium">
              {displayName || <span className="text-gray-500 italic">Non défini</span>}
            </p>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            {displayName ? 'Modifier' : 'Ajouter'}
          </button>
        </div>
      )}
    </div>
  )
}