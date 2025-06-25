export type DataSource = 'mock' | 'user';

export interface DataSourceConfig {
  source: DataSource;
  enableLocalStorage: boolean;
}

// Auto-switch based on environment
const isProduction = import.meta.env.PROD;

export const dataSourceConfig: DataSourceConfig = {
  source: isProduction ? 'user' : 'mock',
  enableLocalStorage: isProduction
};

export function setDataSource(source: DataSource) {
  dataSourceConfig.source = source;
  dataSourceConfig.enableLocalStorage = source === 'user';
  console.log(`📡 Data source switched to: ${source}`);
}