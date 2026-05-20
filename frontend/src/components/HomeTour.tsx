/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, X, Sparkles, Shield, Mic, BarChart3, TrendingUp, Zap, Wallet, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useUser } from '../context/userContext'

/**
 * HomeTour component – guided walkthrough highlighting UI elements.
 * Adjusted positioning logic ensures the tooltip/popup never covers the highlighted element.
 */
const HomeTour = ({ onComplete }: { onComplete: () => Promise<void> }) => {
  const { t } = useTranslation()
  const { user } = useUser()
  const [step, setStep] = useState(0)
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 })
  const [isFinishing, setIsFinishing] = useState(false)

  const steps = [
    {
      targetId: 'tour-carteira',
      title: t('tour_carteira_title', 'Tuas Contas'),
      content: t('tour_carteira_desc', 'Clica aqui para gerenciar e adicionar novas contas. Como também ajustar o teu orçamento total.'),
      icon: <Wallet className="text-indigo-400" />
    },
    {
      targetId: 'tour-seguranca',
      title: t('tour_seguranca_title', 'Dias de Segurança'),
      content: user?.incomeType === 'VARIABLE'
        ? t('tour_seguranca_desc_variable', 'Este escudo indica quanto tempo as tuas reservas atuais garantem o teu estilo de vida. Mantém-no sempre verde!')
        : t('tour_seguranca_desc', 'Este escudo mostra a tua autonomia financeira. A linha branca indica o dia do teu salário — mantém a barra verde para chegar ao próximo pagamento com tranquilidade!'),
      icon: <Shield className="text-emerald-400" />
    },
    {
      targetId: 'tour-simulacao',
      title: t('tour_simulacao_title', 'Poder de Previsão'),
      content: t('tour_simulacao_desc', 'Ativa o Oráculo para simular o impacto de compras futuras antes de as realizares.'),
      icon: <Sparkles className="text-indigo-400" />
    },
    {
      targetId: 'tour-input-texto',
      title: t('tour_texto_title', 'Registo por Texto'),
      content: t('tour_texto_desc', 'Escreve frases naturais como "gastei 50 no jantar" e o Oráculo categoriza tudo por ti.'),
      icon: <Zap className="text-amber-400" />
    },
    {
      targetId: 'tour-input-audio',
      title: t('tour_audio_title', 'Registo por Voz'),
      content: t('tour_audio_desc', 'Segura no microfone para ditar as tuas transações sem precisares de escrever.'),
      icon: <Mic className="text-rose-400" />
    }
  ]

  const updateCoords = useCallback(() => {
    const targetId = steps[step].targetId
    if (!targetId) {
      // centre fallback
      setCoords({ top: window.innerHeight / 2 - 100, left: window.innerWidth / 2 - 150, width: 300, height: 200 })
      return
    }
    const element = document.getElementById(targetId)
    if (element) {
      const rect = element.getBoundingClientRect()
      setCoords(prev => {
        if (prev.top === rect.top && prev.left === rect.left && prev.width === rect.width) return prev
        return { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
      })
    }
  }, [step, steps])

  useEffect(() => {
    updateCoords()
    let rafId: number
    const sync = () => {
      updateCoords()
      rafId = requestAnimationFrame(sync)
    }
    rafId = requestAnimationFrame(sync)
    window.addEventListener('resize', updateCoords)
    window.addEventListener('scroll', updateCoords, true)
    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', updateCoords)
      window.removeEventListener('scroll', updateCoords, true)
    }
  }, [updateCoords])

  // Scroll target into view when step changes
  useEffect(() => {
    const targetId = steps[step].targetId
    if (targetId) {
      setTimeout(() => {
        const el = document.getElementById(targetId)
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 100)
    }
  }, [step])

  const nextStep = async () => {
    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      setIsFinishing(true)
      try {
        await onComplete()
      } finally {
        setIsFinishing(false)
      }
    }
  }

  const skipTour = async () => {
    setIsFinishing(true)
    try {
      await onComplete()
    } finally {
      setIsFinishing(false)
    }
  }

  // ---- Positioning helpers ----
  const targetCX = coords.left + coords.width / 2
  const popupLeft = Math.max(20, Math.min(window.innerWidth - 320, targetCX - 150))
  const arrowLeft = Math.max(20, Math.min(280, targetCX - popupLeft))

  // Decide whether we place the popup above or below the highlighted element.
  // If the element is in the lower half of the viewport, we place the popup above it.
  // Otherwise we place it below. An extra 15px margin guarantees no overlap.
  const isBelow = coords.top <= window.innerHeight / 2
  const verticalMargin = 15
  const popupY = isBelow
    ? coords.top + coords.height + verticalMargin // below the element
    : Math.max(0, coords.top - 295 - verticalMargin)   // above the element (295 is approx popup height)

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 100 }}>
      {/* Spotlight overlay */}
      <motion.div className="absolute inset-0 pointer-events-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <svg className="w-full h-full">
          <defs>
            <mask id="spotlight-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              <rect
                x={coords.left - 4}
                y={coords.top - 4}
                width={coords.width + 8}
                height={coords.height + 8}
                rx="16"
                fill="black"
              />
            </mask>
          </defs>
          <rect x="0" y="0" width="100%" height="100%" fill="black" fillOpacity="0.6" mask="url(#spotlight-mask)" />
        </svg>
        <div
          className="absolute inset-0 backdrop-blur-[3px]"
          style={{
            clipPath: `polygon(
              0% 0%,
              0% 100%,
              ${coords.left - 4}px 100%,
              ${coords.left - 4}px ${coords.top - 4}px,
              ${coords.left + coords.width + 4}px ${coords.top - 4}px,
              ${coords.left + coords.width + 4}px ${coords.top + coords.height + 4}px,
              ${coords.left - 4}px ${coords.top + coords.height + 4}px,
              ${coords.left - 4}px 100%,
              100% 100%,
              100% 0%
            )`
          }}
        />
      </motion.div>

      {/* Popup */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          className="absolute pointer-events-auto"
          style={{ zIndex: 101, top: popupY, left: popupLeft }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          {/* Arrow */}
          {isBelow ? (
            <motion.div
              className="absolute"
              style={{ left: arrowLeft - 11, top: -18, transform: 'translateX(-50%)' }}
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            >
              <div
                style={{ width: 0, height: 0, borderLeft: '12px solid transparent', borderRight: '12px solid transparent', borderBottom: '12px solid white' }}
                className="dark:border-b-indigo-500!"
              />
            </motion.div>
          ) : (
            <motion.div
              className="absolute"
              style={{ left: arrowLeft - 12, bottom: -18, transform: 'translateX(-50%)' }}
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            >
              <div
                style={{ width: 0, height: 0, borderLeft: '12px solid transparent', borderRight: '12px solid transparent', borderTop: '12px solid white' }}
                className="dark:border-t-indigo-500!"
              />
            </motion.div>
          )}

          <div className="w-[300px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-5 rounded-3xl border border-white/20 dark:border-white/10 shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl">{steps[step].icon}</div>
              <button
                onClick={skipTour}
                disabled={isFinishing}
                className="text-[10px] font-black uppercase text-gray-400 hover:text-indigo-500 dark:text-slate-500 dark:hover:text-indigo-400 transition-colors py-1 px-3 disabled:opacity-50 flex items-center gap-1.5"
              >
                {isFinishing && <Loader2 size={10} className="animate-spin" />}
                {t('pular', 'Pular')}
              </button>
            </div>
            <h3 className="text-lg font-black text-gray-800 dark:text-slate-100 mb-2 leading-tight">{steps[step].title}</h3>
            <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed mb-6 font-medium">{steps[step].content}</p>
            <div className="flex items-center justify-between">
              <div className="flex gap-1.5">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-4 bg-indigo-600' : 'w-1.5 bg-gray-200 dark:bg-slate-700'}`}
                  />
                ))}
              </div>
              <button
                onClick={nextStep}
                disabled={isFinishing}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-2xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all text-sm disabled:opacity-70"
              >
                {isFinishing ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : step === steps.length - 1 ? (
                  t('concluir', 'Concluir')
                ) : (
                  <>
                    {t('proximo', 'Próximo')}
                    <ChevronRight size={16} strokeWidth={3} />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default HomeTour
