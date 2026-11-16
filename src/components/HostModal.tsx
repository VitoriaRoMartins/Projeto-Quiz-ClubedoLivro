import React, { useState } from 'react';
import { X, Users, Trash2, Download, Database, Check } from 'lucide-react';
import { QuizConfig } from '../config/presets';
import { PlayerRecord, quizStore } from '../utils/realtimeStore';
import { AvatarPreview } from './AvatarSystem';

interface HostModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: QuizConfig;
  players: PlayerRecord[];
  roomCode: string;
}

export const HostModal: React.FC<HostModalProps> = ({
  isOpen,
  onClose,
  config,
  players,
  roomCode,
}) => {
  const [supaUrl, setSupaUrl] = useState(
    localStorage.getItem('quiz_supabase_url') || ''
  );
  const [supaKey, setSupaKey] = useState(
    localStorage.getItem('quiz_supabase_key') || ''
  );
  const [savedSupa, setSavedSupa] = useState(false);

  if (!isOpen) return null;

  const handleSaveSupabase = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('quiz_supabase_url', supaUrl.trim());
    localStorage.setItem('quiz_supabase_key', supaKey.trim());
    setSavedSupa(true);
    setTimeout(() => {
      setSavedSupa(false);
      window.location.reload();
    }, 1000);
  };

  const handleDownloadJsonTemplate = () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quiz-config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-zinc-900 border border-white/15 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-7 shadow-2xl text-white">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h2 className="text-xl font-extrabold flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" />
              Painel do Apresentador / Sala Ao Vivo
            </h2>
            <p className="text-xs text-white/60 mt-0.5">
              Sala ativa: <strong>{roomCode}</strong> • {players.length} participantes listados
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 mt-5">
          {/* Ações Rápidas da Sala */}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                if (confirm('Deseja zerar todas as pontuações desta sala?')) {
                  quizStore.resetRoom();
                }
              }}
              className="px-4 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Zerar Placar da Sala ({roomCode})
            </button>

            <button
              type="button"
              onClick={handleDownloadJsonTemplate}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-bold flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Baixar quiz-config.json Atual
            </button>
          </div>

          {/* Lista em Tempo Real dos Participantes */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/60 mb-2.5">
              Ranking Ao Vivo da Sala ({players.length})
            </h3>
            <div className="bg-black/40 border border-white/10 rounded-2xl divide-y divide-white/10 max-h-56 overflow-y-auto">
              {players.map((p) => (
                <div
                  key={p.id}
                  className="p-3 flex items-center justify-between text-xs sm:text-sm"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-white/60 w-6">{p.currentRank}º</span>
                    <AvatarPreview config={p.avatar} size={30} showBadge={false} />
                    <span className="font-semibold text-white">{p.name}</span>
                    {p.isBot && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/60">
                        Bot
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-amber-400">
                    {p.score} pts ({p.correctCount} acertos)
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Configuração Opcional Supabase Realtime */}
          <form
            onSubmit={handleSaveSupabase}
            className="bg-black/40 border border-white/10 rounded-2xl p-4 space-y-3"
          >
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
              <Database className="w-4 h-4" />
              Sincronização Nuvem Multi-Dispositivos (Opcional - Supabase Realtime)
            </div>
            <p className="text-xs text-white/65 leading-relaxed">
              No mesmo navegador ou computador, abas diferentes já sincronizam automaticamente via{' '}
              <code>BroadcastChannel</code>. Para sincronizar celulares diferentes via internet sem servidor próprio, cole a URL e Anon Key de um projeto gratuito do Supabase:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <input
                type="text"
                value={supaUrl}
                onChange={(e) => setSupaUrl(e.target.value)}
                placeholder="https://xyz.supabase.co"
                className="px-3 py-2 rounded-xl bg-zinc-900 border border-white/15 text-xs text-white"
              />
              <input
                type="password"
                value={supaKey}
                onChange={(e) => setSupaKey(e.target.value)}
                placeholder="Supabase Anon Public Key"
                className="px-3 py-2 rounded-xl bg-zinc-900 border border-white/15 text-xs text-white"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-amber-500 text-zinc-950 font-bold text-xs flex items-center gap-1.5"
            >
              {savedSupa ? (
                <>
                  <Check className="w-4 h-4" /> Salvo! Recarregando...
                </>
              ) : (
                'Salvar Credenciais Realtime'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
