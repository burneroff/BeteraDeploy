import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('http://localhost:8082/api/documents', () => {
    return HttpResponse.json([
      {
        id: 1,
        title: 'Документ 1',
        pdf_path: '/dummy.pdf',
        category_id: 1,
        role_id: 1,
        created_at: new Date().toISOString(),
        first_name: 'Иван',
        last_name: 'Иванов',
        photo_path: '/photo.png',
        accessible_roles: [1, 3],
      },
    ]);
  }),

  http.get('http://localhost:8082/api/documents/:id', ({ params }) => {
    const { id } = params;
    return HttpResponse.json({
      id: Number(id),
      title: `Документ ${id}`,
      pdf_path: '/dummy.pdf',
      category_id: 1,
      role_id: 1,
      created_at: new Date().toISOString(),
      first_name: 'Иван',
      last_name: 'Иванов',
      photo_path: '/photo.png',
      accessible_roles: [1, 3],
    });
  }),
];
