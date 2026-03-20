import type { ResearchRepository } from '../../infrastructure/mock-research-repository.ts'

export function getDashboardPayload(repository: ResearchRepository) {
  return repository.getDashboard()
}
