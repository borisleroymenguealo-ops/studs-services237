import React, { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { MoreHorizontal, X } from 'lucide-react';

export interface TabItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

interface Props {
  tabs: TabItem[];
  active: string;
  onChange: (id: string) => void;
  maxBottom?: number; // nombre d'onglets visibles dans la barre du bas (le reste va dans « Plus »)
}

/**
 * Navigation unifiée :
 *  - Mobile : barre fixe en bas (icône + libellé court), pouces-friendly ; « Plus » si trop d'onglets.
 *  - Ordinateur / tablette : onglets en pastilles sous l'en-tête.
 */
export const TabBar: React.FC<Props> = ({ tabs, active, onChange, maxBottom = 5 }) => {
  const [more, setMore] = useState(false);
  const needMore = tabs.length > maxBottom;
  const shown = needMore ? tabs.slice(0, maxBottom - 1) : tabs;
  const hidden = needMore ? tabs.slice(maxBottom - 1) : [];
  const activeInHidden = hidden.some(t => t.id === active);

  const Badge = ({ n }: { n?: number }) =>
    n && n > 0 ? (
      <span className="absolute -top-1 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">{n}</span>
    ) : null;

  return (
    <>
      {/* Ordinateur / tablette */}
      <nav className="hidden md:flex flex-wrap gap-1.5 p-1.5 rounded-2xl bg-white dark:bg-[#0b1a33] border border-slate-200 dark:border-[#24406e] shadow-sm">
        {tabs.map(t => {
          const Icon = t.icon;
          const on = t.id === active;
          return (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                on ? 'brand-gradient shadow-md' : 'text-slate-600 dark:text-slate-300 hover:bg-brand-50 dark:hover:bg-[#13264a] hover:text-brand-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
              <Badge n={t.badge} />
            </button>
          );
        })}
      </nav>

      {/* Mobile : barre du bas */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 dark:bg-[#0b1a33]/95 backdrop-blur border-t border-slate-200 dark:border-[#24406e] shadow-[0_-4px_20px_rgba(11,74,148,0.10)]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="flex">
          {shown.map(t => {
            const Icon = t.icon;
            const on = t.id === active;
            return (
              <button key={t.id} onClick={() => onChange(t.id)} className="relative flex-1 flex flex-col items-center gap-0.5 pt-2 pb-1.5 cursor-pointer">
                <span className={`relative flex items-center justify-center w-12 h-7 rounded-full transition-all ${on ? 'bg-brand-100 dark:bg-[#13264a] text-brand-700 dark:text-brand-300' : 'text-slate-500 dark:text-slate-400'}`}>
                  <Icon className="w-5 h-5" strokeWidth={on ? 2.4 : 1.8} />
                  <Badge n={t.badge} />
                </span>
                <span className={`text-[11px] leading-tight ${on ? 'font-bold text-brand-700 dark:text-brand-300' : 'font-medium text-slate-500 dark:text-slate-400'}`}>{t.label}</span>
              </button>
            );
          })}
          {needMore && (
            <button onClick={() => setMore(true)} className="flex-1 flex flex-col items-center gap-0.5 pt-2 pb-1.5 cursor-pointer">
              <span className={`flex items-center justify-center w-12 h-7 rounded-full ${activeInHidden ? 'bg-brand-100 dark:bg-[#13264a] text-brand-700' : 'text-slate-500 dark:text-slate-400'}`}>
                <MoreHorizontal className="w-5 h-5" />
              </span>
              <span className={`text-[11px] leading-tight ${activeInHidden ? 'font-bold text-brand-700' : 'font-medium text-slate-500 dark:text-slate-400'}`}>Plus</span>
            </button>
          )}
        </div>
      </nav>

      {/* Feuille « Plus » */}
      {more && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/40" onClick={() => setMore(false)}>
          <div
            className="absolute bottom-0 inset-x-0 bg-white dark:bg-[#0b1a33] rounded-t-3xl p-4 space-y-2"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-1">
              <p className="font-display font-bold text-base text-slate-900 dark:text-white">Plus de sections</p>
              <button onClick={() => setMore(false)} className="p-2 text-slate-500 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {hidden.map(t => {
                const Icon = t.icon;
                const on = t.id === active;
                return (
                  <button
                    key={t.id}
                    onClick={() => { onChange(t.id); setMore(false); }}
                    className={`flex items-center gap-3 p-3 rounded-2xl text-left text-sm font-semibold cursor-pointer ${on ? 'brand-gradient' : 'bg-brand-50 dark:bg-[#13264a] text-brand-800 dark:text-slate-100'}`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
