import { mockResearchRepository } from '../../../src/infrastructure/mock-research-repository.ts'
import { listEvidence } from '../../../src/modules/evidence/service'
import { jsonResponse } from '../../../src/shared/http.ts'

export async function GET() {
  return jsonResponse(listEvidence(mockResearchRepository))
}
