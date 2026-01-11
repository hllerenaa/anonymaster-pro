interface AppConfig {
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

const defaultConfig: AppConfig = {
  api: {
    baseUrl: 'http://localhost:8000',
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

export async function loadConfig(): Promise<AppConfig> {
  if (config) {
    return config;
  }

  try {
    const response = await fetch('/config.json');
    if (response.ok) {
      config = await response.json();
      return config;
    }
  } catch (error) {
    console.warn('Failed to load config.json, using default configuration:', error);
  }

  config = defaultConfig;
  return config;
}

export function getConfig(): AppConfig {
  if (!config) {
    return defaultConfig;
  }
  return config;
}

export function getApiUrl(): string {
  return getConfig().api.baseUrl;
}
