import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ArrowUp, ArrowDown, Minus, ArrowRight, Flame, Clock } from 'lucide-react';
import { QuizConfig } from '../config/presets';
import { PlayerRecord } from '../utils/realtimeStore';
import { AvatarPreview } from './AvatarSystem';
import { sound } from '../utils/sound';

interface Step4LeaderboardProps {
  config: QuizConfig;
  players: PlayerRecord[];
  currentPlayerId: string;
  questionIndex: number;
  totalQuestions: number;
  lastResult: {
    isCorrect: boolean;
    pointsEarned: number;
    elapsedSeconds: number;
  } | null;
  onNextQuestion: () => void;
}

export const Step4Leaderboard: React.FC<Step4LeaderboardProps> = ({
  config,
  players,
  currentPlayerId,
  questionIndex,
  totalQuestions,
  lastResult,
  onNextQuestion,
}) => {
  const [canAdvance, setCanAdvance] = useState(false);

  useEffect(() => {
    setCanAdvance(false);
    const timer = setTimeout(() => {
      setCanAdvance(true);
    }, 900);
    return () => clearTimeout(timer);
  }, [questionIndex]);

  const topPlayers = players.slice(0, 8);
  const isLastQuestion = questionIndex + 1 >= totalQuestions;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="w-full max-w-3xl mx-auto"
    >
      {/* Resumo da Rodada do Jogador */}
      {lastResult && (
        <div
          className={`mb-5 p-4 sm:p-5 rounded-3xl border flex flex-wrap items-center justify-between gap-4 shadow-xl ${
            lastResult.isCorrect
              ? 'bg-emerald-950/70 border-emerald-500/40'
              : 'bg-zinc-900/85 border-white/15'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-lg ${
                lastResult.isCorrect
                  ? 'bg-emerald-500 text-zinc-950'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}
            >
              {lastResult.isCorrect ? `+${lastResult.pointsEarned}` : '0'}
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base sm:text-lg">
                {lastResult.isCorrect
                  ? 'Mandou muito bem na rodada!'
                  : 'Não pontuou nesta rodada'}
              </h3>
              <p className="text-xs text-white/70 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                Tempo de resposta: <strong>{lastResult.elapsedSeconds}s</strong>
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs uppercase tracking-wider text-white/60 block font-semibold">
              Rodada Concluída
            </span>
            <span className="text-lg font-extrabold text-white">
              {questionIndex + 1} de {totalQuestions}
            </span>
          </div>
        </div>
      )}

      {/* Placar Parcial / Leaderboard Estilo Kahoot */}
      <div className="bg-zinc-900/90 backdrop-blur-xl border border-white/15 rounded-3xl p-5 sm:p-7 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-6 h-6 text-amber-400" />
            <h2
              className="text-xl sm:text-2xl font-extrabold text-white"
              style={{ fontFamily: config.theme.headingFont || config.theme.fontFamily }}
            >
              Placar Parcial • Top Competidores
            </h2>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/10 text-white/80">
            Desempate: menor tempo
          </span>
        </div>

        <div className="space-y-2.5">
          <AnimatePresence>
            {topPlayers.map((player, index) => {
              const isMe = player.id === currentPlayerId;
              const rankDelta = (player.previousRank || player.currentRank) - player.currentRank;

              return (
                <motion.div
                  key={player.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 350,
                    damping: 28,
                    delay: index * 0.05,
                  }}
                  className={`p-3 sm:p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                    isMe
                      ? 'bg-white/15 border-amber-400 shadow-lg ring-1 ring-amber-400/50'
                      : 'bg-black/40 border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Posição Atual */}
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0 ${
                        player.currentRank === 1
                          ? 'bg-amber-400 text-zinc-950'
                          : player.currentRank === 2
                          ? 'bg-zinc-300 text-zinc-950'
                          : player.currentRank === 3
                          ? 'bg-amber-700 text-white'
                          : 'bg-white/10 text-white/75'
                      }`}
                    >
                      {player.currentRank}º
                    </div>

                    {/* Avatar */}
                    <AvatarPreview config={player.avatar} size={44} showBadge={true} />

                    {/* Nome e Variação de Posição */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm sm:text-base text-white truncate">
                          {player.name}
                        </span>
                        {isMe && (
                          <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-md bg-amber-400 text-zinc-950">
                            Você
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-white/60 mt-0.5">
                        {/* Indicador de subida / queda no ranking */}
                        {rankDelta > 0 ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                            <ArrowUp className="w-3 h-3" /> +{rankDelta} pos
                          </span>
                        ) : rankDelta < 0 ? (
                          <span className="text-rose-400 font-bold flex items-center gap-0.5">
                            <ArrowDown className="w-3 h-3" /> {rankDelta} pos
                          </span>
                        ) : (
                          <span className="text-white/40 flex items-center gap-0.5">
                            <Minus className="w-3 h-3" /> manteve
                          </span>
                        )}

                        <span>• {player.correctCount} acertos</span>
                        <span>• {player.totalCorrectTimeSeconds.toFixed(1)}s acumulados</span>
                      </div>
                    </div>
                  </div>

                  {/* Pontuação da Rodada e Total */}
                  <div className="text-right shrink-0">
                    <div className="text-base sm:text-lg font-extrabold text-white">
                      {player.score.toLocaleString('pt-BR')}{' '}
                      <span className="text-xs font-normal text-white/60">pts</span>
                    </div>
                    {player.lastRoundPoints > 0 ? (
                      <div className="text-xs font-bold text-emerald-400 flex items-center justify-end gap-0.5">
                        <Flame className="w-3 h-3" /> +{player.lastRoundPoints} na rodada
                      </div>
                    ) : (
                      <div className="text-xs text-white/40">+0 na rodada</div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Botão Próxima Pergunta ou Pódio Final */}
        <div className="mt-6">
          <button
            type="button"
            disabled={!canAdvance}
            onClick={() => {
              sound.playClick();
              onNextQuestion();
            }}
            className={`w-full min-h-[56px] py-4 px-6 rounded-2xl font-extrabold text-base sm:text-lg text-zinc-950 shadow-xl flex items-center justify-center gap-2 transition-all ${
              canAdvance
                ? 'hover:brightness-110 active:scale-[0.98]'
                : 'opacity-50 cursor-not-allowed'
            }`}
            style={{ backgroundColor: config.theme.primaryColor }}
          >
            <span>
              {isLastQuestion
                ? 'Revelar Pódio Final & Vencedor! 🏆'
                : `Próxima Pergunta (${questionIndex + 2}/${totalQuestions})`}
            </span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
