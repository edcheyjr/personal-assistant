import { routes } from '@/lib/routes'

export function GET(request: Request) {
    const baseUrl = new URL(request.url).origin // Get the current origin (e.g., "https://example.com")
    console.log('baseUrl', baseUrl)
    const redirectUrl = `${baseUrl}${routes.personalAssistants}` // Construct full URL
    return Response.redirect(redirectUrl, 302) // 302 (temporary) or 301 (permanent)
}
