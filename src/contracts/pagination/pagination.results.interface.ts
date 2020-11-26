export interface PaginationResultInterface<PaginationEntity> {
  results: PaginationEntity[];
  total: number;
  currentPage: number;
  perPage: number;
  next?: string;
  previous?: string;
}
