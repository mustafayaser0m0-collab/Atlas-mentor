export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { messages, system } = req.body;
    const contents = [];
    if (system) {
      contents.push({ role: 'user', parts: [{ text: system }] });
      contents.push({ role: 'model', parts: [{ text: 'OK' }] });
    }
    for (const m of messages) {
      contents.push({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] });
    }
    const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=' + process.env.GEMINI_API_KEY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents })
    });
    const d = await r.json();
    const text = d?.candidates?.[0]?.content?.parts?.[0]?.text || JSON.stringify(d?.error || 'no response');
    return res.status(200).json({ content: [{ type: 'text', text }] });
  } catch (e) {
    return res.status(200).json({ content: [{ type: 'text', text: 'Error: ' + e.message }] });
  }
}
