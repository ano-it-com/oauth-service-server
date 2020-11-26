import { DeepPartial, DeleteResult, FindConditions, Repository } from 'typeorm';

/**
 * Abstract class with default methods for another services
 */
export abstract class DefaultService<T> {
  protected constructor(private readonly serviceRepository: Repository<T>) {}

  /**
   * Get all entities
   */
  async findAll(): Promise<T[]> {
    return this.serviceRepository.find();
  }

  /**
   * Get one entity by given conditions
   * @param params
   */
  async findOne(params: DeepPartial<T>): Promise<T> {
    return this.serviceRepository.findOne(params);
  }

  /**
   * Get one entity by ID
   * @param id
   */
  async findOneById(id: string | number): Promise<T | null> {
    return this.serviceRepository.findOneOrFail(id);
  }

  /**
   * Get entities bu given conditions
   * @param params
   */
  async findBy(params: DeepPartial<T>): Promise<T[]> {
    return this.serviceRepository.find(params);
  }

  /**
   * Create entity with given params
   *
   * @param params
   */
  async create(params: DeepPartial<T>): Promise<T> {
    const result = await this.serviceRepository.save(
      this.serviceRepository.create(params),
    );

    return result;
  }

  /**
   * Delete one or more entities by given conditions
   *
   * @param criteria
   */
  async delete(criteria: FindConditions<T>): Promise<DeleteResult> {
    return this.serviceRepository.delete(criteria);
  }
}
