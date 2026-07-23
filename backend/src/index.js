require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initSocket } = require('./lib/chatSocket');

const authRoutes = require('./routes/auth');
const settingsRoutes = require('./routes/settings');
const pagesRoutes = require('./routes/pages');
const postsRoutes = require('./routes/posts');
const eventsRoutes = require('./routes/events');
const staffRoutes = require('./routes/staff');
const galleryRoutes = require('./routes/gallery');
const uploadRoutes = require('./routes/upload');
const admissionsRoutes = require('./routes/admissions');
const applicationsRoutes = require('./routes/applications');
const contactRoutes = require('./routes/contact');
const portalRoutes = require('./routes/portal');

const app = express();
const PORT = process.env.PORT || 5001;

const CLIENT_URLS = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || CLIENT_URLS.includes(origin) || CLIENT_URLS.includes('*')) {
        return callback(null, true);
      }
      return callback(null, CLIENT_URLS[0] || true);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  setHeaders(res) {
    // Allow <img> / video from the Vercel frontend origin
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  },
}));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'School CMS API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/pages', pagesRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admissions', admissionsRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/portal', portalRoutes);
app.use('/uploads/applications', express.static(path.join(__dirname, '../uploads/applications'), {
  setHeaders(res) {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  },
}));

app.use((err, _req, res, _next) => {
  console.error(err);
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      error:
        'Request too large. Upload images using the Upload button instead of pasting them directly.',
    });
  }
  res.status(500).json({ error: err.message || 'Internal server error' });
});

const server = http.createServer(app);
initSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
