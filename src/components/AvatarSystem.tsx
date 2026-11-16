import React from 'react';

export interface AvatarConfig {
  skinColor: string;
  hairStyle: 'curto' | 'longo' | 'cacheado' | 'coque' | 'moicano';
  hairColor: string;
  expression: 'feliz' | 'confiante' | 'focado' | 'surpreso';
  accessory: 'nenhum' | 'oculos' | 'coroa_louros' | 'chapeu_mago' | 'fones';
  badge: 'livro' | 'raio' | 'coruja' | 'rosa' | 'espada' | 'lanterna' | 'cafe';
  bgColor: string;
}

export const DEFAULT_AVATAR: AvatarConfig = {
  skinColor: '#f3c6a5',
  hairStyle: 'cacheado',
  hairColor: '#3b2314',
  expression: 'focado',
  accessory: 'oculos',
  badge: 'lanterna',
  bgColor: '#ef4444',
};

export const SKIN_COLORS = [
  { name: 'Clara', value: '#fde2c8' },
  { name: 'Pêssego', value: '#f3c6a5' },
  { name: 'Morena Clara', value: '#d99b66' },
  { name: 'Morena', value: '#a86b3c' },
  { name: 'Negra', value: '#693f23' },
  { name: 'Retinta', value: '#3d2210' },
];

export const HAIR_COLORS = [
  { name: 'Castanho Escuro', value: '#271810' },
  { name: 'Castanho', value: '#5c3824' },
  { name: 'Loiro Dourado', value: '#e6b84c' },
  { name: 'Ruivo Acobreado', value: '#b84228' },
  { name: 'Platinado', value: '#e2e8f0' },
  { name: 'Roxo Místico', value: '#7e22ce' },
  { name: 'Azul Noturno', value: '#1d4ed8' },
  { name: 'Rosa', value: '#db2777' },
];

export const BG_COLORS = [
  { name: 'Ouro Olimpo', value: '#f59e0b' },
  { name: 'Verde Verenmore', value: '#10b981' },
  { name: 'Rosa Rose Hill', value: '#ec4899' },
  { name: 'Roxo Submundo', value: '#8b5cf6' },
  { name: 'Azul Poseidon', value: '#3b82f6' },
  { name: 'Vermelho Ares', value: '#ef4444' },
];

export const BADGE_EMOJIS: Record<AvatarConfig['badge'], string> = {
  lanterna: '🔦',
  cafe: '☕',
  livro: '📖',
  raio: '⚡',
  coruja: '🦉',
  rosa: '🌹',
  espada: '⚔️',
};

interface AvatarPreviewProps {
  config: AvatarConfig;
  size?: number;
  className?: string;
  showBadge?: boolean;
}

export const AvatarPreview: React.FC<AvatarPreviewProps> = ({
  config,
  size = 96,
  className = '',
  showBadge = true,
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full select-none shrink-0 shadow-lg border-2 border-white/25 overflow-visible ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: config.bgColor,
      }}
    >
      <svg
        viewBox="0 0 120 120"
        className="w-full h-full rounded-full overflow-hidden"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Brilho de fundo */}
        <circle cx="60" cy="60" r="60" fill={config.bgColor} />
        <circle cx="60" cy="45" r="45" fill="white" fillOpacity="0.12" />

        {/* Cabelo de trás (para longo e cacheado) */}
        {config.hairStyle === 'longo' && (
          <path
            d="M26 52 C22 75 24 108 32 118 L88 118 C96 108 98 75 94 52 Z"
            fill={config.hairColor}
          />
        )}
        {config.hairStyle === 'cacheado' && (
          <g fill={config.hairColor}>
            <circle cx="28" cy="58" r="14" />
            <circle cx="92" cy="58" r="14" />
            <circle cx="30" cy="76" r="13" />
            <circle cx="90" cy="76" r="13" />
          </g>
        )}
        {config.hairStyle === 'coque' && (
          <circle cx="60" cy="18" r="15" fill={config.hairColor} />
        )}

        {/* Corpo / Ombros */}
        <path
          d="M22 120 C22 96 38 88 60 88 C82 88 98 96 98 120 Z"
          fill="#18181b"
        />
        {/* Gola */}
        <path
          d="M46 89 L60 103 L74 89"
          fill="none"
          stroke="#ffffff"
          strokeWidth="3"
          strokeLinecap="round"
          strokeOpacity="0.5"
        />

        {/* Pescoço */}
        <rect x="51" y="74" width="18" height="18" rx="6" fill={config.skinColor} />

        {/* Orelhas */}
        <circle cx="31" cy="60" r="6" fill={config.skinColor} />
        <circle cx="89" cy="60" r="6" fill={config.skinColor} />

        {/* Cabeça */}
        <rect x="33" y="32" width="54" height="52" rx="26" fill={config.skinColor} />

        {/* Bochechas rosadas */}
        <ellipse cx="43" cy="63" rx="5" ry="3" fill="#f43f5e" fillOpacity="0.25" />
        <ellipse cx="77" cy="63" rx="5" ry="3" fill="#f43f5e" fillOpacity="0.25" />

        {/* Expressão Facial (Olhos e Sobrancelhas) */}
        {config.expression === 'feliz' && (
          <g>
            <circle cx="47" cy="55" r="3.8" fill="#18181b" />
            <circle cx="73" cy="55" r="3.8" fill="#18181b" />
            <circle cx="48.2" cy="53.8" r="1.2" fill="#ffffff" />
            <circle cx="74.2" cy="53.8" r="1.2" fill="#ffffff" />
            <path d="M41 47 Q47 44 53 47" stroke="#18181b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M67 47 Q73 44 79 47" stroke="#18181b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M49 67 Q60 76 71 67" stroke="#18181b" strokeWidth="3" fill="none" strokeLinecap="round" />
          </g>
        )}

        {config.expression === 'confiante' && (
          <g>
            <circle cx="47" cy="55" r="3.8" fill="#18181b" />
            <circle cx="73" cy="55" r="3.8" fill="#18181b" />
            <circle cx="48.2" cy="53.8" r="1.2" fill="#ffffff" />
            <circle cx="74.2" cy="53.8" r="1.2" fill="#ffffff" />
            <path d="M41 48 L53 46" stroke="#18181b" strokeWidth="2.6" fill="none" strokeLinecap="round" />
            <path d="M67 45 Q73 42 79 46" stroke="#18181b" strokeWidth="2.6" fill="none" strokeLinecap="round" />
            <path d="M50 69 Q62 74 72 66" stroke="#18181b" strokeWidth="3" fill="none" strokeLinecap="round" />
          </g>
        )}

        {config.expression === 'focado' && (
          <g>
            <circle cx="47" cy="56" r="3.6" fill="#18181b" />
            <circle cx="73" cy="56" r="3.6" fill="#18181b" />
            <path d="M41 46 L54 49" stroke="#18181b" strokeWidth="2.8" fill="none" strokeLinecap="round" />
            <path d="M79 46 L66 49" stroke="#18181b" strokeWidth="2.8" fill="none" strokeLinecap="round" />
            <path d="M52 70 L68 69" stroke="#18181b" strokeWidth="3" fill="none" strokeLinecap="round" />
          </g>
        )}

        {config.expression === 'surpreso' && (
          <g>
            <circle cx="47" cy="55" r="4.3" fill="#18181b" />
            <circle cx="73" cy="55" r="4.3" fill="#18181b" />
            <circle cx="48.5" cy="53.5" r="1.4" fill="#ffffff" />
            <circle cx="74.5" cy="53.5" r="1.4" fill="#ffffff" />
            <path d="M41 44 Q47 40 53 44" stroke="#18181b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M67 44 Q73 40 79 44" stroke="#18181b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <ellipse cx="60" cy="70" rx="5" ry="6" fill="#18181b" />
          </g>
        )}

        {/* Cabelo Frontal / Topo */}
        {config.hairStyle === 'curto' && (
          <path
            d="M31 50 C31 28 45 22 60 22 C75 22 89 28 89 50 C82 38 72 36 60 36 C48 36 38 38 31 50 Z"
            fill={config.hairColor}
          />
        )}
        {config.hairStyle === 'longo' && (
          <path
            d="M30 54 C30 26 44 21 60 21 C76 21 90 26 90 54 C83 37 70 35 60 35 C50 35 37 37 30 54 Z"
            fill={config.hairColor}
          />
        )}
        {config.hairStyle === 'cacheado' && (
          <g fill={config.hairColor}>
            <circle cx="42" cy="32" r="12" />
            <circle cx="60" cy="28" r="13" />
            <circle cx="78" cy="32" r="12" />
            <circle cx="33" cy="43" r="10" />
            <circle cx="87" cy="43" r="10" />
          </g>
        )}
        {config.hairStyle === 'coque' && (
          <path
            d="M32 50 C32 28 46 24 60 24 C74 24 88 28 88 50 C80 39 70 37 60 37 C50 37 40 39 32 50 Z"
            fill={config.hairColor}
          />
        )}
        {config.hairStyle === 'moicano' && (
          <path
            d="M50 40 C50 16 55 10 60 10 C65 10 70 16 70 40 Z"
            fill={config.hairColor}
          />
        )}

        {/* Acessórios */}
        {config.accessory === 'oculos' && (
          <g stroke="#fbbf24" strokeWidth="2.8" fill="#000000" fillOpacity="0.2">
            <circle cx="47" cy="55" r="9" />
            <circle cx="73" cy="55" r="9" />
            <line x1="56" y1="55" x2="64" y2="55" />
            <line x1="33" y1="53" x2="38" y2="55" />
            <line x1="82" y1="55" x2="87" y2="53" />
          </g>
        )}

        {config.accessory === 'coroa_louros' && (
          <g fill="#fbbf24" stroke="#b45309" strokeWidth="1">
            <path d="M28 42 Q35 26 54 25 Q42 34 28 42 Z" />
            <path d="M92 42 Q85 26 66 25 Q78 34 92 42 Z" />
            <circle cx="60" cy="25" r="3.5" fill="#f59e0b" />
          </g>
        )}

        {config.accessory === 'chapeu_mago' && (
          <g>
            <path d="M20 36 Q60 44 100 36 L82 30 L60 4 L38 30 Z" fill="#311042" stroke="#a855f7" strokeWidth="2" />
            <path d="M37 29 Q60 34 83 29" stroke="#f59e0b" strokeWidth="3.5" fill="none" />
          </g>
        )}

        {config.accessory === 'fones' && (
          <g>
            <path d="M28 58 C26 25 94 25 92 58" fill="none" stroke="#e11d48" strokeWidth="5" strokeLinecap="round" />
            <rect x="22" y="48" width="9" height="18" rx="4" fill="#be123c" />
            <rect x="89" y="48" width="9" height="18" rx="4" fill="#be123c" />
          </g>
        )}
      </svg>

      {showBadge && (
        <span
          className="absolute -bottom-1 -right-1 flex items-center justify-center rounded-full bg-zinc-900 border border-white/30 shadow-md"
          style={{
            width: Math.max(24, size * 0.32),
            height: Math.max(24, size * 0.32),
            fontSize: Math.max(12, size * 0.18),
          }}
          title="Insígnia do Leitor"
        >
          {BADGE_EMOJIS[config.badge]}
        </span>
      )}
    </div>
  );
};
