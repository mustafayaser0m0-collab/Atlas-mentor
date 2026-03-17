export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { messages, system } = req.body;
    const r = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.DEEPSEEK_API_KEY
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        max_tokens: 1000,
        messages: [
          { role: 'system', content: system || 'You are a helpful assistant.' },
          ...messages
        ]
      })
    });
    const d = await r.json();
    const text = d?.choices?.[0]?.message?.content || JSON.stringify(d?.error || 'no response');
    return res.status(200).json({ content: [{ type: 'text', text }] });
  } catch (e) {
    return res.status(200).json({ content: [{ type: 'text', text: 'Error: ' + e.message }] });
  }
}
