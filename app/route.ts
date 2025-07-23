import { routes } from '@/lib/routes'
import { permanentRedirect } from 'next/navigation'

export function GET(request: Request) {
    return permanentRedirect(routes.personalAssistants)
}
