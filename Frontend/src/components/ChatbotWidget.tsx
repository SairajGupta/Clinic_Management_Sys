import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageCircle, X, Send } from 'lucide-react';

export default function ChatbotWidget() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-[15rem] lg:bottom-44 right-5 z-50 w-[calc(100vw-2.5rem)] sm:w-96 bg-white rounded-lg shadow-elevated border border-mint/30 overflow-hidden animate-scale-in origin-bottom-right">
          {/* Header */}
          <div className="bg-gradient-to-r from-sage to-sage-dark px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle className="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">{t('chatbot.title')}</p>
                <p className="text-xs text-white/70">Online</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
              aria-label="Close chat"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Messages */}
          <div className="h-64 p-4 bg-offwhite overflow-y-auto">
            <div className="bg-mint/50 rounded-lg rounded-tl-none px-4 py-3 max-w-[85%]">
              <p className="text-sm text-dark">{t('chatbot.welcome')}</p>
            </div>
            <div className="mt-3 bg-sky/10 rounded-lg rounded-tl-none px-4 py-3 max-w-[85%]">
              <p className="text-sm text-dark-soft">{t('chatbot.offline')}</p>
            </div>
          </div>

          {/* Input */}
          <div className="p-3 border-t border-mint/20 bg-white">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder={t('chatbot.placeholder')}
                className="input-field !py-2.5 !text-sm !rounded-xl"
                disabled
              />
              <button
                className="w-10 h-10 rounded-xl bg-sage/20 flex items-center justify-center flex-shrink-0 cursor-not-allowed"
                disabled
                aria-label="Send message"
              >
                <Send className="w-4 h-4 text-sage" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <div className="fixed bottom-44 lg:bottom-28 right-5 z-50 group">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
            isOpen
              ? 'bg-warm-gray scale-90'
              : 'bg-gradient-to-br from-sky to-sky-dark hover:shadow-xl hover:scale-105'
          }`}
          aria-label="Open chat"
        >
          {isOpen ? (
            <X className="w-5 h-5 text-white" />
          ) : (
            <MessageCircle className="w-6 h-6 text-white" />
          )}
        </button>

        {/* Tooltip */}
        {!isOpen && (
          <div className="absolute top-1/2 -translate-y-1/2 right-full mr-4 px-3 py-1.5 bg-dark text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            {t('chatbot.tooltip')}
            <div className="absolute top-1/2 -translate-y-1/2 left-full border-4 border-transparent border-l-dark" />
          </div>
        )}
      </div>
    </>
  );
}
