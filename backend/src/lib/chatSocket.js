const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io = null;

function initSocket(httpServer) {
  const clientOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  io = new Server(httpServer, {
    cors: {
      origin: clientOrigins.includes('*') ? true : clientOrigins,
      credentials: true,
    },
    path: '/socket.io',
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    const type = socket.handshake.auth?.type;

    if (!token || !type) {
      return next(new Error('Authentication required'));
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);

      if (type === 'portal') {
        if (payload.role !== 'PORTAL') {
          return next(new Error('Invalid portal session'));
        }
      } else if (type === 'admin') {
        if (payload.role === 'PORTAL') {
          return next(new Error('Invalid admin session'));
        }
      } else {
        return next(new Error('Invalid connection type'));
      }

      socket.user = payload;
      socket.authType = type;
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    if (socket.authType === 'admin') {
      socket.join('admin:inbox');
    } else if (socket.authType === 'portal') {
      socket.join(`portal:${socket.user.id}`);
    }

    socket.on('join:conversation', (conversationId) => {
      if (conversationId) socket.join(`conversation:${conversationId}`);
    });

    socket.on('leave:conversation', (conversationId) => {
      if (conversationId) socket.leave(`conversation:${conversationId}`);
    });

    socket.on('chat:typing', ({ conversationId, typing }) => {
      if (!conversationId) return;
      socket.to(`conversation:${conversationId}`).emit('chat:typing', {
        conversationId,
        typing: Boolean(typing),
        from: socket.authType,
        name: socket.user.name || 'Someone',
      });
    });
  });

  return io;
}

function emitChatReply({ conversationId, reply, portalUserId }) {
  if (!io) return;

  const payload = { conversationId, reply };

  io.to(`conversation:${conversationId}`).emit('chat:reply', payload);
  io.to('admin:inbox').emit('chat:reply', payload);

  if (portalUserId) {
    io.to(`portal:${portalUserId}`).emit('chat:reply', payload);
  }
}

function emitNewConversation({ conversation }) {
  if (!io) return;

  io.to('admin:inbox').emit('chat:conversation', { conversation });

  if (conversation.portalUserId) {
    io.to(`portal:${conversation.portalUserId}`).emit('chat:conversation', {
      conversation,
    });
  }
}

function emitConversationUpdate({ conversationId, updates, portalUserId }) {
  if (!io) return;

  const payload = { conversationId, updates };

  io.to(`conversation:${conversationId}`).emit('chat:conversation:update', payload);
  io.to('admin:inbox').emit('chat:conversation:update', payload);

  if (portalUserId) {
    io.to(`portal:${portalUserId}`).emit('chat:conversation:update', payload);
  }
}

module.exports = {
  initSocket,
  emitChatReply,
  emitNewConversation,
  emitConversationUpdate,
};
