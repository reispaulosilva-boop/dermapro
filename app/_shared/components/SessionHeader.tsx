'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Settings, Tv, User, LogOut, Info, Lock, Shield, Maximize2, Minimize2,
} from 'lucide-react';
import Link from 'next/link';
import { usePresentationMode } from './PresentationModeProvider';

// ─── STORAGE KEYS ─────────────────────────────────────────────────────────────

const KEY_DOCTOR = 'dermapro-doctor-name';
const KEY_SESSION = 'dermapro-current-session';
const KEY_TV = 'dermapro-tv-mode';

// ─── TYPES ────────────────────────────────────────────────────────────────────

type PatientSession = {
  identification: string;
  age: string;
  fototipo: string;
  consultaNumber: string;
};

const FOTOTIPOS = [
  { value: 'I', label: 'I — Muito claro (sempre queima, nunca bronzeia)' },
  { value: 'II', label: 'II — Claro (sempre queima, às vezes bronzeia)' },
  { value: 'III', label: 'III — Médio-claro (às vezes queima, sempre bronzeia)' },
  { value: 'IV', label: 'IV — Médio (raramente queima, sempre bronzeia)' },
  { value: 'V', label: 'V — Médio-escuro (muito raramente queima)' },
  { value: 'VI', label: 'VI — Escuro (nunca queima)' },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const MONTHS_PT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function formatConsultaLabel(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = MONTHS_PT[date.getMonth()] ?? '';
  const year = date.getFullYear();
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `Consulta · ${day} ${month} ${year} · ${h}:${m}`;
}

function getGreeting(hour: number): string {
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

function sessionSummary(s: PatientSession): string {
  const parts: string[] = [];
  if (s.identification) parts.push(s.identification);
  if (s.age) parts.push(`${s.age} anos`);
  if (s.fototipo) parts.push(`Fototipo ${s.fototipo}`);
  if (s.consultaNumber) {
    const n = parseInt(s.consultaNumber);
    const ordinals = ['1ª', '2ª', '3ª', '4ª', '5ª', '6ª', '7ª', '8ª', '9ª', '10ª'];
    const ord = (n >= 1 && n <= 10) ? (ordinals[n - 1] ?? `${n}ª`) : `${n}ª`;
    parts.push(`${ord} consulta`);
  }
  return parts.join(' · ');
}

// ─── DOCTOR PROFILE MODAL ────────────────────────────────────────────────────

function DoctorProfileModal({
  open,
  initial,
  onSave,
  onClose,
}: {
  open: boolean;
  initial: string;
  onSave: (name: string) => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState(initial);
  useEffect(() => { if (open) setValue(initial); }, [open, initial]);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm bg-[var(--bg-surface)] border-[var(--border-subtle)]">
        <DialogHeader>
          <DialogTitle className="text-[20px] font-medium text-[var(--text-strong)] tracking-tight">
            Como devemos te chamar?
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-[var(--text-muted)] -mt-1">
          Opcional. Salvo apenas neste dispositivo.
        </p>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Ex: Dra. Helena, Dr. Paulo..."
          autoFocus
          className="w-full rounded-[var(--r-md)] border border-[var(--border-subtle)] bg-[var(--ink-1)] text-[var(--text-body)] px-3 py-2 text-sm outline-none focus:border-[var(--brand-primary-400)] transition-colors"
          onKeyDown={(e) => { if (e.key === 'Enter') onSave(value.trim()); }}
        />
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="ghost" size="sm" onClick={onClose}
            className="text-[var(--text-muted)] hover:bg-[var(--ink-3)]">
            Pular
          </Button>
          <Button size="sm" onClick={() => onSave(value.trim())}
            className="bg-[var(--brand-primary-700)] hover:bg-[var(--brand-primary-800)] text-[var(--text-strong)]">
            Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── PATIENT SESSION MODAL ────────────────────────────────────────────────────

function PatientSessionModal({
  open,
  initial,
  onSave,
  onClose,
}: {
  open: boolean;
  initial: PatientSession | null;
  onSave: (s: PatientSession) => void;
  onClose: () => void;
}) {
  const empty: PatientSession = { identification: '', age: '', fototipo: '', consultaNumber: '' };
  const [form, setForm] = useState<PatientSession>(initial ?? empty);

  useEffect(() => {
    if (open) setForm(initial ?? empty);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const set = (k: keyof PatientSession) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const inputStyle: React.CSSProperties = {
    width: '100%',
    borderRadius: 'var(--r-md)',
    border: '1px solid var(--border-subtle)',
    background: 'var(--ink-1)',
    color: 'var(--text-body)',
    padding: '8px 12px',
    fontSize: 14,
    outline: 'none',
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-md bg-[var(--bg-surface)] border-[var(--border-subtle)]">
        <DialogHeader>
          <DialogTitle className="text-[20px] font-medium text-[var(--text-strong)] tracking-tight">
            Dados da sessão
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-[var(--text-muted)] -mt-1">
          Todos os campos são opcionais. Os dados ficam apenas nesta aba do navegador.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 4 }}>
          <Field label="Identificação do paciente">
            <input
              type="text"
              style={inputStyle}
              value={form.identification}
              onChange={set('identification')}
              placeholder="Nome, pseudônimo ou código (opcional)"
            />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Idade">
              <input
                type="number"
                style={inputStyle}
                value={form.age}
                onChange={set('age')}
                placeholder="Ex: 34"
                min={1}
                max={120}
              />
            </Field>
            <Field label="Nº da consulta">
              <input
                type="number"
                style={inputStyle}
                value={form.consultaNumber}
                onChange={set('consultaNumber')}
                placeholder="Ex: 2"
                min={1}
              />
            </Field>
          </div>

          <Field label="Fototipo Fitzpatrick">
            <select
              style={{ ...inputStyle, cursor: 'pointer' }}
              value={form.fototipo}
              onChange={set('fototipo')}
            >
              <option value="">Selecione...</option>
              {FOTOTIPOS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </Field>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" size="sm" onClick={onClose}
            className="text-[var(--text-muted)] hover:bg-[var(--ink-3)]">
            Cancelar
          </Button>
          <Button size="sm" onClick={() => onSave(form)}
            className="bg-[var(--brand-primary-700)] hover:bg-[var(--brand-primary-800)] text-[var(--text-strong)]">
            Confirmar sessão
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

// ─── SESSION HEADER ───────────────────────────────────────────────────────────

export function SessionHeader() {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(new Date());
  const [doctorName, setDoctorName] = useState('');
  const [session, setSession] = useState<PatientSession | null>(null);
  const [tvMode, setTvMode] = useState(false);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const { presentationMode, togglePresentationMode } = usePresentationMode();

  // Hydrate from storage
  useEffect(() => {
    const name = localStorage.getItem(KEY_DOCTOR) ?? '';
    setDoctorName(name);

    const rawSession = sessionStorage.getItem(KEY_SESSION);
    if (rawSession) {
      try { setSession(JSON.parse(rawSession) as PatientSession); } catch { /* ignore */ }
    }

    const rawTv = sessionStorage.getItem(KEY_TV);
    if (rawTv === 'true') {
      setTvMode(true);
    } else {
      // Auto-detect extended display
      const extended = (screen as Screen & { isExtended?: boolean }).isExtended ?? false;
      if (extended) setTvMode(true);
    }

    setMounted(true);
  }, []);

  // Live clock (60s interval)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    timerRef.current = setInterval(() => setNow(new Date()), 60_000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const saveDoctorName = useCallback((name: string) => {
    setDoctorName(name);
    if (name) {
      localStorage.setItem(KEY_DOCTOR, name);
    } else {
      localStorage.removeItem(KEY_DOCTOR);
    }
    setShowDoctorModal(false);
  }, []);

  const saveSession = useCallback((s: PatientSession) => {
    setSession(s);
    sessionStorage.setItem(KEY_SESSION, JSON.stringify(s));
    setShowSessionModal(false);
  }, []);

  const clearSession = useCallback(() => {
    setSession(null);
    sessionStorage.removeItem(KEY_SESSION);
  }, []);

  const toggleTvMode = useCallback(() => {
    setTvMode((prev) => {
      const next = !prev;
      sessionStorage.setItem(KEY_TV, String(next));
      return next;
    });
  }, []);

  // Don't render dynamic content until mounted (avoids hydration mismatch)
  const greeting = mounted ? getGreeting(now.getHours()) : 'Bem-vindo';
  const dateLabel = mounted ? formatConsultaLabel(now) : '';
  const hasDoctor = Boolean(doctorName);

  return (
    <>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 40,
      }}>
        {/* ── Left: greeting + patient info ── */}
        <div>
          {mounted && (
            <div style={{
              fontSize: 13,
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-faint)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: 12,
            }}>
              {dateLabel}
            </div>
          )}

          <h1 style={{
            fontSize: 'clamp(28px, 4vw, 44px)',
            fontWeight: 500,
            color: 'var(--text-strong)',
            margin: 0,
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
          }}>
            {greeting}{hasDoctor ? `, ${doctorName}.` : '.'}
          </h1>

          {/* Patient info row */}
          <div style={{ marginTop: 12 }}>
            {session ? (
              <p style={{
                fontSize: 18,
                color: 'var(--text-muted)',
                margin: 0,
                lineHeight: 1.4,
              }}>
                Paciente{' '}
                {session.identification && (
                  <span style={{ color: 'var(--text-body)', fontWeight: 500 }}>
                    {session.identification}
                  </span>
                )}
                {sessionSummary({ ...session, identification: '' }).replace(/^·\s*/, '') && (
                  <span>
                    {session.identification ? ' · ' : ''}
                    {sessionSummary({ ...session, identification: '' }).replace(/^·\s*/, '')}
                  </span>
                )}
              </p>
            ) : (
              <button
                onClick={() => setShowSessionModal(true)}
                style={{
                  background: 'transparent',
                  border: '1px dashed var(--ink-5)',
                  borderRadius: 'var(--r-md)',
                  padding: '7px 14px',
                  fontSize: 14,
                  color: 'var(--text-faint)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  transition: 'border-color var(--dur-1) var(--ease), color var(--dur-1) var(--ease)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--brand-primary-400)';
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--ink-5)';
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-faint)';
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                Iniciar sessão com paciente
              </button>
            )}
          </div>
        </div>

        {/* ── Right: badges + controls ── */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
          {/* Apple TV badge */}
          {tvMode && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '5px 10px', borderRadius: 'var(--r-full)',
              fontSize: 12, fontWeight: 500,
              background: 'var(--sem-success-bg)',
              color: '#b0c99a',
              border: '1px solid color-mix(in oklab, #b0c99a 30%, transparent)',
            }}>
              <Tv size={12} aria-hidden="true" />
              Apple TV conectada
            </span>
          )}

          {/* "Configurar perfil" on first visit */}
          {mounted && !hasDoctor && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDoctorModal(true)}
              className="text-[var(--text-muted)] hover:bg-[var(--ink-3)] gap-1.5"
            >
              <User size={14} aria-hidden="true" />
              Configurar perfil
            </Button>
          )}

          {/* Ajustes dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-[var(--text-muted)] hover:bg-[var(--ink-3)] gap-1.5"
                aria-label="Ajustes"
              >
                <Settings size={15} aria-hidden="true" />
                Ajustes
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-body)] min-w-[200px]"
            >
              <DropdownMenuItem onSelect={() => setShowDoctorModal(true)} className="gap-2 cursor-pointer">
                <User size={14} aria-hidden="true" />
                Editar perfil
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setShowSessionModal(true)} className="gap-2 cursor-pointer">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                </svg>
                {session ? 'Editar sessão atual' : 'Iniciar sessão com paciente'}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[var(--border-subtle)]" />
              <DropdownMenuItem onSelect={toggleTvMode} className="gap-2 cursor-pointer">
                <Tv size={14} aria-hidden="true" />
                {tvMode ? 'Desconectar Apple TV' : 'Apple TV conectada'}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={togglePresentationMode} className="gap-2 cursor-pointer">
                {presentationMode ? <Minimize2 size={14} aria-hidden="true" /> : <Maximize2 size={14} aria-hidden="true" />}
                {presentationMode ? 'Sair da apresentação' : 'Modo apresentação (P)'}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[var(--border-subtle)]" />
              {session && (
                <DropdownMenuItem
                  onSelect={clearSession}
                  className="gap-2 cursor-pointer text-[var(--sem-alert)] focus:text-[var(--sem-alert)]"
                >
                  <LogOut size={14} aria-hidden="true" />
                  Encerrar sessão
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator className="bg-[var(--border-subtle)]" />
              <DropdownMenuItem asChild className="gap-2 cursor-pointer">
                <Link href="/sobre"><Info size={14} aria-hidden="true" />Sobre</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="gap-2 cursor-pointer">
                <Link href="/privacidade"><Shield size={14} aria-hidden="true" />Privacidade</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="gap-2 cursor-pointer">
                <Link href="/termos"><Lock size={14} aria-hidden="true" />Termos</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Modals */}
      <DoctorProfileModal
        open={showDoctorModal}
        initial={doctorName}
        onSave={saveDoctorName}
        onClose={() => setShowDoctorModal(false)}
      />
      <PatientSessionModal
        open={showSessionModal}
        initial={session}
        onSave={saveSession}
        onClose={() => setShowSessionModal(false)}
      />
    </>
  );
}
