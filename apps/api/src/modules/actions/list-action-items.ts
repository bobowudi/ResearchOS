import type { ResearchRepository } from '../../infrastructure/mock-research-repository.ts'

export function listActionItems(repository: ResearchRepository) {
  return { items: repository.listActionItems() }
}
