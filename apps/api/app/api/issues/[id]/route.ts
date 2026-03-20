import { mockResearchRepository } from '../../../../src/infrastructure/mock-research-repository.ts'
import { getIssueDetail } from '../../../../src/modules/issues/detail-service'
import { jsonResponse, notFoundResponse } from '../../../../src/shared/http.ts'

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(_: Request, { params }: Params) {
  const { id } = await params
  const issueDetail = getIssueDetail(mockResearchRepository, id)

  if (!issueDetail) {
    return notFoundResponse('Issue not found')
  }

  return jsonResponse(issueDetail)
}
