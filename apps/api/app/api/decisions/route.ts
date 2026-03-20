import { mockResearchRepository } from '../../../src/infrastructure/mock-research-repository.ts'
import { listDecisionCards } from '../../../src/modules/decisions/service'
import { jsonResponse } from '../../../src/shared/http.ts'

export async function GET() {
  return jsonResponse(listDecisionCards(mockResearchRepository))
}
