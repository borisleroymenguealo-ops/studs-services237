import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../AppContext';
import { ChatMessage, User } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  MessageSquare, 
  Users, 
  Hash, 
  Shield, 
  Eye, 
  User as UserIcon, 
  Search, 
  CheckCircle,
  AlertCircle,
  Volume2
} from 'lucide-react';

export function ChatComponent() {
  const { currentUser, users, chatMessages, sendChatMessage } = useApp();
  const [activeChannel, setActiveChannel] = useState<string>('general');
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageCountRef = useRef(0);

  // Play a subtle sound on new message if enabled
  useEffect(() => {
    if (chatMessages.length > messageCountRef.current) {
      const isNewMsgFromOthers = chatMessages[chatMessages.length - 1]?.senderId !== currentUser?.id;
      if (isNewMsgFromOthers && soundEnabled) {
        try {
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2357/2357-84.wav');
          audio.volume = 0.2;
          audio.play();
        } catch (e) {
          // Ignore audio errors
        }
      }
    }
    messageCountRef.current = chatMessages.length;
    // Auto-scroll on new messages
    scrollToBottom();
  }, [chatMessages, activeChannel, currentUser]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Trigger scroll on first load
  useEffect(() => {
    scrollToBottom();
  }, []);

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-2xl border border-slate-200/60 shadow-lg shadow-slate-100">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-2" />
        <p className="font-extrabold text-slate-800">Veuillez vous connecter pour accéder au chat.</p>
      </div>
    );
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    setSending(true);
    setError(null);
    try {
      const result = await sendChatMessage(messageText.trim(), activeChannel);
      if (result.success) {
        setMessageText('');
        scrollToBottom();
      } else {
        setError(result.error || "Impossible d'envoyer le message.");
      }
    } catch (err: any) {
      setError(err.message || "Erreur d'envoi.");
    } finally {
      setSending(false);
    }
  };

  // Filter messages for current channel
  const filteredMessages = chatMessages.filter(msg => {
    if (activeChannel === 'general') {
      return msg.channelId === 'general';
    }
    // Direct messages: 'direct_usr-xxx'
    // Providers can only see general or their own direct messages
    // Admin and Supervisor can see all general and all direct channels
    if (currentUser.role === 'admin' || currentUser.role === 'supervisor') {
      return msg.channelId === activeChannel;
    } else {
      // Current user is a provider. They can only see direct chat with themselves.
      const allowedDirectChannel = `direct_${currentUser.id}`;
      return msg.channelId === allowedDirectChannel && msg.channelId === activeChannel;
    }
  });

  // Get users for DM listing
  // If admin/supervisor: can chat with any provider or each other
  // If provider: can only see the support thread with admin/supervisor team
  const providers = users.filter(u => u.role === 'provider');
  const teamMembers = users.filter(u => u.role === 'admin' || u.role === 'supervisor');

  const filteredProviders = providers.filter(u => 
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return (
          <span className="px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider rounded bg-red-100 text-red-800 border border-red-200">
            Admin Général
          </span>
        );
      case 'supervisor':
        return (
          <span className="px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider rounded bg-indigo-100 text-indigo-800 border border-indigo-200">
            Assistant Admin
          </span>
        );
      case 'provider':
        return (
          <span className="px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
            Prestataire
          </span>
        );
      default:
        return (
          <span className="px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider rounded bg-slate-100 text-slate-600">
            Client
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-[6px_6px_0px_rgba(15,23,42,1)] flex flex-col md:flex-row h-[620px] max-w-full">
      
      {/* Sidebar for navigation */}
      <div className="w-full md:w-80 bg-slate-50 border-b md:border-b-0 md:border-r-4 border-slate-900 flex flex-col h-1/3 md:h-full">
        {/* Header/Title */}
        <div className="p-4 border-b-2 border-slate-900 bg-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-brand-700 text-white rounded-xl border border-slate-200/50 shadow-[2px_2px_0px_rgba(59,130,246,1)]">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900">STUD'S Comm</h3>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Espace de Discussion</p>
            </div>
          </div>
          
          {/* Sound Notification Button */}
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-1.5 rounded-lg border border-slate-200/60 shadow-sm transition-all ${
              soundEnabled ? 'bg-amber-400 hover:bg-amber-500' : 'bg-slate-200 hover:bg-slate-300'
            }`}
            title={soundEnabled ? "Sons activés" : "Sons désactivés"}
          >
            <Volume2 className={`w-3.5 h-3.5 text-slate-950 ${soundEnabled ? '' : 'opacity-40'}`} />
          </button>
        </div>

        {/* Channels List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          <div>
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block px-2 mb-2">
              Canaux Globaux
            </span>
            <button
              onClick={() => setActiveChannel('general')}
              className={`w-full text-left p-3 rounded-xl border-2 flex items-center justify-between transition-all cursor-pointer ${
                activeChannel === 'general'
                  ? 'bg-brand-700 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200 hover:border-slate-900 shadow-sm'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Hash className="w-4 h-4 flex-shrink-0" />
                <div className="truncate">
                  <span className="text-xs font-extrabold uppercase tracking-wide block">Canal Général</span>
                  <span className={`text-[9px] block ${activeChannel === 'general' ? 'text-slate-300' : 'text-slate-500'}`}>
                    Tous les prestataires & admin
                  </span>
                </div>
              </div>
              <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-black ${
                activeChannel === 'general' ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-800'
              }`}>
                {chatMessages.filter(m => m.channelId === 'general').length}
              </span>
            </button>
          </div>

          {/* Direct Support chats section */}
          <div>
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                {currentUser.role === 'admin' || currentUser.role === 'supervisor' ? "Fils de support prestataires" : "Support Privé"}
              </span>
            </div>

            {currentUser.role === 'provider' ? (
              // Provider only sees their private line with the admins
              <button
                onClick={() => setActiveChannel(`direct_${currentUser.id}`)}
                className={`w-full text-left p-3 rounded-xl border-2 flex items-center justify-between transition-all cursor-pointer ${
                  activeChannel === `direct_${currentUser.id}`
                    ? 'bg-blue-600 text-white border-blue-900 shadow-sm border-slate-100/50'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200 hover:border-slate-900 shadow-sm'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Shield className="w-4 h-4 text-rose-500 flex-shrink-0" />
                  <div className="truncate">
                    <span className="text-xs font-extrabold uppercase tracking-wide block">Support Admin</span>
                    <span className={`text-[9px] block ${activeChannel === `direct_${currentUser.id}` ? 'text-slate-200' : 'text-slate-500'}`}>
                      Ligne privée avec l'administration
                    </span>
                  </div>
                </div>
                <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-black ${
                  activeChannel === `direct_${currentUser.id}` ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-800'
                }`}>
                  {chatMessages.filter(m => m.channelId === `direct_${currentUser.id}`).length}
                </span>
              </button>
            ) : (
              // Admins & Assistants can click on any provider to open support conversation
              <div className="space-y-1.5">
                {/* Search bar for listing */}
                <div className="relative mb-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filtrer par nom..."
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200/60 rounded-xl text-[10px] font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <Search className="w-3 h-3 absolute left-2.5 top-2.5 text-slate-400" />
                </div>

                <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1">
                  {filteredProviders.length === 0 ? (
                    <p className="text-[9px] text-center text-slate-400 italic p-2">Aucun prestataire trouvé</p>
                  ) : (
                    filteredProviders.map(provider => {
                      const channelId = `direct_${provider.id}`;
                      const count = chatMessages.filter(m => m.channelId === channelId).length;
                      const isActive = activeChannel === channelId;
                      const hasMessages = count > 0;
                      
                      return (
                        <button
                          key={provider.id}
                          onClick={() => setActiveChannel(channelId)}
                          className={`w-full text-left p-2 rounded-xl border-2 flex items-center justify-between transition-all cursor-pointer ${
                            isActive
                              ? 'bg-indigo-600 text-white border-indigo-900 shadow-sm border-slate-100/50'
                              : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200 hover:border-slate-950 shadow-sm'
                          }`}
                        >
                          <div className="flex items-center space-x-2 truncate">
                            <img 
                              src={provider.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
                              alt="Avatar" 
                              className="w-6 h-6 rounded-full border border-slate-200/50 flex-shrink-0 object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <div className="truncate">
                              <span className="text-[10px] font-bold block truncate">{provider.firstName} {provider.lastName}</span>
                              <span className={`text-[8px] block ${isActive ? 'text-indigo-200' : 'text-slate-400'} font-medium`}>
                                ID: {provider.id}
                              </span>
                            </div>
                          </div>
                          {hasMessages && (
                            <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-black ${
                              isActive ? 'bg-amber-400 text-slate-950' : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                            }`}>
                              {count}
                            </span>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Current user footer badge */}
        <div className="p-3 bg-slate-100 border-t border-slate-200/80 flex items-center space-x-2.5">
          <img 
            src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
            alt="My Avatar" 
            className="w-8 h-8 rounded-full border border-slate-200/60 object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="truncate flex-1">
            <span className="text-[10px] font-black block truncate text-slate-800">
              {currentUser.firstName} {currentUser.lastName}
            </span>
            <div className="flex items-center space-x-1 mt-0.5">
              {getRoleBadge(currentUser.role)}
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Main chat display pane */}
      <div className="flex-1 flex flex-col h-2/3 md:h-full bg-slate-100">
        
        {/* Chat area header info */}
        <div className="p-4 bg-white border-b-2 border-slate-900 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1 rounded bg-brand-700 text-white font-extrabold text-[10px] uppercase">
                {activeChannel === 'general' ? 'Général' : 'Support'}
              </span>
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900">
                {activeChannel === 'general' 
                  ? 'Canal Général de Discussion' 
                  : (currentUser.role === 'admin' || currentUser.role === 'supervisor')
                  ? `Ligne Privée : Support ${users.find(u => `direct_${u.id}` === activeChannel)?.firstName || ''} ${users.find(u => `direct_${u.id}` === activeChannel)?.lastName || ''}`
                  : 'Ligne Privée avec Administration'}
              </h4>
            </div>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
              {activeChannel === 'general'
                ? "Tous les membres d'administration et prestataires étud's"
                : "Seuls vous et les assistants d'administration ont accès à cette discussion"}
            </p>
          </div>

          <span className="px-2 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg text-[9px] font-bold flex items-center space-x-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
            <span>Serveur Connecté</span>
          </span>
        </div>

        {/* Message scroll container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/70">
          {filteredMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <MessageSquare className="w-10 h-10 stroke-[1.5] mb-2" />
              <p className="text-xs font-extrabold uppercase tracking-wide text-slate-600">Aucun message pour le moment</p>
              <p className="text-[10px] mt-1 max-w-xs">Lancez la discussion en tapant votre premier message dans la zone ci-dessous.</p>
            </div>
          ) : (
            filteredMessages.map((msg, index) => {
              const isMe = msg.senderId === currentUser.id;
              
              return (
                <div 
                  key={msg.id} 
                  className={`flex items-start space-x-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  {!isMe && (
                    <img 
                      src={msg.senderAvatar} 
                      alt="Avatar" 
                      className="w-7 h-7 rounded-full border border-slate-200/50 object-cover flex-shrink-0 mt-0.5"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <div className={`max-w-[75%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center space-x-1.5 mb-0.5">
                      <span className="text-[9px] font-black text-slate-700">
                        {isMe ? 'Moi' : msg.senderName}
                      </span>
                      {!isMe && getRoleBadge(msg.senderRole)}
                      <span className="text-[8px] text-slate-400">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className={`p-3 rounded-2xl border-2 text-xs font-medium leading-relaxed break-words whitespace-pre-wrap shadow-sm ${
                      isMe 
                        ? 'bg-blue-600 text-white border-blue-900 rounded-tr-none' 
                        : msg.senderRole === 'admin'
                        ? 'bg-rose-50 text-rose-950 border-rose-900 rounded-tl-none'
                        : msg.senderRole === 'supervisor'
                        ? 'bg-indigo-50 text-indigo-950 border-indigo-900 rounded-tl-none'
                        : 'bg-white text-slate-800 border-slate-900 rounded-tl-none'
                    }`}>
                      {msg.message}
                    </div>
                  </div>
                  {isMe && (
                    <img 
                      src={currentUser.avatar} 
                      alt="Avatar" 
                      className="w-7 h-7 rounded-full border border-slate-200/50 object-cover flex-shrink-0 mt-0.5"
                      referrerPolicy="no-referrer"
                    />
                  )}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input box */}
        <div className="p-3 bg-white border-t border-slate-200/80">
          {error && (
            <div className="mb-2 p-2 bg-rose-50 text-rose-800 border border-rose-200 rounded-lg text-[10px] font-bold flex items-center space-x-1">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
            <input
              type="text"
              value={messageText}
              onChange={(e) => {
                setMessageText(e.target.value);
                if (error) setError(null);
              }}
              placeholder={`Tapez votre message pour ${activeChannel === 'general' ? 'le Canal Général...' : 'le Support...'}`}
              className="flex-1 bg-slate-50 border border-slate-200/60 p-2.5 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !messageText.trim()}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider border border-slate-200/60 shadow-sm border-slate-100/50 hover:shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center space-x-1.5"
            >
              {sending ? (
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Envoyer</span>
                </>
              )}
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
