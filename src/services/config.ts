// src/config.ts

export interface AppConfig {
  api: {
    baseUrl: string;
    timeout: number;
  };
  app: {
    name: string;
    version: string;
  };
  upload: {
    maxFileSizeMB: number;
    acceptedFormats: string[];
  };
}

let config: AppConfig | null = null;

/**
 * Configuración de respaldo.
 * ⚠️ NO define baseUrl para evitar URLs quemadas.
 */
const fallbackConfig: AppConfig = {
  api: {
    baseUrl: '',
    timeout: 30000,
  },
  app: {
    name: 'Data Anonymization System',
    version: '1.0.0',
  },
  upload: {
    maxFileSizeMB: 50,
    acceptedFormats: ['.csv', '.xlsx', '.xls'],
  },
};

/**
 * Carga dinámica del archivo /config.json.
 * Es la ÚNICA fuente de verdad para endpoints.
 */
export async function loadConfig(): Promise<AppConfig> {
  if (config) return config;

  try {
    const response = await fetch('/config.json', { cache: 'no-store' });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const loadedConfig: AppConfig = await response.json();

    if (!loadedConfig?.api?.baseUrl) {
      throw new Error('api.baseUrl missing in config.json');
    }

    config = loadedConfig;
    return config;

  } catch (error) {
    console.error(
      '❌ Failed to load config.json. Backend URL is undefined.',
      error
    );

    config = fallbackConfig;
    return config;
  }
}

/**
 * Devuelve la configuración actual.
 * Nunca inventa valores.
 */
export function getConfig(): AppConfig {
  return config ?? fallbackConfig;
}

/**
 * Alias histórico / compatibilidad.
 * Devuelve la URL base del backend.
 */
export function getApiUrl(): string {
  return getConfig().api.baseUrl;
}

/**
 * Alias explícito (más semántico).
 * Recomendado para nuevos usos.
 */
export function getApiBaseUrl(): string {
  return getConfig().api.baseUrl;
}