import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Mail,
  MailOpen,
  Trash2,
  Send,
  CheckCircle2,
  Search,
  Inbox,
  MessageCircle,
  Phone,
  Clock,
  User,
  ArrowLeft,
  MailCheck,
  MessageSquare,
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import api from '../../api/client';
import { Field, inputClass } from '../../components/admin/FormModal';
import { useChatSocket } from '../../hooks/useChatSocket';
import { AdminButton, AdminCard, AdminStatCard } from '../../components/admin/AdminUI';

function initials(name) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
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

function shortRef(id) {
  return id.slice(-8).toUpperCase();
}

function mergeReply(message, reply) {
  const replies = message.replies || [];
  if (replies.some((r) => r.id === reply.id)) return message;
  return {
    ...message,
    replies: [...replies, reply],
    _count: { replies: replies.length + 1 },
  };
}

export default function ContactMessagesAdmin() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);
  const [replyError, setReplyError] = useState('');
  const [replyChannels, setReplyChannels] = useState({ email: true, sms: false, whatsapp: false });
  const [messagingStatus, setMessagingStatus] = useState({
    email: false,
    sms: false,
    whatsapp: false,
  });
  const [mobileShowDetail, setMobileShowDetail] = useState(false);
  const [typingFrom, setTypingFrom] = useState(null);
  const adminToken = localStorage.getItem('token');

  const handleSocketReply = useCallback(({ conversationId, reply }) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== conversationId) return m;
        const updated = mergeReply(m, reply);
        return reply.senderType === 'USER' ? { ...updated, read: false } : { ...updated, read: true };
      })
    );

    setSelected((prev) => {
      if (!prev || prev.id !== conversationId) return prev;
      const updated = mergeReply(prev, reply);
      return reply.senderType === 'USER' ? { ...updated, read: false } : { ...updated, read: true };
    });
  }, []);

  const handleSocketConversation = useCallback(({ conversation }) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === conversation.id)) return prev;
      return [{ ...conversation, _count: { replies: 0 } }, ...prev];
    });
  }, []);

  const handleSocketUpdate = useCallback(({ conversationId, updates }) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === conversationId ? { ...m, ...updates } : m))
    );
    setSelected((prev) => (prev?.id === conversationId ? { ...prev, ...updates } : prev));
  }, []);

  const handleSocketTyping = useCallback(
    ({ conversationId, typing, from, name }) => {
      if (from === 'admin') return;
      if (conversationId !== selected?.id) return;
      setTypingFrom(typing ? name || 'User' : null);
    },
    [selected?.id]
  );

  const { connected, notifyTyping } = useChatSocket({
    enabled: Boolean(adminToken),
    type: 'admin',
    token: adminToken,
    conversationId: selected?.id,
    onReply: handleSocketReply,
    onConversation: handleSocketConversation,
    onConversationUpdate: handleSocketUpdate,
    onTyping: handleSocketTyping,
  });

  const load = () => {
    setLoading(true);
    api
      .get('/contact')
      .then((res) => setMessages(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    api
      .get('/contact/messaging-status')
      .then((res) => setMessagingStatus(res.data))
      .catch(() => {});
  }, []);

  const stats = useMemo(
    () => ({
      total: messages.length,
      unread: messages.filter((m) => !m.read).length,
      replied: messages.filter((m) => (m._count?.replies || m.replies?.length || 0) > 0).length,
    }),
    [messages]
  );

  const filtered = useMemo(() => {
    let list = [...messages];
    if (filter === 'unread') list = list.filter((m) => !m.read);
    if (filter === 'replied') list = list.filter((m) => (m._count?.replies || 0) > 0);
    if (filter === 'awaiting') list = list.filter((m) => (m._count?.replies || 0) === 0);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          (m.subject || '').toLowerCase().includes(q) ||
          m.message.toLowerCase().includes(q)
      );
    }
    return list;
  }, [messages, filter, search]);

  const selectMessage = async (msg) => {
    try {
      const { data } = await api.get(`/contact/${msg.id}`);
      if (!data.read) {
        await api.patch(`/contact/${msg.id}`, { read: true });
        data.read = true;
        setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, read: true } : m)));
      }
      setSelected(data);
      setReplyText('');
      setReplyError('');
      setReplyChannels({
        email: messagingStatus.email !== false,
        sms: Boolean(data.phone && messagingStatus.sms),
        whatsapp: Boolean(data.phone && messagingStatus.whatsapp),
      });
      setMobileShowDetail(true);
    } catch {
      setReplyError('Failed to load message.');
    }
  };

  const toggleRead = async () => {
    if (!selected) return;
    const read = !selected.read;
    await api.patch(`/contact/${selected.id}`, { read });
    setSelected((s) => ({ ...s, read }));
    setMessages((prev) => prev.map((m) => (m.id === selected.id ? { ...m, read } : m)));
  };

  const deleteMessage = async () => {
    if (!selected || !confirm('Delete this message permanently?')) return;
    await api.delete(`/contact/${selected.id}`);
    setSelected(null);
    setMobileShowDetail(false);
    load();
  };

  const sendReply = async () => {
    if (!replyText.trim()) {
      setReplyError('Please write a reply message.');
      return;
    }

    const channels = Object.entries(replyChannels)
      .filter(([, enabled]) => enabled)
      .map(([channel]) => channel);

    if (!channels.length) {
      setReplyError('Select at least one delivery channel.');
      return;
    }

    setReplying(true);
    setReplyError('');
    try {
      const { data } = await api.post(`/contact/${selected.id}/reply`, {
        body: replyText,
        channels,
      });
      const updated = {
        ...mergeReply(selected, data),
        read: true,
      };
      setSelected(updated);
      setReplyText('');
      setMessages((prev) =>
        prev.map((m) =>
          m.id === selected.id
            ? { ...updated, _count: { replies: (m._count?.replies || 0) + 1 } }
            : m
        )
      );
      if (data.deliveryErrors?.length) {
        setReplyError(`Sent with warnings: ${data.deliveryErrors.join(' ')}`);
      }
    } catch (err) {
      setReplyError(err.response?.data?.error || 'Failed to send reply.');
    } finally {
      setReplying(false);
    }
  };

  const toggleChannel = (channel) => {
    setReplyChannels((prev) => ({ ...prev, [channel]: !prev[channel] }));
  };

  function deliveryLabel(reply) {
    if (reply.senderType === 'USER') return 'Portal chat';
    const parts = [];
    if (reply.emailSent) parts.push('Email');
    if (reply.smsSent) parts.push('SMS');
    if (reply.whatsappSent) parts.push('WhatsApp');
    if (!parts.length && reply.senderType === 'ADMIN') return 'Email sent';
    return parts.join(' · ') || 'Sent';
  }

  const filterTabs = [
    { id: 'all', label: 'All', count: stats.total },
    { id: 'unread', label: 'Unread', count: stats.unread },
    { id: 'awaiting', label: 'Awaiting reply', count: stats.total - stats.replied },
    { id: 'replied', label: 'Replied', count: stats.replied },
  ];

  return (
    <div className="h-[calc(100svh-11.5rem)] flex flex-col gap-4 min-h-0 overflow-hidden">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
        <AdminStatCard label="Total inbox" value={stats.total} icon={Inbox} accent="blue" />
        <AdminStatCard label="Unread" value={stats.unread} icon={Mail} accent="amber" />
        <AdminStatCard label="Replied" value={stats.replied} icon={CheckCircle2} accent="green" />
        <AdminStatCard
          label="Awaiting reply"
          value={stats.total - stats.replied}
          icon={MessageCircle}
          accent="red"
        />
      </div>

      {/* Inbox layout — fills remaining height; scroll only inside list & thread */}
      <AdminCard className="overflow-hidden flex-1 min-h-0 flex flex-col" noPadding>
        <div className="px-4 py-2 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Inbox</p>
          {connected ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Live chat
            </span>
          ) : (
            <span className="text-[10px] text-slate-400">Connecting...</span>
          )}
        </div>
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Message list */}
          <div
            className={`w-full lg:w-[340px] xl:w-[380px] shrink-0 border-r border-slate-200 flex flex-col min-h-0 overflow-hidden ${
              mobileShowDetail ? 'hidden lg:flex' : 'flex'
            }`}
          >
            <div className="p-3 border-b border-slate-100 space-y-3 bg-slate-50/80 shrink-0">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="search"
                  placeholder="Search name, email, subject..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-rw-blue-500/30 focus:border-rw-blue-400"
                />
              </div>
              <div className="flex gap-1 overflow-x-auto pb-0.5">
                {filterTabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFilter(tab.id)}
                    className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold transition ${
                      filter === tab.id
                        ? 'bg-rw-navy text-white'
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-rw-blue-200'
                    }`}
                  >
                    {tab.label}
                    {tab.count > 0 && (
                      <span className={`ml-1 ${filter === tab.id ? 'text-blue-100' : 'text-slate-400'}`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
              {loading ? (
                <div className="p-8 text-center text-slate-400 text-sm animate-pulse">Loading inbox...</div>
              ) : filtered.length === 0 ? (
                <div className="p-10 text-center">
                  <MailOpen size={40} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-500 text-sm">No messages match this filter.</p>
                </div>
              ) : (
                filtered.map((msg) => {
                  const isActive = selected?.id === msg.id;
                  const hasReplies = (msg._count?.replies || 0) > 0;
                  return (
                    <button
                      key={msg.id}
                      type="button"
                      onClick={() => selectMessage(msg)}
                      className={`w-full text-left px-3 py-3 border-b border-slate-100 transition flex gap-3 ${
                        isActive
                          ? 'bg-rw-blue-50 border-l-4 border-l-rw-navy'
                          : 'hover:bg-slate-50 border-l-4 border-l-transparent'
                      } ${!msg.read ? 'bg-amber-50/30' : ''}`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          !msg.read
                            ? 'bg-brand-red-100 text-brand-red-700'
                            : 'bg-rw-blue-100 text-rw-blue-700'
                        }`}
                      >
                        {initials(msg.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`text-sm truncate ${!msg.read ? 'font-bold text-rw-navy' : 'font-medium text-slate-700'}`}
                          >
                            {msg.name}
                          </span>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {relativeTime(msg.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {msg.subject || msg.message.slice(0, 60)}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          {!msg.read && (
                            <span className="text-[10px] font-bold uppercase text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                              New
                            </span>
                          )}
                          {hasReplies && (
                            <span className="text-[10px] font-bold uppercase text-green-700 bg-green-100 px-1.5 py-0.5 rounded inline-flex items-center gap-0.5">
                              <CheckCircle2 size={10} /> Replied
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Detail panel */}
          <div
            className={`flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden ${
              mobileShowDetail ? 'flex' : 'hidden lg:flex'
            }`}
          >
            {!selected ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50">
                <div className="w-16 h-16 rounded-2xl bg-rw-blue-100 flex items-center justify-center mb-4">
                  <Inbox size={32} className="text-rw-blue-600" />
                </div>
                <h3 className="font-bold text-rw-navy text-lg">Select a message</h3>
                <p className="text-slate-500 text-sm mt-2 max-w-xs">
                  Choose an inquiry from the inbox to read it and send a professional email reply.
                </p>
              </div>
            ) : (
              <>
                {/* Detail header */}
                <div className="px-4 py-3 border-b border-slate-100 bg-white shrink-0">
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => setMobileShowDetail(false)}
                      className="lg:hidden p-2 -ml-1 rounded-lg hover:bg-slate-100 text-slate-600"
                      aria-label="Back to list"
                    >
                      <ArrowLeft size={20} />
                    </button>
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                        !selected.read
                          ? 'bg-brand-red-100 text-brand-red-700'
                          : 'bg-rw-blue-100 text-rw-blue-700'
                      }`}
                    >
                      {initials(selected.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-rw-navy truncate">{selected.name}</h3>
                      <p className="text-sm text-rw-blue-600 truncate">{selected.email}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(selected.createdAt).toLocaleString('en-GB')}
                        </span>
                        <span className="font-mono text-slate-400">Ref: {shortRef(selected.id)}</span>
                        {selected.confirmationSentAt && (
                          <span className="inline-flex items-center gap-1 text-green-700">
                            <MailCheck size={12} /> Email confirmation
                          </span>
                        )}
                        {selected.confirmationSmsSentAt && (
                          <span className="inline-flex items-center gap-1 text-green-700">
                            <MessageSquare size={12} /> SMS confirmation
                          </span>
                        )}
                        {selected.confirmationWhatsappSentAt && (
                          <span className="inline-flex items-center gap-1 text-green-700">
                            <FaWhatsapp size={12} /> WhatsApp confirmation
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={toggleRead}
                        className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
                        title={selected.read ? 'Mark unread' : 'Mark read'}
                      >
                        {selected.read ? <MailOpen size={16} /> : <Mail size={16} />}
                      </button>
                      <button
                        type="button"
                        onClick={deleteMessage}
                        className="p-2 rounded-lg border border-red-200 hover:bg-red-50 text-red-600"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  {selected.subject && (
                    <p className="mt-3 text-sm font-semibold text-slate-700 pl-0 lg:pl-[60px]">
                      Subject: {selected.subject}
                    </p>
                  )}
                  {selected.phone && (
                    <p className="mt-1 text-sm text-slate-500 pl-0 lg:pl-[60px] inline-flex items-center gap-1">
                      <Phone size={14} />
                      <a href={`tel:${selected.phone}`} className="hover:text-rw-blue-600">
                        {selected.phone}
                      </a>
                    </p>
                  )}
                </div>

                {/* Conversation thread */}
                <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 space-y-4 bg-slate-50/40">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                      <User size={14} className="text-slate-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="bg-white rounded-xl rounded-tl-sm border border-slate-200 p-4 shadow-sm">
                        <p className="text-xs font-semibold text-slate-500 mb-2">
                          {selected.name} · Incoming message
                        </p>
                        <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">
                          {selected.message}
                        </p>
                      </div>
                    </div>
                  </div>

                  {selected.replies?.map((r) => {
                    const isUser = r.senderType === 'USER';
                    return (
                      <div
                        key={r.id}
                        className={`flex gap-3 ${isUser ? '' : 'flex-row-reverse'}`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            isUser ? 'bg-slate-200' : 'bg-rw-navy'
                          }`}
                        >
                          {isUser ? (
                            <User size={14} className="text-slate-600" />
                          ) : (
                            <Send size={14} className="text-white" />
                          )}
                        </div>
                        <div
                          className={`flex-1 min-w-0 flex flex-col ${
                            isUser ? '' : 'items-end'
                          }`}
                        >
                          <div
                            className={`rounded-xl p-4 shadow-sm max-w-[95%] ${
                              isUser
                                ? 'bg-white border border-slate-200 rounded-tl-sm text-slate-700'
                                : 'bg-rw-navy text-white rounded-tr-sm'
                            }`}
                          >
                            <p
                              className={`text-xs font-semibold mb-2 ${
                                isUser ? 'text-slate-500' : 'text-blue-100'
                              }`}
                            >
                              {isUser ? selected.name : r.adminName || 'School staff'} ·{' '}
                              {deliveryLabel(r)} ·{' '}
                              {new Date(r.sentAt).toLocaleString('en-GB')}
                            </p>
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{r.body}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Reply composer */}
                <div className="border-t border-slate-200 bg-white shrink-0">
                  {typingFrom && (
                    <p className="text-xs text-slate-500 px-4 pt-3 animate-pulse">
                      {typingFrom} is typing...
                    </p>
                  )}
                  <div className="p-4">
                  <Field label={`Reply to ${selected.name}`}>
                    <textarea
                      className={`${inputClass} resize-none`}
                      rows={4}
                      value={replyText}
                      onChange={(e) => {
                        setReplyText(e.target.value);
                        notifyTyping();
                      }}
                      placeholder="Write a warm, professional response. Choose how to deliver it below."
                    />
                  </Field>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => toggleChannel('email')}
                      disabled={!messagingStatus.email}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                        replyChannels.email
                          ? 'bg-rw-navy text-white border-rw-navy'
                          : 'bg-white text-slate-600 border-slate-200'
                      } disabled:opacity-40`}
                    >
                      <Mail size={13} /> Email
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleChannel('sms')}
                      disabled={!messagingStatus.sms || !selected.phone}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                        replyChannels.sms
                          ? 'bg-rw-blue-600 text-white border-rw-blue-600'
                          : 'bg-white text-slate-600 border-slate-200'
                      } disabled:opacity-40`}
                    >
                      <MessageSquare size={13} /> SMS
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleChannel('whatsapp')}
                      disabled={!messagingStatus.whatsapp || !selected.phone}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                        replyChannels.whatsapp
                          ? 'bg-green-600 text-white border-green-600'
                          : 'bg-white text-slate-600 border-slate-200'
                      } disabled:opacity-40`}
                    >
                      <FaWhatsapp size={13} /> WhatsApp
                    </button>
                  </div>

                  {replyError && <p className="text-red-600 text-sm mt-2">{replyError}</p>}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-3">
                    <p className="text-xs text-slate-400">
                      {selected.phone
                        ? `WhatsApp via ${messagingStatus.whatsappProvider || 'not configured'} · SMS via Twilio`
                        : 'Add a phone number on future messages to enable SMS/WhatsApp'}
                    </p>
                    <AdminButton
                      icon={Send}
                      onClick={sendReply}
                      disabled={replying || !replyText.trim()}
                      className="shrink-0"
                    >
                      {replying ? 'Sending...' : 'Send reply'}
                    </AdminButton>
                  </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </AdminCard>
    </div>
  );
}
