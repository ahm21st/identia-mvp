import { useState, useEffect, useMemo } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { supabase } from '../lib/supabase'
type Lesson = {
  id: number
  title: string
  content: string
}

type Question = {
  id: number
  question: string
  options: string[]
  correctIndex: number
}

const lessons: Lesson[] = [
  {
    id: 1,
    title: 'Qu’est-ce que React ?',
    content: `React est une bibliothèque JavaScript créée par Meta (Facebook) pour construire des interfaces utilisateur.

Elle permet de créer des composants réutilisables et de gérer efficacement l’affichage grâce à un Virtual DOM.

React est particulièrement populaire pour les applications web modernes et les Progressive Web Apps.`,
  },
  {
    id: 2,
    title: 'Les Composants',
    content: `En React, tout est composant.

Un composant est une fonction (ou une classe) qui retourne du JSX (du HTML enrichi).

Exemple simple :
function Bonjour() {
  return <h1>Bonjour Identia !</h1>
}

On peut ensuite réutiliser ce composant partout dans l’application.`,
  },
  {
    id: 3,
    title: 'Le State (état)',
    content: `Le state permet à un composant de « se souvenir » de données qui peuvent changer.

On utilise le hook useState :

const [count, setCount] = useState(0)

Quand on appelle setCount, React re-render le composant avec la nouvelle valeur.

C’est la base de l’interactivité dans React.`,
  },
]

const baseQuestions: Question[] = [
  {
    id: 1,
    question: "Que se passe-t-il quand on appelle le setter de useState (ex: setCount) ?",
    options: [
      "Le navigateur recharge complètement la page",
      "React planifie un re-render du composant et de ses enfants",
      "Seul le DOM réel est modifié directement",
      "Rien, il faut appeler forceUpdate()"
    ],
    correctIndex: 1,
  },
  {
    id: 2,
    question: "Pourquoi utilise-t-on souvent une fonction de mise à jour avec useState (ex: setCount(c => c + 1)) ?",
    options: [
      "Parce que c’est plus rapide",
      "Pour être sûr d’avoir la valeur la plus récente du state, surtout lors de mises à jour multiples",
      "Parce que React l’impose obligatoirement",
      "Uniquement pour les tableaux et objets"
    ],
    correctIndex: 1,
  },
  {
    id: 3,
    question: "Que représente le Virtual DOM dans React ?",
    options: [
      "Une copie exacte du DOM du navigateur stockée en base de données",
      "Une représentation légère en mémoire de l’UI que React utilise pour calculer les différences",
      "Un navigateur spécial créé par Meta",
      "Le DOM réel optimisé par le moteur JavaScript"
    ],
    correctIndex: 1,
  },
  {
    id: 4,
    question: "Dans quel cas useEffect avec un tableau de dépendances vide [] s’exécute-t-il ?",
    options: [
      "À chaque render du composant",
      "Uniquement au démontage du composant",
      "Uniquement après le premier render (montage)",
      "Jamais"
    ],
    correctIndex: 2,
  },
]

// Mélanger un tableau (Fisher-Yates)
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function getLevel(score: number, total: number): string {
  const percentage = (score / total) * 100
  if (percentage >= 85) return 'Avancé'
  if (percentage >= 60) return 'Intermédiaire'
  return 'Débutant'
}

const QUIZ_TIME_SECONDS = 150 // 2 minutes 30

export function LearnReact() {
  const { publicKey } = useWallet()
  const [currentLesson, setCurrentLesson] = useState(0)
  const [phase, setPhase] = useState<'lessons' | 'quiz' | 'result'>('lessons')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(QUIZ_TIME_SECONDS)
  const [quizStarted, setQuizStarted] = useState(false)

  // Questions mélangées à chaque nouveau quiz
   // se régénère quand on repasse en phase quiz

  // Correction du correctIndex après shuffle des options
  const preparedQuestions = useMemo(() => {
    return shuffleArray(baseQuestions).map((q) => {
      const originalCorrect = q.options[q.correctIndex]
      const shuffledOptions = shuffleArray(q.options)
      return {
        ...q,
        options: shuffledOptions,
        correctIndex: shuffledOptions.indexOf(originalCorrect),
      }
    })
  }, [quizStarted])

  // Timer
  useEffect(() => {
    if (phase !== 'quiz' || !quizStarted) return

    if (timeLeft <= 0) {
      setPhase('result')
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [phase, quizStarted, timeLeft])

  const lesson = lessons[currentLesson]

  const handleNextLesson = () => {
    if (currentLesson < lessons.length - 1) {
      setCurrentLesson(currentLesson + 1)
    } else {
      // Démarrer le quiz
      setQuizStarted(true)
      setTimeLeft(QUIZ_TIME_SECONDS)
      setCurrentQuestion(0)
      setScore(0)
      setPhase('quiz')
    }
  }

  const handleAnswer = (optionIndex: number) => {
    const currentQ = preparedQuestions[currentQuestion]

    if (optionIndex === currentQ.correctIndex) {
      setScore((prev) => prev + 1)
    }

    if (currentQuestion < preparedQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      setPhase('result')
    }
  }

  const handleRequestAttestation = async () => {
    if (!publicKey) return

    const level = getLevel(score, preparedQuestions.length)

    const { error } = await supabase
      .from('attestation_requests')
      .insert([
        {
          wallet: publicKey.toBase58(),
          skill: 'React',
          level,
          score,
          total: preparedQuestions.length,
          status: 'pending',
        },
      ])

    if (error) {
      console.error(error)
      alert("Erreur lors de l'envoi de la demande. Vérifie la console.")
      return
    }

    alert(
      `Demande d'attestation envoyée avec succès !\n\nNiveau : ${level}\nScore : ${score}/${preparedQuestions.length}\n\nL'admin va pouvoir la traiter.`
    )
  }
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  // === PHASE LEÇONS ===
  if (phase === 'lessons') {
    return (
      <div className="bg-gray-900 rounded-xl border border-gray-700 p-5">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs text-gray-500">
            Leçon {currentLesson + 1} / {lessons.length}
          </span>
          <div className="flex gap-1">
            {lessons.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i <= currentLesson ? 'bg-blue-500' : 'bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>

        <h3 className="text-xl font-semibold mb-4">{lesson.title}</h3>
        <p className="text-gray-300 leading-relaxed whitespace-pre-line mb-8">
          {lesson.content}
        </p>

        <button
          onClick={handleNextLesson}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition"
        >
          {currentLesson < lessons.length - 1 ? 'Leçon suivante →' : 'Passer au Quiz →'}
        </button>
      </div>
    )
  }

  // === PHASE QUIZ ===
  if (phase === 'quiz') {
    const q = preparedQuestions[currentQuestion]

    return (
      <div className="bg-gray-900 rounded-xl border border-gray-700 p-5">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs text-gray-500">
            Question {currentQuestion + 1} / {preparedQuestions.length}
          </span>
          <span
            className={`text-sm font-mono font-medium ${
              timeLeft <= 30 ? 'text-red-400' : 'text-blue-300'
            }`}
          >
            ⏱ {formatTime(timeLeft)}
          </span>
        </div>

        <h3 className="text-lg font-medium mb-6">{q.question}</h3>

        <div className="space-y-3">
          {q.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              className="w-full text-left px-4 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition"
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // === PHASE RÉSULTAT ===
  const level = getLevel(score, preparedQuestions.length)
  const timedOut = timeLeft <= 0

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-700 p-5 text-center">
      <h3 className="text-xl font-semibold mb-2">
        {timedOut ? 'Temps écoulé !' : 'Résultat du Quiz'}
      </h3>
      <p className="text-gray-400 mb-6">
        Tu as obtenu <span className="text-white font-bold">{score}/{preparedQuestions.length}</span>
      </p>

      <div className="inline-block bg-gray-800 border border-gray-700 rounded-xl px-8 py-4 mb-6">
        <p className="text-sm text-gray-400 mb-1">Niveau obtenu</p>
        <p className="text-2xl font-bold text-blue-400">{level}</p>
      </div>

      <p className="text-sm text-gray-400 mb-6">
        Compétence : <span className="text-white">React</span>
      </p>

      <button
        onClick={handleRequestAttestation}
        className="w-full py-3 bg-green-600 hover:bg-green-500 rounded-lg font-medium transition mb-3"
      >
        Demander l’attestation
      </button>

      <button
        onClick={() => {
          setPhase('lessons')
          setCurrentLesson(0)
          setCurrentQuestion(0)
          setScore(0)
          setQuizStarted(false)
          setTimeLeft(QUIZ_TIME_SECONDS)
        }}
        className="w-full py-2.5 text-sm text-gray-400 hover:text-white transition"
      >
        Recommencer les leçons
      </button>
    </div>
  )
}