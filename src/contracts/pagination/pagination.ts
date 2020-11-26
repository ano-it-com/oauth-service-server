import { PaginationResultInterface } from './pagination.results.interface';

interface PaginationMeta {
  pageTotal: number;
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
}

export class Pagination<PaginationEntity> {
  public results: PaginationEntity[];
  public paginationMeta: PaginationMeta;

  constructor(paginationResults: PaginationResultInterface<PaginationEntity>) {
    this.results = paginationResults.results;
    this.paginationMeta = {
      pageTotal: paginationResults.results.length,
      currentPage: Number(paginationResults.currentPage),
      lastPage:
        Math.round(paginationResults.total / paginationResults.perPage) || 1,
      perPage: paginationResults.perPage,
      total: paginationResults.total,
    };
  }
}
