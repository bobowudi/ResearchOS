import type { ResearchRepository } from '../../infrastructure/mock-research-repository.ts'

export function listIssues(repository: ResearchRepository) {
  return { items: repository.listIssues() }
}
