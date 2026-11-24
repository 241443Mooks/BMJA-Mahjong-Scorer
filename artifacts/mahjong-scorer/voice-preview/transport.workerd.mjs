import { readOpenAIInterpretation, requestOpenAIInterpretation } from './openai.mjs';

const testKey = 'fixture-key';
const returningEvidence = 'Return fixture evidence';
const returningRedirect = 'Return a redirect';
const proposal = { groups: [], unparsed: [] };

export const mockOpenAI = {
  async fetch(request) {
    if (request.url !== 'https://api.openai.com/v1/responses' || request.method !== 'POST') {
      throw new Error('Unexpected outbound request or followed redirect.');
    }
    const { input, store } = await request.json();
    if (request.headers.get('Authorization') !== `Bearer ${testKey}` || store !== false) {
      throw new Error('The expected request settings did not reach the mocked upstream.');
    }
    if (input[1].content === returningRedirect) {
      return new Response(null, { status: 303, headers: { Location: 'https://redirect.invalid/' } });
    }
    if (input[1].content !== returningEvidence) throw new Error('Unexpected test input.');
    return Response.json({
      status: 'completed',
      output: [{ content: [{ type: 'output_text', text: JSON.stringify(proposal) }] }],
    });
  },
};

export default {
  async test() {
    const success = await requestOpenAIInterpretation(returningEvidence, testKey);
    const result = await readOpenAIInterpretation(success);
    if (success.status !== 200 || result.outcome !== 'completed' || JSON.stringify(result.proposal) !== JSON.stringify(proposal)) {
      throw new Error('Expected a successful response from the mocked upstream.');
    }

    const redirect = await requestOpenAIInterpretation(returningRedirect, testKey);
    if (redirect.status !== 303 || redirect.redirected) {
      throw new Error('Expected the upstream redirect without a follow-up request.');
    }
    const failure = await readOpenAIInterpretation(redirect);
    if (failure.outcome !== 'provider-http' || failure.proposal !== undefined) {
      throw new Error('Expected a redirect to be treated as an unsuccessful provider response.');
    }
  },
};
