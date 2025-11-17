
export function unwrapSuccess<T>(res: any): T {

  const payload = res?.data ?? res;

  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}
