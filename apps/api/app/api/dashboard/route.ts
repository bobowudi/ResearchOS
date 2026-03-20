import { mockResearchRepository } from '../../../src/infrastructure/mock-research-repository.ts'
import { getDashboardPayload } from '../../../src/modules/dashboard/service'
import { jsonResponse } from '../../../src/shared/http.ts'

export async function GET() {
  return jsonResponse(getDashboardPayload(mockResearchRepository))
}
