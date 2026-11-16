import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles, Users, ArrowRight, Upload, Check } from 'lucide-react';
import { QuizConfig, PRESET_CONFIGS } from '../config/presets';
import { sound } from '../utils/sound';

interface Step1LoginProps {
  config: QuizConfig;
  playerName: string;
  setPlayerName: (name: string) => void;
  roomCode: string;
  setRoomCode: (code: string) => void;
  includeBots: boolean;
  setIncludeBots: (val: boolean) => void;
  onSelectPreset: (presetKey: string) => void;
  onUploadCustomJson: (customConfig: QuizConfig) => void;
  onNext: () => void;
}

export const Step1Login: React.FC<Step1LoginProps> = ({
  config,
  playerName,
  setPlayerName,
  roomCode,
  setRoomCode,
  includeBots,
  setIncludeBots,
  onSelectPreset,
  onUploadCustomJson,
  onNext,
}) => {
  const [error, setError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || playerName.trim().length < 2) {
      setError('Digite seu nome ou apelido (mínimo 2 letras) para continuar!');
      sound.playWrong();
      return;
    }
    sound.playClick();
    onNext();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(String(ev.target?.result));
        if (parsed.edition && Array.isArray(parsed.questions)) {
          onUploadCustomJson(parsed as QuizConfig);
          setUploadSuccess(true);
          sound.playCorrect();
          setTimeout(() => setUploadSuccess(false), 3000);
        } else {
          alert('O JSON enviado não contém os campos obrigatórios (edition, questions).');
        }
      } catch {
        alert('Erro ao ler o arquivo JSON. Verifique a formatação.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="w-full max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
    >
      {/* Card da Capa do Livro do Mês */}
      <div className="lg:col-span-5 flex flex-col items-center">
        <div className="relative w-full max-w-[300px] sm:max-w-[330px] rounded-3xl overflow-hidden shadow-2xl border-2 border-white/15 bg-zinc-900/90 group">
          <div className="aspect-[4/5] w-full relative overflow-hidden bg-zinc-950">
            <img
              src={config.theme.bannerImage}
              alt={config.edition}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
              <span
                className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-1.5"
                style={{
                  backgroundColor: config.theme.primaryColor,
                  color: '#09090b',
                }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Edição Oficial
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-black/70 text-white/90 backdrop-blur-md border border-white/15">
                {config.rules.totalQuestions} Perguntas
              </span>
            </div>

            <div className="absolute bottom-4 left-4 right-4 text-left">
              {config.bookAuthor && (
                <p className="text-xs uppercase tracking-widest text-white/75 font-semibold mb-1">
                  {config.bookAuthor}
                </p>
              )}
              <h2
                className="text-xl sm:text-2xl font-extrabold text-white leading-tight drop-shadow"
                style={{ fontFamily: config.theme.headingFont || config.theme.fontFamily }}
              >
                {config.edition}
              </h2>
              {config.bookSubtitle && (
                <p className="text-xs text-white/80 mt-1.5 line-clamp-2">
                  {config.bookSubtitle}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Seletor de Edição só aparece caso exista mais de um livro em presets */}
        {Object.keys(PRESET_CONFIGS).length > 1 && (
          <div className="mt-4 w-full max-w-[330px] bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-white/60 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                Trocar Livro / Edição (JSON)
              </span>
              <label className="cursor-pointer text-xs font-medium text-amber-400 hover:underline flex items-center gap-1">
                <Upload className="w-3 h-3" />
                {uploadSuccess ? 'Importado!' : 'Importar .json'}
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {Object.entries(PRESET_CONFIGS).map(([key, item]) => {
                const active = config.edition === item.edition;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      onSelectPreset(key);
                    }}
                    className={`px-2.5 py-2 rounded-xl text-xs font-semibold text-left truncate transition-all flex items-center justify-between ${
                      active
                        ? 'bg-white text-zinc-950 shadow-sm'
                        : 'bg-white/5 text-white/75 hover:bg-white/10'
                    }`}
                  >
                    <span className="truncate">
                      {item.edition
                        .replace('Novembro 2026 • ', '')
                        .replace('Clube do Livro • ', '')
                        .replace('Março 2026 - Livro: ', '')}
                    </span>
                    {active && <Check className="w-3.5 h-3.5 shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Formulário de Boas-Vindas & Login Simples */}
      <div className="lg:col-span-7 bg-zinc-900/80 backdrop-blur-xl border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-white/90 mb-4">
          <span>🏆 Arena Gamificada • Clube do Livro do Mês</span>
        </div>

        <h1
          className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-2"
          style={{ fontFamily: config.theme.headingFont || config.theme.fontFamily }}
        >
          Pronto(a) para testar sua leitura?
        </h1>
        <p className="text-sm sm:text-base text-white/70 mb-6">
          Responda às <strong>{config.rules.totalQuestions} perguntas</strong> antes que o cronômetro de{' '}
          <strong>{config.rules.timePerQuestionSeconds}s</strong> zere. Quanto mais rápido acertar, mais pontos você conquista no ranking!
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="player-nickname"
              className="block text-sm font-bold text-white/90 mb-2"
            >
              Seu Nome ou Apelido no Clube
            </label>
            <input
              id="player-nickname"
              type="text"
              maxLength={24}
              value={playerName}
              onChange={(e) => {
                setPlayerName(e.target.value);
                if (error) setError('');
              }}
              placeholder="Ex: Vitória, Lyra, Leitora Voraz..."
              className="w-full min-h-[52px] px-4 py-3 rounded-2xl bg-black/50 border-2 border-white/20 text-white placeholder-white/40 text-base sm:text-lg font-semibold focus:outline-none focus:border-amber-400 transition-colors"
              autoFocus
            />
            {error && (
              <p className="mt-1.5 text-xs font-semibold text-rose-400">{error}</p>
            )}
          </div>

          {/* Sala Multiplayer / Ao Vivo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="bg-black/35 border border-white/10 rounded-2xl p-3.5">
              <label
                htmlFor="room-code"
                className="block text-xs font-semibold uppercase tracking-wider text-white/60 mb-1"
              >
                Código da Sala (Ao Vivo)
              </label>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-white/50 shrink-0" />
                <input
                  id="room-code"
                  type="text"
                  maxLength={14}
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  className="w-full bg-transparent text-sm font-bold uppercase tracking-wider text-white focus:outline-none"
                  placeholder="CLUBE2026"
                />
              </div>
            </div>

            <div className="bg-black/35 border border-white/10 rounded-2xl p-3.5 flex items-center justify-between">
              <div>
                <span className="block text-xs font-semibold uppercase tracking-wider text-white/60">
                  Competidores IA do Clube
                </span>
                <span className="text-xs text-white/80">
                  {includeBots ? 'Ativados no Placar' : 'Apenas humanos na sala'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setIncludeBots(!includeBots);
                }}
                className={`w-12 h-7 flex items-center rounded-full p-1 transition-colors ${
                  includeBots ? 'bg-emerald-500' : 'bg-zinc-700'
                }`}
                aria-label="Alternar competidores simulados"
              >
                <div
                  className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${
                    includeBots ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full min-h-[56px] py-4 px-6 rounded-2xl font-extrabold text-base sm:text-lg text-zinc-950 shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-[0.98] hover:brightness-110"
            style={{ backgroundColor: config.theme.primaryColor }}
          >
            <span>Continuar para Criar Avatar</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </div>
    </motion.div>
  );
};
