import React from 'react';
import { motion } from 'framer-motion';
import { Shuffle, Swords, ArrowLeft } from 'lucide-react';
import {
  AvatarConfig,
  AvatarPreview,
  SKIN_COLORS,
  HAIR_COLORS,
  BG_COLORS,
  BADGE_EMOJIS,
} from './AvatarSystem';
import { QuizConfig } from '../config/presets';
import { sound } from '../utils/sound';

interface Step2AvatarProps {
  config: QuizConfig;
  playerName: string;
  avatar: AvatarConfig;
  setAvatar: React.Dispatch<React.SetStateAction<AvatarConfig>>;
  onBack: () => void;
  onStartQuiz: () => void;
}

const HAIR_STYLES: { id: AvatarConfig['hairStyle']; label: string }[] = [
  { id: 'curto', label: 'Curto' },
  { id: 'longo', label: 'Longo' },
  { id: 'cacheado', label: 'Cacheado' },
  { id: 'coque', label: 'Coque' },
  { id: 'moicano', label: 'Moicano' },
];

const EXPRESSIONS: { id: AvatarConfig['expression']; label: string }[] = [
  { id: 'confiante', label: '😏 Confiante' },
  { id: 'feliz', label: '😄 Feliz' },
  { id: 'focado', label: '😤 Focado' },
  { id: 'surpreso', label: '😮 Surpreso' },
];

const ACCESSORIES: { id: AvatarConfig['accessory']; label: string }[] = [
  { id: 'nenhum', label: 'Sem Acessório' },
  { id: 'oculos', label: '👓 Óculos Leitor' },
  { id: 'coroa_louros', label: '🌿 Coroa Olimpo' },
  { id: 'chapeu_mago', label: '🎩 Chapéu Místico' },
  { id: 'fones', label: '🎧 Fones Rose Hill' },
];

const BADGES: { id: AvatarConfig['badge']; label: string }[] = [
  { id: 'lanterna', label: '🔦 Lanterna' },
  { id: 'cafe', label: '☕ Café' },
  { id: 'livro', label: '📖 Livro' },
  { id: 'raio', label: '⚡ Raio' },
  { id: 'coruja', label: '🦉 Coruja' },
  { id: 'rosa', label: '🌹 Rosa' },
  { id: 'espada', label: '⚔️ Espada' },
];

export const Step2Avatar: React.FC<Step2AvatarProps> = ({
  config,
  playerName,
  avatar,
  setAvatar,
  onBack,
  onStartQuiz,
}) => {
  const randomizeAvatar = () => {
    sound.playClick();
    const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
    setAvatar({
      skinColor: pick(SKIN_COLORS).value,
      hairStyle: pick(HAIR_STYLES).id,
      hairColor: pick(HAIR_COLORS).value,
      expression: pick(EXPRESSIONS).id,
      accessory: pick(ACCESSORIES).id,
      badge: pick(BADGES).id,
      bgColor: pick(BG_COLORS).value,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="w-full max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
    >
      {/* Preview em Tempo Real do Personagem */}
      <div className="lg:col-span-5 bg-zinc-900/85 backdrop-blur-xl border border-white/15 rounded-3xl p-6 flex flex-col items-center text-center shadow-2xl lg:sticky lg:top-6">
        <span className="text-xs font-bold uppercase tracking-widest text-white/60 mb-3">
          Seu Personagem no Clube
        </span>

        <div className="my-3 relative">
          <AvatarPreview config={avatar} size={156} />
        </div>

        <h2
          className="text-2xl font-extrabold mt-2 text-white break-words max-w-full"
          style={{ fontFamily: config.theme.headingFont || config.theme.fontFamily }}
        >
          {playerName}
        </h2>
        <p className="text-xs text-white/60 mt-1 mb-5">
          Competidor(a) • {config.edition}
        </p>

        <div className="flex items-center gap-2 w-full">
          <button
            type="button"
            onClick={randomizeAvatar}
            className="flex-1 min-h-[48px] py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-sm font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Shuffle className="w-4 h-4" />
            <span>Sortear Visual</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            sound.playFanfare();
            onStartQuiz();
          }}
          className="mt-4 w-full min-h-[56px] py-4 px-6 rounded-2xl font-extrabold text-base sm:text-lg text-zinc-950 shadow-xl flex items-center justify-center gap-2.5 transition-transform active:scale-95 hover:brightness-110"
          style={{ backgroundColor: config.theme.primaryColor }}
        >
          <Swords className="w-5 h-5" />
          <span>Entrar na Batalha!</span>
        </button>

        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onBack();
          }}
          className="mt-3 text-xs font-semibold text-white/60 hover:text-white flex items-center gap-1 py-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar e alterar nome
        </button>
      </div>

      {/* Painel de Customização */}
      <div className="lg:col-span-7 bg-zinc-900/85 backdrop-blur-xl border border-white/15 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-2.5">
            1. Tom de Pele
          </label>
          <div className="flex flex-wrap gap-2.5">
            {SKIN_COLORS.map((skin) => (
              <button
                key={skin.value}
                type="button"
                onClick={() => {
                  sound.playClick();
                  setAvatar((prev) => ({ ...prev, skinColor: skin.value }));
                }}
                className={`w-11 h-11 rounded-full border-2 transition-transform ${
                  avatar.skinColor === skin.value
                    ? 'scale-110 border-white ring-2 ring-amber-400'
                    : 'border-white/20 hover:scale-105'
                }`}
                style={{ backgroundColor: skin.value }}
                title={skin.name}
                aria-label={`Tom de pele ${skin.name}`}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-2.5">
            2. Estilo de Cabelo
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {HAIR_STYLES.map((style) => (
              <button
                key={style.id}
                type="button"
                onClick={() => {
                  sound.playClick();
                  setAvatar((prev) => ({ ...prev, hairStyle: style.id }));
                }}
                className={`min-h-[48px] px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                  avatar.hairStyle === style.id
                    ? 'bg-white text-zinc-950 border-white shadow-md'
                    : 'bg-white/5 text-white/80 border-white/10 hover:bg-white/10'
                }`}
              >
                {style.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-2.5">
            3. Cor do Cabelo
          </label>
          <div className="flex flex-wrap gap-2.5">
            {HAIR_COLORS.map((hair) => (
              <button
                key={hair.value}
                type="button"
                onClick={() => {
                  sound.playClick();
                  setAvatar((prev) => ({ ...prev, hairColor: hair.value }));
                }}
                className={`w-10 h-10 rounded-full border-2 transition-transform ${
                  avatar.hairColor === hair.value
                    ? 'scale-110 border-white ring-2 ring-amber-400'
                    : 'border-white/20 hover:scale-105'
                }`}
                style={{ backgroundColor: hair.value }}
                title={hair.name}
                aria-label={`Cor do cabelo ${hair.name}`}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-2.5">
            4. Expressão / Humor
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {EXPRESSIONS.map((exp) => (
              <button
                key={exp.id}
                type="button"
                onClick={() => {
                  sound.playClick();
                  setAvatar((prev) => ({ ...prev, expression: exp.id }));
                }}
                className={`min-h-[48px] px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                  avatar.expression === exp.id
                    ? 'bg-white text-zinc-950 border-white shadow-md'
                    : 'bg-white/5 text-white/80 border-white/10 hover:bg-white/10'
                }`}
              >
                {exp.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-2.5">
            5. Acessório Literário
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ACCESSORIES.map((acc) => (
              <button
                key={acc.id}
                type="button"
                onClick={() => {
                  sound.playClick();
                  setAvatar((prev) => ({ ...prev, accessory: acc.id }));
                }}
                className={`min-h-[48px] px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                  avatar.accessory === acc.id
                    ? 'bg-white text-zinc-950 border-white shadow-md'
                    : 'bg-white/5 text-white/80 border-white/10 hover:bg-white/10'
                }`}
              >
                {acc.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-2.5">
              6. Insígnia do Clube
            </label>
            <div className="flex flex-wrap gap-2">
              {BADGES.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setAvatar((prev) => ({ ...prev, badge: b.id }));
                  }}
                  className={`min-h-[44px] px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    avatar.badge === b.id
                      ? 'bg-white text-zinc-950 border-white'
                      : 'bg-white/5 text-white/80 border-white/10'
                  }`}
                >
                  {BADGE_EMOJIS[b.id]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-2.5">
              7. Cor da Aura / Fundo
            </label>
            <div className="flex flex-wrap gap-2">
              {BG_COLORS.map((bg) => (
                <button
                  key={bg.value}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setAvatar((prev) => ({ ...prev, bgColor: bg.value }));
                  }}
                  className={`w-9 h-9 rounded-full border-2 transition-transform ${
                    avatar.bgColor === bg.value
                      ? 'scale-110 border-white ring-2 ring-amber-400'
                      : 'border-white/20'
                  }`}
                  style={{ backgroundColor: bg.value }}
                  title={bg.name}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
