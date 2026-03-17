export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const key = process.env.GEMINI_API_KEY;
  const { messages, system } = req.body;

  const contents = [];
  if (system) {
    contents.push({ role: 'user', parts: [{ text: 'System: ' + system }] });
    contents.push({ role: 'model', parts: [{ text: 'Understood.' }] });
  }
  for (const m of messages) {
    contents.push({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    });
  }

  try {
    const r = await fetch(
'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + key,      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents, generationConfig: { maxOutputTokens: 800 } })
      }
    );
    const d = await r.json();
    console.log('Gemini response:', JSON.stringify(d).slice(0, 300));
    const text = d?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      console.log('Full error:', JSON.stringify(d));
      return res.status(200).json({ content: [{ type: 'text', text: 'Error: ' + JSON.stringify(d?.error || d?.candidates?.[0]?.finishReason || 'unknown') }] });
    }
    return res.status(200).json({ content: [{ type: 'text', text }] });
  } catch (e) {
    console.log('Catch error:', e.message);
    return res.status(200).json({ content: [{ type: 'text', text: 'Error: ' + e.message }] });
  }
}
