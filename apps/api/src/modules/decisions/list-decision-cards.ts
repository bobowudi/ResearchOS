import type { ResearchRepository } from '../../infrastructure/mock-research-repository.ts'

export function listDecisionCards(repository: ResearchRepository) {
  return { items: repository.listDecisionCards() }
}
