import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2, XCircle, Zap } from 'lucide-react';
import { QuizConfig, QuestionItem } from '../config/presets';
import { calculateQuestionScore } from '../utils/realtimeStore';
import { sound } from '../utils/sound';

interface Step3QuestionProps {
  config: QuizConfig;
  question: QuestionItem;
  questionIndex: number;
  totalQuestions: number;
  currentScore: number;
  onAnswerCompleted: (result: {
    isCorrect: boolean;
    pointsEarned: number;
    elapsedSeconds: number;
  }) => void;
}

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

export const Step3Question: React.FC<Step3QuestionProps> = ({
  config,
  question,
  questionIndex,
  totalQuestions,
  currentScore,
  onAnswerCompleted,
}) => {
  const maxTime = config.rules.timePerQuestionSeconds || 20;
  const [timeLeft, setTimeLeft] = useState<number>(maxTime);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [earnedPoints, setEarnedPoints] = useState<number | null>(null);

  const startTimeRef = useRef<number>(performance.now());
  const lastSecondRef = useRef<number>(maxTime);

  useEffect(() => {
    setTimeLeft(maxTime);
    setSelectedIndex(null);
    setIsLocked(false);
    setEarnedPoints(null);
    startTimeRef.current = performance.now();
    lastSecondRef.current = maxTime;
  }, [question.id, maxTime]);

  useEffect(() => {
    if (isLocked) return;

    const interval = setInterval(() => {
      const elapsed = (performance.now() - startTimeRef.current) / 1000;
      const remaining = Math.max(0, maxTime - elapsed);
      setTimeLeft(remaining);

      const ceilSec = Math.ceil(remaining);
      if (ceilSec !== lastSecondRef.current && ceilSec > 0) {
        lastSecondRef.current = ceilSec;
        sound.playTick(ceilSec <= 5);
      }

      if (remaining <= 0) {
        clearInterval(interval);
        handleSelectOption(-1, maxTime);
      }
    }, 80);

    return () => clearInterval(interval);
  }, [isLocked, maxTime, question.id]);

  const handleSelectOption = (index: number, forcedElapsed?: number) => {
    if (isLocked) return;
    setIsLocked(true);
    setSelectedIndex(index);

    const elapsed =
      forcedElapsed !== undefined
        ? forcedElapsed
        : Math.min(maxTime, (performance.now() - startTimeRef.current) / 1000);

    const isCorrect = index === question.correctIndex;
    const pts = calculateQuestionScore(isCorrect, elapsed, maxTime);
    setEarnedPoints(pts);

    if (isCorrect) {
      sound.playCorrect();
    } else {
      sound.playWrong();
    }

    setTimeout(() => {
      onAnswerCompleted({
        isCorrect,
        pointsEarned: pts,
        elapsedSeconds: Number(elapsed.toFixed(2)),
      });
    }, 1800);
  };

  const progressPercent = Math.max(0, Math.min(100, (timeLeft / maxTime) * 100));
  const isUrgent = timeLeft <= 5 && !isLocked;

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -18 }}
      className="w-full max-w-3xl mx-auto"
    >
      {/* Barra de Topo: Número da Pergunta, Cronômetro e Pontuação */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 bg-zinc-900/90 border border-white/15 rounded-2xl p-3.5 sm:px-5 shadow-lg">
        <div className="flex items-center gap-2.5">
          <span
            className="px-3 py-1 rounded-xl text-xs sm:text-sm font-extrabold text-zinc-950"
            style={{ backgroundColor: config.theme.primaryColor }}
          >
            Pergunta {questionIndex + 1} / {totalQuestions}
          </span>
          <span className="text-xs sm:text-sm font-semibold text-white/75 flex items-center gap-1">
            <Zap className="w-4 h-4 text-amber-400" />
            {currentScore.toLocaleString('pt-BR')} pts
          </span>
        </div>

        {/* Cronômetro Regressivo Visível */}
        <div
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono font-extrabold text-base sm:text-lg border transition-colors ${
            isUrgent
              ? 'bg-rose-600/30 border-rose-500 text-rose-300 animate-pulse'
              : 'bg-black/50 border-white/15 text-white'
          }`}
        >
          <Clock className={`w-4 h-4 ${isUrgent ? 'text-rose-400' : 'text-amber-400'}`} />
          <span>{Math.ceil(timeLeft)}s</span>
        </div>
      </div>

      {/* Barra de Progresso do Tempo */}
      <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden mb-5">
        <div
          className={`h-full transition-all duration-100 rounded-full ${
            isUrgent ? 'bg-rose-500' : ''
          }`}
          style={{
            width: `${progressPercent}%`,
            backgroundColor: isUrgent ? undefined : config.theme.primaryColor,
          }}
        />
      </div>

      {/* Card do Enunciado */}
      <div className="bg-zinc-900/90 backdrop-blur-xl border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl mb-5">
        {question.image && (
          <div className="mb-4 rounded-2xl overflow-hidden max-h-52 bg-black/40 flex items-center justify-center">
            <img
              src={question.image}
              alt="Ilustração da pergunta"
              className="object-cover max-h-52 w-full"
            />
          </div>
        )}

        <h2
          className="text-lg sm:text-2xl font-extrabold text-white leading-snug"
          style={{ fontFamily: config.theme.headingFont || config.theme.fontFamily }}
        >
          {question.question}
        </h2>
      </div>

      {/* 4 Alternativas com área de toque mínima > 56px */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {question.options.map((optionText, idx) => {
          const isSelected = selectedIndex === idx;
          const isCorrectOption = idx === question.correctIndex;

          let btnStyle =
            'bg-zinc-900/85 hover:bg-zinc-800/90 border-white/15 text-white';

          if (isLocked) {
            if (isCorrectOption) {
              btnStyle =
                'bg-emerald-600 border-emerald-300 text-white shadow-lg shadow-emerald-950/60 scale-[1.01]';
            } else if (isSelected && !isCorrectOption) {
              btnStyle =
                'bg-rose-600 border-rose-300 text-white shadow-lg shadow-rose-950/60';
            } else {
              btnStyle = 'bg-zinc-900/40 border-white/5 text-white/40 opacity-60';
            }
          }

          return (
            <button
              key={idx}
              type="button"
              disabled={isLocked}
              onClick={() => handleSelectOption(idx)}
              className={`min-h-[68px] p-4 sm:p-5 rounded-2xl border-2 text-left font-bold text-sm sm:text-base flex items-center justify-between gap-3 transition-all active:scale-[0.98] ${btnStyle}`}
            >
              <div className="flex items-center gap-3.5">
                <span
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0 ${
                    isLocked && isCorrectOption
                      ? 'bg-white text-emerald-700'
                      : isLocked && isSelected && !isCorrectOption
                      ? 'bg-white text-rose-700'
                      : 'bg-white/10 text-white'
                  }`}
                >
                  {OPTION_LABELS[idx]}
                </span>
                <span className="leading-snug">{optionText}</span>
              </div>

              {isLocked && isCorrectOption && (
                <CheckCircle2 className="w-6 h-6 text-white shrink-0" />
              )}
              {isLocked && isSelected && !isCorrectOption && (
                <XCircle className="w-6 h-6 text-white shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Feedback Visual Imediato da Rodada */}
      {isLocked && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-5 p-4 rounded-2xl border flex items-center justify-between ${
            selectedIndex === question.correctIndex
              ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
              : 'bg-rose-950/80 border-rose-500/50 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2.5 font-bold text-sm sm:text-base">
            {selectedIndex === question.correctIndex ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Resposta Correta! Excelente velocidade!</span>
              </>
            ) : selectedIndex === -1 ? (
              <>
                <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                <span>Tempo esgotado!</span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                <span>Ops! Resposta incorreta.</span>
              </>
            )}
          </div>
          <span className="font-extrabold text-base sm:text-lg">
            +{earnedPoints ?? 0} pts
          </span>
        </motion.div>
      )}
    </motion.div>
  );
};
