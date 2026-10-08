/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { MiniDashboardHeader } from './MiniDashboardHeader';
import { Order } from '../types';
import {
  ShieldAlert,
  Star,
  CheckSquare,
  Clipboard,
  MessageSquare,
  AlertTriangle,
  User,
  Activity,
  ThumbsUp,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const QualityDashboard: React.FC = () => {
  const { orders } = useApp();
  const [activeTab, setActiveTab] = useState<'alerts' | 'audits'>('alerts');
  const [resolvedAlerts, setResolvedAlerts] = useState<string[]>([]);

  // Filter completed orders that have reviews
  const evaluatedOrders = orders.filter(o => o.status === 'completed' && o.rating !== undefined);
  
  // High-priority alerts: reviews with 1, 2, or 3 stars that are not in resolved list
  const qualityAlerts = evaluatedOrders.filter(
    o => o.rating !== undefined && o.rating <= 3 && !resolvedAlerts.includes(o.id)
  );

  // High quality jobs: 4 or 5 stars
  const eliteMissions = evaluatedOrders.filter(o => o.rating !== undefined && o.rating >= 4);

  const averagePlatformRating = evaluatedOrders.length > 0
    ? (evaluatedOrders.reduce((acc, o) => acc + (o.rating || 0), 0) / evaluatedOrders.length).toFixed(1)
    : '4.8';

  const markAlertAsResolved = (orderId: string) => {
    setResolvedAlerts(prev => [...prev, orderId]);
    alert(`Alerte de qualité sur la commande ${orderId} marquée comme résolue. L'étudiant et le client ont été contactés.`);
  };

  return (
    <div className="space-y-6">
      {/* Mini-tableau récapitulatif en haut du tableau de bord */}
      <MiniDashboardHeader role="supervisor" />

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans">
        {/* Rating */}
        <div className="bento-card flex items-center space-x-3.5">
          <div className="p-3 bg-yellow-100 text-slate-900 border border-slate-200/60 rounded-xl">
            <Star className="w-5 h-5 fill-slate-900" />
          </div>
          <div>
            <p className="text-[9px] text-slate-500 uppercase font-black tracking-wider">Qualité Réseau</p>
            <p className="text-base font-black text-slate-900 font-mono">{averagePlatformRating} / 5.0</p>
          </div>
        </div>

        {/* Pending Alerts */}
        <div className="bento-card flex items-center space-x-3.5 bg-rose-50/30 border-rose-900">
          <div className="p-3 bg-rose-100 text-rose-950 border-2 border-rose-900 rounded-xl">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[9px] text-rose-900 uppercase font-black tracking-wider font-sans">Alertes Insatisfaction</p>
            <p className="text-base font-black text-rose-900 font-mono">{qualityAlerts.length} en attente</p>
          </div>
        </div>

        {/* Audited orders count */}
        <div className="bento-card-emerald flex items-center space-x-3.5">
          <div className="p-3 bg-white text-slate-900 border border-slate-200/60 rounded-xl">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[9px] text-emerald-800 uppercase font-black tracking-wider">Prestations Certifiées</p>
            <p className="text-base font-black text-slate-900 font-mono">{eliteMissions.length} certifiées</p>
          </div>
        </div>
      </div>

      {/* Inspirational Quote and Supervisor Info */}
      <div className="bento-card-dark flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="space-y-2 flex-1">
          <h3 className="font-extrabold text-base flex items-center space-x-2 text-white">
            <Clipboard className="w-4 h-4 text-blue-400 animate-pulse" />
            <span>Superviseur Qualité STUD'S App</span>
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            "Le respect strict des chartes, la ponctualité exemplaire et la politesse rigoureuse sont le triptyque de notre excellence de proximité à Ebolowa."
          </p>
        </div>
        <div className="font-mono text-[9px] uppercase tracking-wider text-slate-400 border-2 border-slate-700 p-2.5 rounded-xl bg-brand-700 font-black shrink-0">
          Marie NKOLO
        </div>
      </div>

      {/* Nav Tabs */}
      <div className="flex border border-slate-200/60 bg-white p-1.5 rounded-2xl shadow-[5px_5px_0px_rgba(15,23,42,0.1)] max-w-md">
        <button
          onClick={() => setActiveTab('alerts')}
          className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${
            activeTab === 'alerts'
              ? 'bg-brand-700 text-white'
              : 'text-slate-500 hover:text-slate-950 hover:bg-slate-100/55'
          }`}
        >
          Alertes ({qualityAlerts.length})
        </button>
        <button
          onClick={() => setActiveTab('audits')}
          className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${
            activeTab === 'audits'
              ? 'bg-brand-700 text-white'
              : 'text-slate-500 hover:text-slate-950 hover:bg-slate-100/55'
          }`}
        >
          Évaluations ({evaluatedOrders.length})
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* TAB 1: ALERTS & DISPUTES */}
        {activeTab === 'alerts' && (
          <motion.div
            key="alerts"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="space-y-4"
          >
            {qualityAlerts.length === 0 ? (
              <div className="bento-card p-12 text-center max-w-lg mx-auto">
                <ThumbsUp className="w-12 h-12 text-slate-900 mx-auto mb-4 animate-bounce" />
                <h3 className="font-extrabold text-base text-slate-900 uppercase">Aucun incident de qualité</h3>
                <p className="text-slate-600 text-xs mt-2 leading-relaxed">
                  Toutes les prestations récentes ont reçu des notes parfaites de 4 et 5 étoiles de la part de nos clients à Ebolowa !
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {qualityAlerts.map(alert => (
                  <div
                    key={alert.id}
                    className="bento-card flex flex-col md:flex-row md:items-center md:justify-between gap-5 border-l-8 border-l-rose-500"
                  >
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono bg-rose-50 text-rose-800 border border-rose-300 px-2.5 py-0.5 rounded font-bold">
                          ALERTE QUALITÉ REF: {alert.id}
                        </span>
                        <span className="text-xs text-rose-700 flex items-center space-x-1 font-mono font-bold">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Note: {alert.rating} / 5</span>
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <h4 className="font-extrabold text-sm text-slate-900">{alert.serviceTitle}</h4>
                        <p className="text-xs text-slate-600">
                          👤 <strong>Client :</strong> {alert.clientName} | 🎓 <strong>Prestataire :</strong> {alert.providerName || 'Inconnu'}
                        </p>
                        <p className="text-[11px] text-rose-950 bg-rose-50/50 p-3 rounded-lg border-2 border-rose-200 italic font-medium leading-relaxed">
                          " {alert.comment} "
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 min-w-[150px]">
                      <button
                        onClick={() => markAlertAsResolved(alert.id)}
                        className="bento-button py-2 px-3 text-xs flex items-center justify-center space-x-1 bg-rose-600 hover:bg-rose-500 text-white border-rose-800"
                      >
                        <CheckSquare className="w-3.5 h-3.5" />
                        <span>Résoudre l'alerte</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* TAB 2: GENERAL AUDIT LIST */}
        {activeTab === 'audits' && (
          <motion.div
            key="audits"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="space-y-4"
          >
            {evaluatedOrders.length === 0 ? (
              <div className="bento-card p-12 text-center max-w-lg mx-auto">
                <Clipboard className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="font-extrabold text-base text-slate-900 uppercase">Aucune évaluation enregistrée</h3>
                <p className="text-slate-600 text-xs mt-2 leading-relaxed">
                  Dès que les clients notent leurs missions finalisées, l'historique complet des évaluations et retours de satisfaction s'affiche ici.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {evaluatedOrders.map(o => (
                  <div
                    key={o.id}
                    className="bento-card flex items-start justify-between gap-4"
                  >
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-[9px] font-mono bg-slate-100 text-slate-700 border border-slate-300 px-1.5 py-0.5 rounded">
                          REF: {o.id}
                        </span>
                        <div className="flex text-slate-900">
                          {Array.from({ length: o.rating || 0 }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current text-slate-900" />
                          ))}
                        </div>
                      </div>

                      <div>
                        <h5 className="font-extrabold text-xs text-slate-900">{o.serviceTitle}</h5>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          Par: {o.clientName} | Réalisé par: {o.providerName || 'Inconnu'}
                        </p>
                        <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border-l-4 border-slate-900 italic mt-2">
                          "{o.comment}"
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0 font-mono text-[10px] text-slate-400 font-bold">
                      {new Date(o.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
