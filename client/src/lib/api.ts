/**
 * API-Hilfsfunktionen für Frontend-Anfragen
 */

// API-Antworttypen
export type ApiErrorResponse = {
  ok: false;
  status: number;
  message: string;
};

export type ApiSuccessResponse<T = any> = {
  ok: true;
  data: T;
};

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

// Funktion für alle API-Anfragen
export async function apiRequest<T = any>(
  url: string,
  method: string = 'GET',
  body?: any,
  headers: HeadersInit = {}
): Promise<ApiResponse<T>> {
  const options: RequestInit = {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    console.log(`API-Anfrage: ${method} ${url}`);
    const response = await fetch(url, options);
    console.log(`API-Antwort: ${response.status}`);

    if (!response.ok) {
      if (response.status === 401) {
        return { ok: false, status: 401, message: 'Nicht authentifiziert' };
      }

      let errorText = '';
      try {
        errorText = await response.text();
      } catch (e) {
        errorText = 'Unbekannter Fehler';
      }

      return {
        ok: false,
        status: response.status,
        message: errorText
      };
    }

    // Prüfen, ob die Antwort JSON ist
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return { ok: true, data };
    }

    const text = await response.text();
    return { ok: true, data: text as unknown as T };
  } catch (error) {
    console.error('API-Anfragefehler:', error);
    return {
      ok: false,
      status: 0,
      message: error instanceof Error ? error.message : 'Netzwerkfehler'
    };
  }
}

// Wrapper-Funktionen für verschiedene HTTP-Methoden
export const api = {
  get: <T = any>(url: string, headers?: HeadersInit) => 
    apiRequest<T>(url, 'GET', undefined, headers),
  post: <T = any>(url: string, body: any, headers?: HeadersInit) => 
    apiRequest<T>(url, 'POST', body, headers),
  put: <T = any>(url: string, body: any, headers?: HeadersInit) => 
    apiRequest<T>(url, 'PUT', body, headers),
  delete: <T = any>(url: string, headers?: HeadersInit) => 
    apiRequest<T>(url, 'DELETE', undefined, headers)
};