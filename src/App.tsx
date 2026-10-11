import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletButton } from './components/WalletButton'
import { ProfileForm } from './components/ProfileForm'
import { AttestationsList } from './components/AttestationsList'
import { LearnReact } from './components/LearnReact'
import { AdminPanel } from './components/AdminPanel'
import { loginAsAdmin, isAdminAuthenticated, logoutAdmin } from './lib/adminAuth'

type Tab = 'attestations' | 'learn' | 'admin'

const ADMIN_WALLET = 'DCs6CLUy4N8LM26wr2Pc5c4zQ9WrqYiJTvpamdbA7fSE'

function App() {
  const { publicKey, connected, signMessage } = useWallet()
  const [activeTab, setActiveTab] = useState<Tab>('attestations')
  const [isAdmin, setIsAdmin] = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)

  // Vérifier si un token admin valide existe déjà
  useEffect(() => {
    setIsAdmin(isAdminAuthenticated())
  }, [])

  const handleAdminLogin = async () => {
    if (!publicKey || !signMessage) {
      alert('Wallet non connecté ou ne supporte pas la signature de message')
      return
    }

    setLoginLoading(true)
    const result = await loginAsAdmin(publicKey.toBase58(), signMessage)
    setLoginLoading(false)

    if (result.success) {
      setIsAdmin(true)
      setActiveTab('admin')
      alert('Connexion Admin réussie')
    } else {
      alert('Échec de la connexion Admin : ' + (result.error || 'Erreur inconnue'))
    }
  }

  const handleAdminLogout = () => {
    logoutAdmin()
    setIsAdmin(false)
    setActiveTab('attestations')
  }

  const isAuthorityWallet = publicKey?.toBase58() === ADMIN_WALLET

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center p-4 pb-12">
      <h1 className="text-3xl font-bold mt-6 mb-2">Identia MVP</h1>
      <p className="text-gray-400 text-sm mb-6">Identité + Attestations on Solana</p>

      <WalletButton />

      {connected && publicKey ? (
        <>
          {/* Adresse */}
          <div className="mt-6 p-4 bg-gray-900 rounded-xl border border-gray-700 text-center w-full max-w-md">
            <p className="text-sm text-gray-400 mb-1">Adresse connectée</p>
            <p className="font-mono text-sm break-all">
              {publicKey.toBase58()}
            </p>
          </div>

          <ProfileForm />

          {/* Bouton Connexion Admin (visible seulement si c'est le wallet Authority) */}
          {isAuthorityWallet && !isAdmin && (
            <button
              onClick={handleAdminLogin}
              disabled={loginLoading}
              className="mt-4 px-6 py-2.5 bg-amber-700 hover:bg-amber-600 rounded-lg text-sm font-medium transition disabled:opacity-50"
            >
              {loginLoading ? 'Vérification...' : 'Se connecter en tant qu’Admin'}
            </button>
          )}

          {isAdmin && (
            <button
              onClick={handleAdminLogout}
              className="mt-4 px-4 py-2 text-sm text-red-400 hover:text-red-300"
            >
              Déconnexion Admin
            </button>
          )}

          {/* Navigation */}
          <div className="flex gap-2 mt-8 w-full max-w-md">
            <button
              onClick={() => setActiveTab('attestations')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === 'attestations'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Mes Attestations
            </button>
            <button
              onClick={() => setActiveTab('learn')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === 'learn'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Apprendre React
            </button>

            {/* Onglet Admin visible uniquement si authentifié */}
            {isAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition ${
                  activeTab === 'admin'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                Admin
              </button>
            )}
          </div>

          {/* Contenu */}
          <div className="w-full max-w-md mt-6">
            {activeTab === 'attestations' && <AttestationsList />}
            {activeTab === 'learn' && <LearnReact />}
            {activeTab === 'admin' && isAdmin && <AdminPanel />}
          </div>
        </>
      ) : (
        <p className="text-gray-500 text-sm mt-8">
          Connecte ton wallet pour continuer
        </p>
      )}
    </div>
  )
}

export default App