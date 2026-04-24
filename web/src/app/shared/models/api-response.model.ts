export interface ApiError {
  title: string;
  detail?: string;
  errors?: Record<string, string[]>;
}
