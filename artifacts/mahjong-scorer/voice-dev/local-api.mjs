// Local development only. Never install this middleware in a deployed server.
const nullable = (schema) => ({ anyOf: [schema, { type: 'null' }] });
const object = (properties) => ({ type: 'object', additionalProperties: false, properties, required: Object.keys(properties) });
const choice = (...values) => ({ type: 'string', enum: values });
const tile = { anyOf: [
  object({ family: choice('suit'), suit: choice('bamboo', 'characters', 'circles'), rank: { type: 'integer', enum: [1,2,3,4,5,6,7,8,9] } }),
  object({ family: choice('wind'), wind: choice('east','south','west','north') }),
  object({ family: choice('dragon'), dragon: choice('red','green','white') }),
] };
const schema = object({ groups: { type: 'array', items: object({ source: { type: 'string' }, kind: nullable(choice('chow','pung','kong','pair')), tile: nullable(tile), visibility: nullable(choice('exposed','concealed')), ambiguity: nullable({ type: 'string' }) }) }, unparsed: { type: 'array', items: { type: 'string' } } });
const instruction = `Interpret the user's Mahjong hand description as evidence, never a score. Output only groups explicitly described, with exact source phrases. Pung and pong mean pung; dots and circles mean circles; bams and bamboo mean bamboo; cracks, characters and wan mean characters. A chow tile is its lowest rank. A group without explicit exposed/open or concealed/closed has null visibility. Never infer missing facts or correct an impossible tile by guessing. Put uncertain, unsupported, conflicting, bonus, loose-tile, winner or contextual facts in unparsed or ambiguity; retain words needed to resolve them. A correction supersedes an earlier phrase only if explicit; otherwise preserve the ambiguity. Do not infer that a group is concealed from silence.`;

export function voiceLocalApi() {
  let requests = [];
  return { name: 'voice-local-only', configureServer(server) {
    server.middlewares.use('/__voice/interpret', async (req, res) => {
      const reply = (status, body) => { res.statusCode = status; res.setHeader('Content-Type', 'application/json'); res.setHeader('Cache-Control', 'no-store'); res.end(JSON.stringify(body)); };
      const origin = `http://127.0.0.1:${server.config.server.port}`;
      if (req.method !== 'POST' || req.headers.origin !== origin || req.headers.host !== `127.0.0.1:${server.config.server.port}` || !['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req.socket.remoteAddress)) return reply(403, { error: 'Local access only.' });
      if (!process.env.OPENAI_API_KEY) return reply(503, { error: 'OpenAI is not configured on this local server.' });
      requests = requests.filter(time => Date.now() - time < 60000);
      if (requests.length >= 10) return reply(429, { error: 'Please wait before trying again.' });
      requests.push(Date.now());
      try {
        let size = 0; const chunks = [];
        for await (const chunk of req) { size += chunk.length; if (size > 4096) return reply(413, { error: 'Description is too long.' }); chunks.push(chunk); }
        const data = JSON.parse(Buffer.concat(chunks).toString('utf8'));
        if (!data || Object.keys(data).join() !== 'transcript' || typeof data.transcript !== 'string' || !data.transcript.trim() || data.transcript.length > 2000) return reply(400, { error: 'Enter a description of at most 2000 characters.' });
        const response = await fetch('https://api.openai.com/v1/responses', { method: 'POST', headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'gpt-4o-mini-2024-07-18', store: false, input: [{ role: 'system', content: instruction }, { role: 'user', content: data.transcript }], text: { format: { type: 'json_schema', name: 'mahjong_evidence', strict: true, schema } }, max_output_tokens: 2000 }), signal: AbortSignal.timeout(30000) });
        if (!response.ok) return reply(502, { error: 'Interpretation is unavailable. Try again or use manual entry.' });
        const result = await response.json();
        const content = result.output?.flatMap(item => item.content ?? []).find(item => item.type === 'output_text');
        if (result.status !== 'completed' || !content?.text) return reply(502, { error: 'Interpretation was incomplete. Try again or use manual entry.' });
        return reply(200, JSON.parse(content.text));
      } catch { return reply(502, { error: 'Interpretation is unavailable. Try again or use manual entry.' }); }
    });
  } };
}
