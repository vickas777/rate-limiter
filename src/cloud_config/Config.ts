export interface ConfigDAO {
  getUrlWage(url: string): number
}

export type Config = {
  url: string
  wage: number
};
