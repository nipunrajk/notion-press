export interface Book {
  Title: string;
  Author: string;
  Genre: string;
  PublishedYear: number | string;
  ISBN: string;
}

export type SortColumn = keyof Book | null;

export interface SortConfig {
  column: SortColumn;
  direction: 'asc' | 'desc';
}
