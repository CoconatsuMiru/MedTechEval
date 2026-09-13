import { useState, useEffect, useRef } from 'react'

const sampleCards = [
  {
    category: 'Cardiac Safety',
    progress: 'Q3 of 12',
    question: 'What is the required switchover latency for a fail-safe algorithmic fallback?',
    correctChoice: '< 50ms, deterministic',
    otherChoice: 'Discretionary, within 10s',
    rationale: 'Deterministic switchover prevents dropped detections during signal degradation.'
  },
  {
    category: 'Biocompatibility',
    progress: 'Q7 of 15',
    question: 'Which test is required for direct cutaneous contact under ISO 10993-5?',
    correctChoice: 'MEM elution assay',
    otherChoice: 'Ames mutagenicity test',
    rationale: 'MEM elution assays evaluate in-vitro cytotoxicity for surface-contact devices.'
  },
  {
    category: 'Regulatory & Safety',
    progress: 'Q2 of 10',
    question: 'What does a Class III device classification typically require?',
    correctChoice: 'Premarket approval (PMA)',
    otherChoice: 'Self-certification only',
    rationale: 'Class III devices carry the highest risk and require FDA premarket approval.'
  },
  {
    category: 'Clinical Basics',
    progress: 'Q1 of 8',
    question: 'What is the normal resting adult heart rate range?',
    correctChoice: '60–100 bpm',
    otherChoice: '100–140 bpm',
    rationale: '60–100 bpm is the standard normal resting range for healthy adults.'
  },
  {
    category: 'Data Integrity',
    progress: 'Q5 of 9',
    question: 'What mitigates subject-level data leakage in ML model validation?',
    correctChoice: 'Patient-stratified k-fold splits',
    otherChoice: 'Random row-level shuffling',
    rationale: 'Stratifying by patient prevents the same patient from appearing in both train and test sets.'
  }
]

const realCount = sampleCards.length
const extendedCards = [sampleCards[realCount - 1], ...sampleCards, sampleCards[0]]

function QuestionCardCarousel() {
  const [position, setPosition] = useState(1)
  const [transitionEnabled, setTransitionEnabled] = useState(true)
  const isAnimatingRef = useRef(false)
  const intervalRef = useRef(null)

  function startAutoplay() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      advance(1)
    }, 4000)
  }

  useEffect(() => {
    startAutoplay()
    return () => clearInterval(intervalRef.current)
  }, [])

  function advance(step) {
    if (isAnimatingRef.current) return
    isAnimatingRef.current = true
    setPosition((prev) => prev + step)
  }

  function jumpTo(realIndex) {
    if (isAnimatingRef.current) return
    isAnimatingRef.current = true
    setPosition(realIndex + 1)
  }

  function handleTransitionEnd() {
    if (position === extendedCards.length - 1) {
      setTransitionEnabled(false)
      setPosition(1)
    } else if (position === 0) {
      setTransitionEnabled(false)
      setPosition(realCount)
    }
    isAnimatingRef.current = false
  }

  useEffect(() => {
    if (!transitionEnabled) {
      const id = requestAnimationFrame(() => setTransitionEnabled(true))
      return () => cancelAnimationFrame(id)
    }
  }, [transitionEnabled])

  function goTo(realIndex) {
    jumpTo(realIndex)
    startAutoplay()
  }

  function goNext() {
    advance(1)
    startAutoplay()
  }

  function goPrev() {
    advance(-1)
    startAutoplay()
  }

  const activeDot = ((position - 1) % realCount + realCount) % realCount

  return (
    <div className="w-full max-w-sm">
      <div className="relative overflow-hidden rounded-xl shadow-2xl">
        <div
          className={`flex ${transitionEnabled ? 'transition-transform duration-500 ease-in-out' : ''}`}
          style={{ transform: `translateX(-${position * 100}%)` }}
          onTransitionEnd={handleTransitionEnd}
        >
          {extendedCards.map((card, i) => (
            <div key={i} className="w-full flex-shrink-0 bg-white p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-medium bg-brand-50 text-brand-900 px-2 py-1 rounded">
                  {card.category}
                </span>
                <span className="text-xs font-mono text-ink-500">{card.progress}</span>
              </div>
              <p className="font-semibold text-ink-950 mb-4 leading-snug min-h-[3.5rem]">
                {card.question}
              </p>
              <div className="flex flex-col gap-2 mb-4">
                <div className="text-sm px-3 py-2 rounded-lg bg-status-pass-bg text-status-pass font-medium border border-green-200">
                  ✓ {card.correctChoice}
                </div>
                <div className="text-sm px-3 py-2 rounded-lg border border-slate-200 text-ink-500">
                  {card.otherChoice}
                </div>
              </div>
              <p className="text-xs text-ink-500 italic border-t border-slate-100 pt-3">
                {card.rationale}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 mt-5">
        <button
          onClick={goPrev}
          aria-label="Previous example"
          className="w-7 h-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex gap-2">
          {sampleCards.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Show example ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === activeDot ? 'w-6 bg-white' : 'w-1.5 bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>

        <button
          onClick={goNext}
          aria-label="Next example"
          className="w-7 h-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default QuestionCardCarousel;