import { mockResearchRepository } from '../../../src/infrastructure/mock-research-repository.ts'
import { listIssues } from '../../../src/modules/issues/service'
import { jsonResponse } from '../../../src/shared/http.ts'

export async function GET() {
  return jsonResponse(listIssues(mockResearchRepository))
}
