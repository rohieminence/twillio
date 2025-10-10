import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import phoneRoutes from './routes/phoneRoutes.js';



dotenv.config();

console.log(process.env.TWILIO_ACCOUNT_SID);
console.log(process.env.TWILIO_AUTH_TOKEN);
console.log(process.env.TWILIO_PHONE_NUMBER); 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 4000;

app.use(cors({ origin: ["http://localhost:3000", "http://localhost:3001"], credentials: false }));
app.use(bodyParser.json({ limit: '5mb' }));

const dataDir = path.join(__dirname, '..', 'data');
const templatesFilePath = path.join(dataDir, 'templates.json');

function ensureStorage() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(templatesFilePath)) {
    fs.writeFileSync(templatesFilePath, JSON.stringify({ templates: [] }, null, 2));
  }
}

function readTemplates() {
  ensureStorage();
  const raw = fs.readFileSync(templatesFilePath, 'utf8');
  try {
    const json = JSON.parse(raw || '{"templates": []}');
    return Array.isArray(json.templates) ? json.templates : [];
  } catch (e) {
    return [];
  }
}

function writeTemplates(templates) {
  ensureStorage();
  fs.writeFileSync(templatesFilePath, JSON.stringify({ templates }, null, 2));
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

// Twilio phone routes
app.use('/api/phone', phoneRoutes);

// List templates
app.get('/api/templates', (_req, res) => {
  const templates = readTemplates();
  res.json({ templates });
});

// Get single template
app.get('/api/templates/:id', (req, res) => {
  const templates = readTemplates();
  const found = templates.find(t => t.id === req.params.id);
  if (!found) return res.status(404).json({ error: 'Not found' });
  res.json(found);
});

// Create or update template
app.post('/api/templates', (req, res) => {
  const { id, name, html, css, components, styles, metadata } = req.body || {};
  if (!html && !components) {
    return res.status(400).json({ error: 'Provide at least html or components' });
  }
  const templates = readTemplates();
  const now = new Date().toISOString();
  if (id) {
    const idx = templates.findIndex(t => t.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    const updated = { ...templates[idx], name, html, css, components, styles, metadata, updatedAt: now };
    templates[idx] = updated;
    writeTemplates(templates);
    return res.json(updated);
  }
  const newTemplate = { id: uuidv4(), name: name || 'Untitled', html: html || '', css: css || '', components, styles, metadata, createdAt: now, updatedAt: now };
  templates.unshift(newTemplate);
  writeTemplates(templates);
  res.status(201).json(newTemplate);
});

// Render HTML with placeholders replacement
// Placeholders like {{firstName}} will be replaced by provided data map
app.post('/api/render', (req, res) => {
  const { html, css, data } = req.body || {};
  if (!html) return res.status(400).json({ error: 'html is required' });
  const mergedCss = css ? `<style>${css}</style>` : '';
  const renderedHtml = replacePlaceholders(html, data || {});
  res.json({ html: `${mergedCss}${renderedHtml}` });
});

function replacePlaceholders(sourceHtml, data) {
  let output = String(sourceHtml);
  // Replace {{key}} with data[key]; if value is object/array, JSON stringify
  output = output.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (_m, key) => {
    const value = key.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), data);
    if (value === undefined || value === null) return '';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  });
  return output;
}

app.listen(port, () => {
  ensureStorage();
  // eslint-disable-next-line no-console
  console.log(`Email template server listening on http://localhost:${port}`);
});



