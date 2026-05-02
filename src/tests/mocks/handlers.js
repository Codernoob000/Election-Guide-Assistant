import { http, HttpResponse } from 'msw';

export const handlers = [
  http.post('https://generativelanguage.googleapis.com/*', () => {
    return HttpResponse.json({
      candidates: [{ content: { parts: [{ text: 'You can register to vote at vote.gov' }] } }]
    });
  }),
  http.post('https://translation.googleapis.com/*', () => {
    return HttpResponse.json({
      data: { translations: [{ translatedText: 'Puedes registrarte en vote.gov' }] }
    });
  })
];
