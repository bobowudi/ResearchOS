import { NextResponse } from 'next/server'

export function jsonResponse<T>(payload: T, init?: ResponseInit) {
  return NextResponse.json(payload, init)
}

export function notFoundResponse(message: string) {
  return jsonResponse({ message }, { status: 404 })
}
