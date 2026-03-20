import { mockResearchRepository } from '../../../src/infrastructure/mock-research-repository.ts'
import { listActionItems } from '../../../src/modules/actions/service'
import { jsonResponse } from '../../../src/shared/http.ts'

export async function GET() {
  return jsonResponse(listActionItems(mockResearchRepository))
}
