import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageCircle,
  Send,
  LogOut,
  ShieldCheck,
  ArrowLeft,
  Search,
  Plus,
  School,
  Clock,
  Sparkles,
  Mail,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import portalApi from '../api/portalClient';
import { usePortalAuth } from '../context/PortalAuthContext';
import { useChatSocket } from '../hooks/useChatSocket';
import PageHeader from '../components/ui/PageHeader';
import { Field, inputClass } from '../components/admin/FormModal';

function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?';
}

function relativeTime(date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function formatTime(date) {
  return new Date(date).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getLastActivity(conversation) {
  const replies = conversation.replies || [];
  if (replies.length === 0) return conversation.createdAt;
  return replies[replies.length - 1].sentAt;
}

function getPreview(conversation) {
  const replies = conversation.replies || [];
  if (replies.length === 0) return conversation.message;
  const last = replies[replies.length - 1];
  const prefix = last.senderType === 'USER' ? 'You: ' : 'School: ';
  return prefix + last.body;
}

function awaitingSchoolReply(conversation) {
  const replies = conversation.replies || [];
  if (replies.length === 0) return true;
  return replies[replies.length - 1].senderType === 'USER';
}

function mergeReply(conversation, reply) {
  const replies = conversation.replies || [];
  if (replies.some((r) => r.id === reply.id)) return conversation;
  return { ...conversation, replies: [...replies, reply] };
}

function OtpCodeInput({ value, onChange, disabled }) {
  const inputsRef = useRef([]);
  const digits = value.padEnd(6, ' ').split('').slice(0, 6);

  const setDigit = (index, char) => {
    const next = digits.map((d, i) => (i === index ? char : d === ' ' ? '' : d)).join('');
    onChange(next.replace(/\s/g, '').slice(0, 6));
  };

  const handleChange = (index, e) => {
    const char = e.target.value.replace(/\D/g, '').slice(-1);
    setDigit(index, char);
    if (char && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index]?.trim() && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) onChange(pasted);
  };

  return (
    <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            inputsRef.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit.trim()}
          disabled={disabled}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className="w-11 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-xl border-2 border-slate-200 bg-white text-rw-navy focus:border-rw-blue-500 focus:ring-2 focus:ring-rw-blue-100 outline-none transition disabled:opacity-60"
          aria-label={`Digit ${i + 1}`}
        />
      ))}
    </div>
  );
}

function OtpLogin({
  onSuccess,
  defaultEmail = '',
  defaultName = '',
  messageId,
  purpose = 'LOGIN',
  startAtCode = false,
  embedded = false,
}) {
  const { sendOtp, verifyOtp } = usePortalAuth();
  const [email, setEmail] = useState(defaultEmail);
  const [name, setName] = useState(defaultName);
  const [code, setCode] = useState('');
  const [step, setStep] = useState(defaultEmail && startAtCode ? 'code' : 'email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const requestCode = async () => {
    setError('');
    setLoading(true);
    try {
      const data = await sendOtp(email, purpose, name);
      setInfo(data.message);
      setStep('code');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send code.');
    } finally {
      setLoading(false);
    }
  };

  const submitCode = async () => {
    setError('');
    setLoading(true);
    try {
      await verifyOtp({ email, code, name, messageId, purpose });
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formCard = (
    <div
      className={`bg-white rounded-2xl border border-slate-200/80 shadow-lg shadow-slate-200/50 p-6 md:p-8 ${
        embedded ? '' : 'max-w-md w-full'
      }`}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-rw-blue-500 to-rw-blue-700 flex items-center justify-center shadow-md shadow-rw-blue-600/20">
          <ShieldCheck className="text-white" size={22} />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-rw-blue-600">
            Step {step === 'email' ? '1' : '2'} of 2
          </p>
          <h2 className="text-lg font-bold text-rw-navy">
            {step === 'email'
              ? purpose === 'REGISTER'
                ? 'Verify your email'
                : 'Enter your email'
              : 'Check your inbox'}
          </h2>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <div
          className={`h-1 flex-1 rounded-full ${step === 'email' ? 'bg-rw-blue-600' : 'bg-rw-blue-200'}`}
        />
        <div
          className={`h-1 flex-1 rounded-full ${step === 'code' ? 'bg-rw-blue-600' : 'bg-slate-200'}`}
        />
      </div>

      <p className="text-slate-600 text-sm mb-6 leading-relaxed">
        {step === 'email'
          ? purpose === 'REGISTER'
            ? 'We sent a verification code to activate your account. Confirm your email to start chatting.'
            : 'Enter the email you used when contacting us. We will send a secure one-time code — no password needed.'
          : `Enter the 6-digit code sent to ${email}. It expires in 10 minutes.`}
      </p>

      {error && (
        <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {error}
        </div>
      )}
      {info && step === 'code' && (
        <div className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-start gap-2">
          <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
          {info}
        </div>
      )}

      {step === 'email' ? (
        <div className="space-y-4">
          {purpose === 'REGISTER' && (
            <Field label="Full name">
              <input
                className={inputClass}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                required
              />
            </Field>
          )}
          <Field label="Email address">
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="email"
                className={`${inputClass} pl-10`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
          </Field>
          <button
            type="button"
            onClick={requestCode}
            disabled={loading || !email}
            className="w-full py-3.5 bg-rw-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-rw-blue-700 disabled:opacity-60 transition shadow-md shadow-rw-blue-600/20 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Sending code...
              </>
            ) : (
              'Send verification code'
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          <OtpCodeInput value={code} onChange={setCode} disabled={loading} />
          <button
            type="button"
            onClick={submitCode}
            disabled={loading || code.length < 6}
            className="w-full py-3.5 bg-brand-red-600 text-white rounded-xl font-semibold text-sm hover:bg-brand-red-700 disabled:opacity-60 transition shadow-md shadow-brand-red-600/20 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Verifying...
              </>
            ) : (
              'Verify & open messages'
            )}
          </button>
          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={() => {
                setStep('email');
                setCode('');
                setError('');
              }}
              className="text-slate-500 hover:text-rw-navy transition"
            >
              Change email
            </button>
            <button
              type="button"
              onClick={requestCode}
              disabled={loading}
              className="text-rw-blue-600 font-semibold hover:underline disabled:opacity-60"
            >
              Resend code
            </button>
          </div>
        </div>
      )}
    </div>
  );

  if (embedded) return formCard;

  return (
    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-5xl mx-auto">
      <div className="order-2 lg:order-1">{formCard}</div>
      <div className="order-1 lg:order-2 space-y-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rw-blue-50 text-rw-blue-700 text-xs font-semibold uppercase tracking-wide">
            <Sparkles size={14} /> Secure portal
          </span>
          <h3 className="text-2xl md:text-3xl font-bold text-rw-navy mt-4 leading-tight">
            Chat directly with our school team
          </h3>
          <p className="text-slate-600 mt-3 leading-relaxed">
            View your conversations, get replies faster, and continue the discussion without
            searching through email threads.
          </p>
        </div>
        <ul className="space-y-4">
          {[
            { icon: ShieldCheck, text: 'Passwordless sign-in with a one-time email code' },
            { icon: MessageCircle, text: 'All your messages in one place' },
            { icon: Clock, text: 'Real-time chat with school staff' },
          ].map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-3">
              <span className="w-9 h-9 rounded-lg bg-rw-green-50 text-rw-green-700 flex items-center justify-center shrink-0">
                <Icon size={18} />
              </span>
              <span className="text-slate-700 text-sm pt-1.5">{text}</span>
            </li>
          ))}
        </ul>
        <p className="text-sm text-slate-500 pt-2 border-t border-slate-200">
          New here?{' '}
          <Link to="/contact" className="text-rw-blue-600 font-semibold hover:underline">
            Send your first message
          </Link>{' '}
          and create a free account.
        </p>
      </div>
    </div>
  );
}

function ConversationListItem({ conversation, selected, onSelect }) {
  const waiting = awaitingSchoolReply(conversation);
  const preview = getPreview(conversation);
  const activity = getLastActivity(conversation);

  return (
    <button
      type="button"
      onClick={() => onSelect(conversation)}
      className={`w-full text-left p-4 border-b border-slate-100 hover:bg-slate-50/80 transition group ${
        selected?.id === conversation.id
          ? 'bg-rw-blue-50/80 border-l-[3px] border-l-rw-blue-600 pl-[13px]'
          : 'border-l-[3px] border-l-transparent'
      }`}
    >
      <div className="flex gap-3">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
            waiting
              ? 'bg-brand-red-100 text-brand-red-700'
              : 'bg-rw-blue-100 text-rw-blue-700'
          }`}
        >
          <School size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold text-sm text-rw-navy truncate group-hover:text-rw-blue-700 transition">
              {conversation.subject || 'General inquiry'}
            </p>
            <span className="text-[10px] text-slate-400 shrink-0 pt-0.5">{relativeTime(activity)}</span>
          </div>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{preview}</p>
          {waiting && (
            <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-semibold uppercase tracking-wide text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Awaiting reply
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function ChatBubble({ message, isUser, senderName, time }) {
  return (
    <div className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
          isUser ? 'bg-rw-blue-600 text-white' : 'bg-slate-200 text-slate-600'
        }`}
      >
        {isUser ? initials(senderName) : <School size={14} />}
      </div>
      <div className={`max-w-[min(85%,28rem)] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm shadow-sm ${
            isUser
              ? 'bg-rw-blue-600 text-white rounded-tr-md'
              : 'bg-white border border-slate-200 text-slate-700 rounded-tl-md'
          }`}
        >
          <p className={`text-[11px] font-medium mb-1.5 ${isUser ? 'text-blue-100' : 'text-slate-500'}`}>
            {isUser ? 'You' : senderName || 'School staff'}
          </p>
          <p className="whitespace-pre-wrap leading-relaxed">{message}</p>
        </div>
        <p className="text-[10px] text-slate-400 mt-1 px-1">{formatTime(time)}</p>
      </div>
    </div>
  );
}

function MessagesSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-[calc(100svh-14rem)] bg-white rounded-2xl border border-slate-200 flex">
        <div className="w-80 border-r border-slate-100 p-4 space-y-4 hidden md:block">
          <div className="h-10 bg-slate-100 rounded-lg" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-slate-100 rounded w-3/4" />
                <div className="h-2 bg-slate-100 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="text-slate-300 animate-spin" size={32} />
        </div>
      </div>
    </div>
  );
}

export default function MyMessages() {
  const { user, loading, isAuthenticated, logout } = usePortalAuth();
  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const [typingFrom, setTypingFrom] = useState(null);
  const [portalToken, setPortalToken] = useState(() => localStorage.getItem('portalToken'));
  const threadEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) setPortalToken(localStorage.getItem('portalToken'));
  }, [isAuthenticated]);

  const handleSocketReply = useCallback(({ conversationId, reply: newReply }) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? mergeReply(c, newReply) : c))
    );
    setSelected((prev) => {
      if (!prev || prev.id !== conversationId) return prev;
      return mergeReply(prev, newReply);
    });
  }, []);

  const handleSocketConversation = useCallback(({ conversation }) => {
    setConversations((prev) => {
      if (prev.some((c) => c.id === conversation.id)) return prev;
      return [conversation, ...prev];
    });
  }, []);

  const handleSocketTyping = useCallback(
    ({ conversationId, typing, from, name }) => {
      if (from === 'portal') return;
      if (conversationId !== selected?.id) return;
      setTypingFrom(typing ? name || 'School staff' : null);
    },
    [selected?.id]
  );

  const { connected, notifyTyping } = useChatSocket({
    enabled: isAuthenticated && Boolean(portalToken),
    type: 'portal',
    token: portalToken,
    conversationId: selected?.id,
    onReply: handleSocketReply,
    onConversation: handleSocketConversation,
    onTyping: handleSocketTyping,
  });

  const load = async () => {
    setLoadingConversations(true);
    try {
      const res = await portalApi.get('/conversations');
      setConversations(res.data);
      setSelected((prev) => {
        if (!prev) return res.data[0] || null;
        return res.data.find((c) => c.id === prev.id) || res.data[0] || null;
      });
    } finally {
      setLoadingConversations(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) load();
  }, [isAuthenticated]);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selected?.id, selected?.replies?.length]);

  const filteredConversations = useMemo(() => {
    if (!search.trim()) return conversations;
    const q = search.toLowerCase();
    return conversations.filter(
      (c) =>
        (c.subject || '').toLowerCase().includes(q) ||
        c.message.toLowerCase().includes(q) ||
        getPreview(c).toLowerCase().includes(q)
    );
  }, [conversations, search]);

  const sendReply = async () => {
    if (!reply.trim() || !selected) return;
    setSending(true);
    try {
      const { data } = await portalApi.post(`/conversations/${selected.id}/reply`, {
        body: reply,
      });
      setReply('');
      setConversations((prev) =>
        prev.map((c) => (c.id === selected.id ? mergeReply(c, data) : c))
      );
      setSelected((prev) => (prev ? mergeReply(prev, data) : prev));
      textareaRef.current?.focus();
    } finally {
      setSending(false);
    }
  };

  const handleComposerKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendReply();
    }
  };

  if (loading) return <MessagesSkeleton />;

  if (!isAuthenticated) {
    return (
      <>
        <PageHeader
          title="My Messages"
          subtitle="Sign in securely to chat with our school team"
          breadcrumbs={[{ label: 'My Messages' }]}
        />
        <div className="bg-gradient-to-b from-slate-50 to-white min-h-[60vh]">
          <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
            <OtpLogin onSuccess={load} purpose="LOGIN" />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="My Messages"
        subtitle="Continue your conversations with our school"
        breadcrumbs={[{ label: 'My Messages' }]}
      />

      <div className="bg-gradient-to-b from-slate-50 to-slate-100/80 min-h-[calc(100svh-12rem)]">
        <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
          {/* User bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rw-blue-500 to-rw-blue-700 text-white flex items-center justify-center text-sm font-bold shadow-md">
                {initials(user.name)}
              </div>
              <div>
                <p className="font-semibold text-rw-navy text-sm">{user.name}</p>
                <p className="text-xs text-slate-500">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/contact"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-white border border-slate-200 text-rw-navy hover:bg-rw-blue-50 hover:border-rw-blue-200 transition shadow-sm"
              >
                <Plus size={16} /> New message
              </Link>
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 transition"
              >
                <LogOut size={16} /> Sign out
              </button>
            </div>
          </div>

          {/* Chat shell */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-200/40 overflow-hidden h-[calc(100svh-18rem)] min-h-[480px] flex">
            {/* Sidebar */}
            <aside
              className={`w-full md:w-[340px] lg:w-[360px] border-r border-slate-200 flex flex-col bg-slate-50/50 ${
                selected ? 'hidden md:flex' : 'flex'
              }`}
            >
              <div className="p-4 border-b border-slate-200 bg-white shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-bold text-rw-navy flex items-center gap-2">
                    <MessageCircle size={18} className="text-rw-blue-600" />
                    Conversations
                    {connected && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        Live
                      </span>
                    )}
                  </h2>
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                    {conversations.length}
                  </span>
                </div>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search messages..."
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-rw-blue-300 focus:ring-2 focus:ring-rw-blue-100 outline-none transition"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto overscroll-contain">
                {loadingConversations ? (
                  <div className="p-8 flex justify-center">
                    <Loader2 className="animate-spin text-slate-300" size={28} />
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-rw-blue-50 text-rw-blue-600 flex items-center justify-center mx-auto mb-4">
                      <MessageCircle size={28} />
                    </div>
                    <p className="font-semibold text-rw-navy text-sm">
                      {search ? 'No matches found' : 'No conversations yet'}
                    </p>
                    <p className="text-xs text-slate-500 mt-2 mb-4 leading-relaxed">
                      {search
                        ? 'Try a different search term.'
                        : 'Start by sending us a message — we will reply here and by email.'}
                    </p>
                    {!search && (
                      <Link
                        to="/contact"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-red-600 text-white rounded-xl text-sm font-semibold hover:bg-brand-red-700 transition shadow-md"
                      >
                        <Plus size={16} /> Contact us
                      </Link>
                    )}
                  </div>
                ) : (
                  filteredConversations.map((c) => (
                    <ConversationListItem
                      key={c.id}
                      conversation={c}
                      selected={selected}
                      onSelect={setSelected}
                    />
                  ))
                )}
              </div>
            </aside>

            {/* Thread */}
            <section
              className={`flex-1 flex flex-col min-w-0 bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_120px)] ${
                !selected ? 'hidden md:flex' : 'flex'
              }`}
            >
              {!selected ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-rw-blue-100 to-rw-blue-50 flex items-center justify-center mb-5">
                    <MessageCircle size={36} className="text-rw-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-rw-navy">Select a conversation</h3>
                  <p className="text-sm text-slate-500 mt-2 max-w-sm leading-relaxed">
                    Choose a thread on the left to read messages and chat with our team in real time.
                  </p>
                </div>
              ) : (
                <>
                  <header className="px-4 py-3.5 border-b border-slate-200 bg-white/90 backdrop-blur-sm flex items-center gap-3 shrink-0 z-10">
                    <button
                      type="button"
                      className="md:hidden p-2 -ml-1 rounded-xl hover:bg-slate-100 text-slate-600 transition"
                      onClick={() => setSelected(null)}
                      aria-label="Back to conversations"
                    >
                      <ArrowLeft size={20} />
                    </button>
                    <div className="w-10 h-10 rounded-full bg-rw-blue-100 text-rw-blue-700 flex items-center justify-center shrink-0">
                      <School size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-rw-navy truncate">
                        {selected.subject || 'General inquiry'}
                      </p>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock size={12} />
                        Started {formatTime(selected.createdAt)}
                      </p>
                    </div>
                    {awaitingSchoolReply(selected) && (
                      <span className="hidden sm:inline-flex text-[10px] font-semibold uppercase tracking-wide text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full shrink-0">
                        Awaiting reply
                      </span>
                    )}
                  </header>

                  <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-5 space-y-5">
                    <div className="flex justify-center">
                      <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                        Conversation started {formatTime(selected.createdAt)}
                      </span>
                    </div>

                    <ChatBubble
                      message={selected.message}
                      isUser
                      senderName={user.name}
                      time={selected.createdAt}
                    />

                    {selected.replies?.map((r) => (
                      <ChatBubble
                        key={r.id}
                        message={r.body}
                        isUser={r.senderType === 'USER'}
                        senderName={r.senderType === 'USER' ? user.name : r.adminName || 'School staff'}
                        time={r.sentAt}
                      />
                    ))}
                    <div ref={threadEndRef} />
                  </div>

                  <footer className="border-t border-slate-200 bg-white shrink-0">
                    {typingFrom && (
                      <p className="text-xs text-slate-500 px-4 pt-3 animate-pulse">
                        {typingFrom} is typing...
                      </p>
                    )}
                    <div className="p-4">
                    <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 focus-within:border-rw-blue-300 focus-within:ring-2 focus-within:ring-rw-blue-100 transition">
                      <textarea
                        ref={textareaRef}
                        className="flex-1 resize-none bg-transparent border-0 outline-none text-sm text-slate-800 placeholder:text-slate-400 px-2 py-2 max-h-32"
                        rows={1}
                        value={reply}
                        onChange={(e) => {
                          setReply(e.target.value);
                          notifyTyping();
                        }}
                        onKeyDown={handleComposerKeyDown}
                        placeholder="Write a message..."
                      />
                      <button
                        type="button"
                        onClick={sendReply}
                        disabled={sending || !reply.trim()}
                        className="shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-brand-red-600 text-white hover:bg-brand-red-700 disabled:opacity-40 disabled:hover:bg-brand-red-600 transition shadow-md shadow-brand-red-600/20"
                        aria-label="Send message"
                      >
                        {sending ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <Send size={18} />
                        )}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 text-center">
                      Press Enter to send · Shift+Enter for a new line
                    </p>
                    </div>
                  </footer>
                </>
              )}
            </section>
          </div>
        </div>
      </div>
    </>
  );
}

export { OtpLogin };
