import type { ResearchRepository } from '../../infrastructure/mock-research-repository.ts'

export function listEvidence(repository: ResearchRepository) {
  return { items: repository.listEvidence() }
}
