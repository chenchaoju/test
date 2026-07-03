import { ShieldCheck } from 'lucide-react';

interface LogoProps {
  size?: number;
  showText?: boolean;
}

export default function Logo({ size = 32, showText = true }: LogoProps) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="relative flex items-center justify-center rounded-lg bg-gradient-to-br from-vault-accent/20 to-vault-purple/20 border border-vault-accent/30"
        style={{ width: size, height: size }}
      >
        <ShieldCheck size={size * 0.6} className="text-vault-accent" />
        <div className="absolute inset-0 rounded-lg animate-glow-pulse opacity-50" />
      </div>
      {showText && (
        <div className="flex flex-col leading-none">
          <span className="font-mono font-bold text-lg gradient-text">VAULT</span>
          <span className="font-sans text-[10px] text-vault-muted tracking-[0.2em] uppercase">CIPHER</span>
        </div>
      )}
    </div>
  );
}
