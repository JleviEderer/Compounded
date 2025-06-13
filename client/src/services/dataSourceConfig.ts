
export type DataSource = 'mock' | 'user';

export interface DataSourceConfig {
  source: DataSource;
  enableLocalStorage: boolean;
}

export const dataSourceConfig: DataSourceConfig = {
  source: 'mock', // Change this to 'user' to switch
  enableLocalStorage: false // Change to true for user data persistence
};

export function setDataSource(source: DataSource) {
  dataSourceConfig.source = source;
  dataSourceConfig.enableLocalStorage = source === 'user';
  console.log(`📡 Data source switched to: ${source}`);
}
