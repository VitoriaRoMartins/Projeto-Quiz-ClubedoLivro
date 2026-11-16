import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Settings, BookOpen, Wifi } from 'lucide-react';
import { PRESET_CONFIGS, QuizConfig } from './config/presets';
import { AvatarConfig, DEFAULT_AVATAR, AvatarPreview } from './components/AvatarSystem';
import { Step1Login } from './components/Step1Login';
import { Step2Avatar } from './components/Step2Avatar';
import { Step3Question } from './components/Step3Question';
import { Step4Leaderboard } from './components/Step4Leaderboard';
import { Step5Podium } from './components/Step5Podium';
import { HostModal } from './components/HostModal';
import { quizStore, PlayerRecord } from './utils/realtimeStore';
import { sound } from './utils/sound';

type GameStep = 'LOGIN' | 'AVATAR' | 'QUESTION' | 'LEADERBOARD' | 'PODIUM';

export function App() {
  const [config, setConfig] = useState<QuizConfig>(PRESET_CONFIGS['voce-nao-deveria-estar-aqui']);
  const [step, setStep] = useState<GameStep>('LOGIN');

  const [playerId] = useState<string>(() => {
    const saved = sessionStorage.getItem('clube_player_id');
    if (saved) return saved;
    const newId = 'player-' + Math.random().toString(36).substring(2, 9);
    sessionStorage.setItem('clube_player_id', newId);
    return newId;
  });

  const [playerName, setPlayerName] = useState<string>('');
  const [avatar, setAvatar] = useState<AvatarConfig>(DEFAULT_AVATAR);
  const [roomCode, setRoomCode] = useState<string>('CLUBE2026');
  const [includeBots, setIncludeBots] = useState<boolean>(true);

  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [totalCorrectTime, setTotalCorrectTime] = useState<number>(0);
  const [lastResult, setLastResult] = useState<{
    isCorrect: boolean;
    pointsEarned: number;
    elapsedSeconds: number;
  } | null>(null);

  const [players, setPlayers] = useState<PlayerRecord[]>(() => quizStore.getPlayers());
  const [isMuted, setIsMuted] = useState<boolean>(sound.isMuted);
  const [isHostModalOpen, setIsHostModalOpen] = useState<boolean>(false);

  // Aplica o Theming Dinâmico nas variáveis CSS toda vez que o quiz-config.json muda
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', config.theme.primaryColor);
    root.style.setProperty('--color-secondary', config.theme.secondaryColor);
    root.style.setProperty('--color-bg', config.theme.backgroundColor);
    root.style.setProperty('--color-text', config.theme.textColor);
    root.style.setProperty('--font-family', config.theme.fontFamily);
    document.title = `Quiz • ${config.edition}`;
  }, [config]);

  // Sincroniza a sala e escuta atualizações em tempo real
  useEffect(() => {
    quizStore.includeBots = includeBots;
    quizStore.setRoomCode(roomCode);
    setPlayers(quizStore.getPlayers());

    const unsubscribe = quizStore.subscribe(() => {
      setPlayers(quizStore.getPlayers());
    });
    return unsubscribe;
  }, [roomCode, includeBots]);

  const handleSelectPreset = (presetKey: string) => {
    const selected = PRESET_CONFIGS[presetKey];
    if (selected) {
      setConfig(selected);
      setAvatar((prev) => ({
        ...prev,
        bgColor: selected.theme.primaryColor,
      }));
    }
  };

  const handleStartQuiz = () => {
    setQuestionIndex(0);
    setScore(0);
    setCorrectCount(0);
    setTotalCorrectTime(0);
    setLastResult(null);

    const initialPlayer: PlayerRecord = {
      id: playerId,
      name: playerName.trim(),
      avatar,
      score: 0,
      lastRoundPoints: 0,
      correctCount: 0,
      totalCorrectTimeSeconds: 0,
      totalAnswered: 0,
      previousRank: 1,
      currentRank: 1,
    };

    quizStore.upsertPlayer(initialPlayer);
    setStep('QUESTION');
  };

  const handleAnswerCompleted = (result: {
    isCorrect: boolean;
    pointsEarned: number;
    elapsedSeconds: number;
  }) => {
    const newScore = score + result.pointsEarned;
    const newCorrectCount = correctCount + (result.isCorrect ? 1 : 0);
    const newTotalTime = Number(
      (totalCorrectTime + (result.isCorrect ? result.elapsedSeconds : 0)).toFixed(2)
    );

    setScore(newScore);
    setCorrectCount(newCorrectCount);
    setTotalCorrectTime(newTotalTime);
    setLastResult(result);

    // Simula respostas dos bots da sala nesta pergunta (se ativados)
    quizStore.simulateBotsForRound(questionIndex, config.rules.timePerQuestionSeconds);

    // Salva e transmite em tempo real a pontuação do jogador
    const currentList = quizStore.getPlayers();
    const existingMe = currentList.find((p) => p.id === playerId);

    quizStore.upsertPlayer({
      id: playerId,
      name: playerName.trim(),
      avatar,
      score: newScore,
      lastRoundPoints: result.pointsEarned,
      correctCount: newCorrectCount,
      totalCorrectTimeSeconds: newTotalTime,
      totalAnswered: questionIndex + 1,
      previousRank: existingMe?.currentRank || 1,
      currentRank: existingMe?.currentRank || 1,
    });

    setPlayers(quizStore.getPlayers());
    setStep('LEADERBOARD');
  };

  const handleNextQuestion = () => {
    const totalQuestions = Math.min(
      config.rules.totalQuestions,
      config.questions.length
    );
    if (questionIndex + 1 < totalQuestions) {
      setQuestionIndex((prev) => prev + 1);
      setStep('QUESTION');
    } else {
      setStep('PODIUM');
    }
  };

  const handleRestart = () => {
    setQuestionIndex(0);
    setScore(0);
    setCorrectCount(0);
    setTotalCorrectTime(0);
    setLastResult(null);
    setStep('LOGIN');
  };

  const totalQuestions = Math.min(
    config.rules.totalQuestions || 10,
    config.questions.length
  );

  return (
    <div
      className="min-h-screen w-full flex flex-col justify-between relative overflow-x-hidden transition-colors duration-500"
      style={{
        backgroundColor: config.theme.backgroundColor,
        color: config.theme.textColor,
        fontFamily: config.theme.fontFamily,
      }}
    >
      {/* Luzes de Ambientação Dinâmicas conforme a cor do livro */}
      <div
        className="pointer-events-none fixed -top-40 -left-40 w-96 h-96 rounded-full blur-[130px] opacity-25 transition-colors duration-700"
        style={{ backgroundColor: config.theme.primaryColor }}
      />
      <div
        className="pointer-events-none fixed -bottom-40 -right-40 w-96 h-96 rounded-full blur-[130px] opacity-25 transition-colors duration-700"
        style={{ backgroundColor: config.theme.secondaryColor }}
      />

      {/* Header Superior Responsivo */}
      <header className="relative z-20 w-full max-w-5xl mx-auto px-4 pt-4 pb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-zinc-950 font-black shadow-md shrink-0"
            style={{ backgroundColor: config.theme.primaryColor }}
          >
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] uppercase tracking-widest text-white/60 font-bold block truncate">
              Quiz Oficial • Sala {roomCode}
            </span>
            <h1 className="text-sm sm:text-base font-extrabold text-white truncate">
              {config.edition}
            </h1>
          </div>
        </div>

        {/* Controles Superiores: Perfil, Sala Ao Vivo e Som */}
        <div className="flex items-center gap-2 shrink-0">
          {step !== 'LOGIN' && playerName && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/5 border border-white/10 mr-1">
              <AvatarPreview config={avatar} size={28} showBadge={false} />
              <span className="text-xs font-bold text-white max-w-[110px] truncate">
                {playerName}
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsHostModalOpen(true)}
            className="min-h-[42px] px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold text-white flex items-center gap-1.5 transition-all"
            title="Painel do Apresentador e Sala Ao Vivo"
          >
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Sala Ao Vivo</span>
            <Settings className="w-3.5 h-3.5 sm:hidden" />
          </button>

          <button
            type="button"
            onClick={() => {
              const muted = sound.toggleMute();
              setIsMuted(muted);
            }}
            className="min-w-[42px] min-h-[42px] p-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white flex items-center justify-center transition-all"
            aria-label={isMuted ? 'Ativar som' : 'Silenciar som'}
            title={isMuted ? 'Ativar efeitos sonoros' : 'Silenciar efeitos sonoros'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-amber-400" />
            )}
          </button>
        </div>
      </header>

      {/* Conteúdo Principal das 5 Etapas */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-6 w-full max-w-5xl mx-auto">
        {step === 'LOGIN' && (
          <Step1Login
            config={config}
            playerName={playerName}
            setPlayerName={setPlayerName}
            roomCode={roomCode}
            setRoomCode={setRoomCode}
            includeBots={includeBots}
            setIncludeBots={setIncludeBots}
            onSelectPreset={handleSelectPreset}
            onUploadCustomJson={(customCfg) => setConfig(customCfg)}
            onNext={() => setStep('AVATAR')}
          />
        )}

        {step === 'AVATAR' && (
          <Step2Avatar
            config={config}
            playerName={playerName}
            avatar={avatar}
            setAvatar={setAvatar}
            onBack={() => setStep('LOGIN')}
            onStartQuiz={handleStartQuiz}
          />
        )}

        {step === 'QUESTION' && config.questions[questionIndex] && (
          <Step3Question
            config={config}
            question={config.questions[questionIndex]}
            questionIndex={questionIndex}
            totalQuestions={totalQuestions}
            currentScore={score}
            onAnswerCompleted={handleAnswerCompleted}
          />
        )}

        {step === 'LEADERBOARD' && (
          <Step4Leaderboard
            config={config}
            players={players}
            currentPlayerId={playerId}
            questionIndex={questionIndex}
            totalQuestions={totalQuestions}
            lastResult={lastResult}
            onNextQuestion={handleNextQuestion}
          />
        )}

        {step === 'PODIUM' && (
          <Step5Podium
            config={config}
            players={players}
            currentPlayerId={playerId}
            totalQuestions={totalQuestions}
            onRestart={handleRestart}
          />
        )}
      </main>

      {/* Rodapé */}
      <footer className="relative z-10 text-center py-3 px-4 text-xs text-white/45">
        Clube do Livro do Mês • Sistema Gamificado 100% Modular via{' '}
        <code className="text-white/70">quiz-config.json</code>
      </footer>

      {/* Modal do Apresentador / Configuração Multiplayer */}
      <HostModal
        isOpen={isHostModalOpen}
        onClose={() => setIsHostModalOpen(false)}
        config={config}
        players={players}
        roomCode={roomCode}
      />
    </div>
  );
}

export default App;
