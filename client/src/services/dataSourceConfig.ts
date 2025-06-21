
export type DataSource = 'mock' | 'user';

export interface DataSourceConfig {
  source: DataSource;
  enableLocalStorage: boolean;
}

export const dataSourceConfig: DataSourceConfig = {
  source: 'mock', // Changed to user data
  enableLocalStorage: false // Enable localStorage persistence
};

export function setDataSource(source: DataSource) {
  dataSourceConfig.source = source;
  dataSourceConfig.enableLocalStorage = source === 'user';
  console.log(`📡 Data source switched to: ${source}`);
}
