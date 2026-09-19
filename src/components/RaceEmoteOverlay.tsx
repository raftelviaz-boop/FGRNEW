import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smile, MessageCircle } from 'lucide-react';
import { EmoteTaunt } from '../types';
import { socketManager } from '../utils/multiplayerSocket';
import { sound } from '../audio/sound';

const QUICK_EMOTES = [
  { emoji: '🔥', text: 'Gas pol!' },
  { emoji: '⚡', text: 'Skids tajam!' },
  { emoji: '💨', text: 'Gak kekejar!' },
  { emoji: '🚴‍♂️', text: 'Sprint IQ!' },
  { emoji: '⛰️', text: 'Tanjakan pedas!' },
  { emoji: '👏', text: 'Good Game!' }
];

interface RaceEmoteOverlayProps {
  isOnlineMatch: boolean;
}

export function RaceEmoteOverlay({ isOnlineMatch }: RaceEmoteOverlayProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [activeEmotes, setActiveEmotes] = useState<EmoteTaunt[]>([]);

  useEffect(() => {
    if (!isOnlineMatch) return;

    const unsubscribe = socketManager.subscribe((event) => {
      if (event.type === 'EMOTE_RECEIVED') {
        const newEmote: EmoteTaunt = {
          id: Math.random().toString(36).substring(2, 9),
          senderId: event.senderId,
          senderName: event.senderName,
          emoji: event.emoji,
          text: event.text,
          timestamp: Date.now()
        };

        setActiveEmotes(prev => [...prev.slice(-3), newEmote]);
        sound.playBellRing();

        setTimeout(() => {
          setActiveEmotes(prev => prev.filter(e => e.id !== newEmote.id));
        }, 3500);
      }
    });

    return () => unsubscribe();
  }, [isOnlineMatch]);

  if (!isOnlineMatch) return null;

  const handleSendEmote = (emoji: string, text: string) => {
    socketManager.sendEmote(emoji, text);
    setShowPicker(false);
  };

  return (
    <>
      {/* Floating Animated Emotes Screen Overlay */}
      <div className="fixed top-20 right-6 z-50 pointer-events-none flex flex-col gap-2 items-end">
        <AnimatePresence>
          {activeEmotes.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.5, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -30 }}
              transition={{ type: 'spring', damping: 15, stiffness: 200 }}
              className="bg-zinc-900/90 border border-amber-400/50 shadow-2xl backdrop-blur-md px-3.5 py-2 rounded-2xl flex items-center gap-2.5 text-white max-w-xs"
            >
              <span className="text-2xl animate-bounce">{item.emoji}</span>
              <div className="flex flex-col">
                <span className="text-[10px] text-amber-400 font-mono font-bold leading-none">
                  {item.senderName}
                </span>
                <span className="text-xs font-black text-white leading-tight">
                  {item.text}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Floating Bottom Quick Emote Bar Button */}
      <div className="fixed bottom-4 right-4 z-40">
        <div className="relative">
          {showPicker && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute bottom-12 right-0 mb-2 p-2 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl grid grid-cols-2 gap-1.5 w-64 backdrop-blur-md"
            >
              <div className="col-span-2 text-[10px] font-mono text-zinc-400 px-2 py-1 uppercase border-b border-zinc-800 mb-1">
                Kirim Emote ke Teman:
              </div>
              {QUICK_EMOTES.map((em) => (
                <button
                  key={em.text}
                  onClick={() => handleSendEmote(em.emoji, em.text)}
                  className="px-2.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-left flex items-center gap-2 hover:border-amber-400 transition-all cursor-pointer"
                >
                  <span className="text-lg">{em.emoji}</span>
                  <span className="text-[11px] font-bold text-zinc-200 truncate">{em.text}</span>
                </button>
              ))}
            </motion.div>
          )}

          <button
            onClick={() => setShowPicker(!showPicker)}
            className="w-11 h-11 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-amber-400/50 text-amber-400 flex items-center justify-center shadow-xl shadow-black/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Kirim Emote Balapan"
          >
            <MessageCircle className="w-5 h-5" />
          </button>
        </div>
      </div>
    </>
  );
}
