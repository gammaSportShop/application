const API_BASE = '/api'

function getAuthHeaders(): Record<string, string> {
    try {
        const token = localStorage.getItem('auth_token')
        if (token) return { Authorization: `Bearer ${token}` }
        return {}
    } catch {
        return {}
    }
}

export async function apiGet<T>(path: string): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, { credentials: 'include', headers: { ...getAuthHeaders() } })
	if (!res.ok) throw new Error('request_failed')
	return res.json()
}

export async function apiPost<T>(path: string, body: any): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
		method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
		body: JSON.stringify(body),
		credentials: 'include'
	})
	if (!res.ok) throw new Error('request_failed')
	return res.json()
}

export async function apiPatch<T>(path: string, body: any): Promise<T> {
	const res = await fetch(`${API_BASE}${path}`, {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
		body: JSON.stringify(body),
		credentials: 'include'
	})
	if (!res.ok) throw new Error('request_failed')
	return res.json()
}