import type { ResearchRepository } from '../../infrastructure/mock-research-repository.ts'

export function getDashboard(repository: ResearchRepository) {
  return repository.getDashboard()
}
