import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Crown, Share2, RotateCcw, Award, Clock, CheckCircle2, Sparkles } from 'lucide-react';
import { QuizConfig } from '../config/presets';
import { PlayerRecord } from '../utils/realtimeStore';
import { AvatarPreview } from './AvatarSystem';
import { sound } from '../utils/sound';

interface Step5PodiumProps {
  config: QuizConfig;
  players: PlayerRecord[];
  currentPlayerId: string;
  totalQuestions: number;
  onRestart: () => void;
}

export const Step5Podium: React.FC<Step5PodiumProps> = ({
  config,
  players,
  currentPlayerId,
  totalQuestions,
  onRestart,
}) => {
  const [copied, setCopied] = useState(false);

  const first = players[0];
  const second = players[1];
  const third = players[2];
  const myRecord = players.find((p) => p.id === currentPlayerId) || first;

  useEffect(() => {
    sound.playFanfare();
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: [config.theme.primaryColor, '#fbbf24', '#ffffff'],
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: [config.theme.primaryColor, '#fbbf24', '#ffffff'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, [config.theme.primaryColor]);

  const avgTime =
    myRecord && myRecord.correctCount > 0
      ? (myRecord.totalCorrectTimeSeconds / myRecord.correctCount).toFixed(1)
      : '0.0';

  const handleShareResult = async () => {
    sound.playClick();
    if (!myRecord) return;
    const shareText = `📚🏆 Concluí o Quiz do ${config.edition}!\n\n👤 Leitor(a): ${myRecord.name}\n🥇 Posição Final: ${myRecord.currentRank}º lugar\n⚡ Pontuação: ${myRecord.score} pts\n✅ Acertos: ${myRecord.correctCount}/${totalQuestions}\n⏱️ Tempo médio: ${avgTime}s`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Resultado - ${config.edition}`,
          text: shareText,
        });
        return;
      } catch {
        // fallback para copiar
      }
    }
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      alert(shareText);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto space-y-6"
    >
      {/* Cabeçalho de Celebração */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-extrabold uppercase tracking-widest">
          <Sparkles className="w-4 h-4" />
          Batalha Literária Encerrada
        </div>
        <h1
          className="text-3xl sm:text-5xl font-extrabold text-white drop-shadow"
          style={{ fontFamily: config.theme.headingFont || config.theme.fontFamily }}
        >
          Pódio Oficial • {config.edition}
        </h1>
      </div>

      {/* Pódio Animado (2º, 1º e 3º Lugares) */}
      <div className="bg-zinc-900/90 backdrop-blur-xl border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="grid grid-cols-3 gap-3 sm:gap-6 items-end pt-6 pb-2 max-w-2xl mx-auto">
          {/* 2º Lugar */}
          {second ? (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="flex flex-col items-center text-center"
            >
              <AvatarPreview config={second.avatar} size={68} />
              <span className="mt-2 font-extrabold text-xs sm:text-sm text-white truncate max-w-full">
                {second.name}
              </span>
              <span className="text-xs font-bold text-zinc-300 mb-2">
                {second.score.toLocaleString('pt-BR')} pts
              </span>
              <div className="w-full h-28 sm:h-36 rounded-t-2xl bg-gradient-to-t from-zinc-800 to-zinc-500/60 border-t-4 border-zinc-300 flex flex-col items-center justify-start pt-3 shadow-lg">
                <span className="text-2xl sm:text-3xl font-black text-white">2º</span>
                <span className="text-[11px] text-white/75">{second.correctCount}/{totalQuestions} acertos</span>
              </div>
            </motion.div>
          ) : (
            <div />
          )}

          {/* 1º Lugar (Campeão) */}
          {first ? (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.45, type: 'spring' }}
              className="flex flex-col items-center text-center"
            >
              <Crown className="w-9 h-9 text-amber-400 mb-1 animate-bounce" />
              <AvatarPreview
                config={first.avatar}
                size={88}
                className="ring-4 ring-amber-400"
              />
              <span className="mt-2.5 font-extrabold text-sm sm:text-base text-amber-300 truncate max-w-full">
                {first.name}
              </span>
              <span className="text-xs sm:text-sm font-black text-white mb-2">
                {first.score.toLocaleString('pt-BR')} pts
              </span>
              <div className="w-full h-36 sm:h-48 rounded-t-2xl bg-gradient-to-t from-amber-900/80 via-amber-600/80 to-amber-400 border-t-4 border-yellow-200 flex flex-col items-center justify-start pt-4 shadow-2xl">
                <span className="text-3xl sm:text-4xl font-black text-zinc-950">1º</span>
                <span className="text-xs font-extrabold text-zinc-950 mt-1">
                  {first.correctCount}/{totalQuestions} acertos
                </span>
              </div>
            </motion.div>
          ) : (
            <div />
          )}

          {/* 3º Lugar */}
          {third ? (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center text-center"
            >
              <AvatarPreview config={third.avatar} size={64} />
              <span className="mt-2 font-extrabold text-xs sm:text-sm text-white truncate max-w-full">
                {third.name}
              </span>
              <span className="text-xs font-bold text-amber-600 mb-2">
                {third.score.toLocaleString('pt-BR')} pts
              </span>
              <div className="w-full h-24 sm:h-28 rounded-t-2xl bg-gradient-to-t from-amber-950 to-amber-800/70 border-t-4 border-amber-600 flex flex-col items-center justify-start pt-2.5 shadow-lg">
                <span className="text-xl sm:text-2xl font-black text-white">3º</span>
                <span className="text-[11px] text-white/75">{third.correctCount}/{totalQuestions} acertos</span>
              </div>
            </motion.div>
          ) : (
            <div />
          )}
        </div>
      </div>

      {/* Resumo de Desempenho Individual do Jogador */}
      {myRecord && (
        <div className="bg-zinc-900/90 backdrop-blur-xl border border-white/15 rounded-3xl p-6 sm:p-7 shadow-2xl">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white/60 mb-4">
            Seu Desempenho Individual ({myRecord.name})
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-black/40 border border-white/10 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase mb-1">
                <Award className="w-4 h-4" />
                Posição Final
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white">
                {myRecord.currentRank}º Lugar
              </div>
            </div>

            <div className="bg-black/40 border border-white/10 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase mb-1">
                <CheckCircle2 className="w-4 h-4" />
                Total de Acertos
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white">
                {myRecord.correctCount} / {totalQuestions}
              </div>
            </div>

            <div className="bg-black/40 border border-white/10 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase mb-1">
                <Clock className="w-4 h-4" />
                Tempo Médio
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white">
                {avgTime}s
              </div>
            </div>

            <div className="bg-black/40 border border-white/10 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase mb-1">
                <Sparkles className="w-4 h-4" />
                Pontuação Final
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white">
                {myRecord.score.toLocaleString('pt-BR')}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleShareResult}
              className="flex-1 min-h-[54px] py-3.5 px-6 rounded-2xl font-extrabold text-base text-zinc-950 shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-95 hover:brightness-110"
              style={{ backgroundColor: config.theme.primaryColor }}
            >
              <Share2 className="w-5 h-5" />
              <span>
                {copied
                  ? 'Resultado Copiado para o WhatsApp/Instagram!'
                  : 'Compartilhar Meu Resultado'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onRestart();
              }}
              className="min-h-[54px] py-3.5 px-6 rounded-2xl font-bold text-base bg-white/10 hover:bg-white/15 border border-white/15 text-white flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Jogar Novamente</span>
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};
