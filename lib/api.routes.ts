import { getAPIBaseURL } from '@/utils/baseUrl'

const API_POS_URL = getAPIBaseURL()

export const apiRoutes = {
    login: `${API_POS_URL}/auth/login`,
}
