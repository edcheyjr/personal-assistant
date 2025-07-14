import { routes } from '@/lib/routes'

// TODO, check permissions before determining the route
export function GET(request: Request) {
    return Response.redirect(new URL(routes.personalAssistants, request.url))
}
