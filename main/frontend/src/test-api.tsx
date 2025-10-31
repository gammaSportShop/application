import { useState } from 'react'

interface TestResult {
  endpoint: string
  method: string
  status: 'PASS' | 'FAIL' | 'SKIP'
  statusCode?: number
  response?: any
  error?: string
  duration?: number
}

const API_BASE = '/api'

export default function ApiTester() {
  const [results, setResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [authToken, setAuthToken] = useState<string | null>(null)
  const [cartId, setCartId] = useState<string | null>(null)
  const [testProduct, setTestProduct] = useState<any>(null)

  const makeRequest = async (endpoint: string, options: RequestInit = {}): Promise<TestResult> => {
    const start = Date.now()
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
          ...options.headers
        }
      })
      const duration = Date.now() - start
      const data = await response.json().catch(() => null)
      
      return {
        endpoint,
        method: options.method || 'GET',
        status: response.ok ? 'PASS' : 'FAIL',
        statusCode: response.status,
        response: data,
        duration
      }
    } catch (error) {
      return {
        endpoint,
        method: options.method || 'GET',
        status: 'FAIL',
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - start
      }
    }
  }

  const runAllTests = async () => {
    setIsRunning(true)
    setResults([])
    const newResults: TestResult[] = []

    const addResult = (result: TestResult) => {
      newResults.push(result)
      setResults([...newResults])
    }

    console.log('🧪 Starting API Tests...')

    // 1. Auth Tests
    console.log('🔐 Testing Auth endpoints...')
    
    addResult(await makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      })
    }))

    addResult(await makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    }))

    // Store auth token for protected routes
    const loginResult = await makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    })
    if (loginResult.status === 'PASS' && loginResult.response?.token) {
      setAuthToken(loginResult.response.token)
    }

    // 2. Catalog Tests
    console.log('📦 Testing Catalog endpoints...')
    
    addResult(await makeRequest('/catalog/categories'))
    addResult(await makeRequest('/catalog/meta'))
    addResult(await makeRequest('/catalog/products'))
    addResult(await makeRequest('/catalog/products?page=1&pageSize=5'))
    addResult(await makeRequest('/catalog/products?q=test'))
    addResult(await makeRequest('/catalog/products?priceMin=10&priceMax=100'))
    addResult(await makeRequest('/catalog/products?sort=price_asc'))
    addResult(await makeRequest('/catalog/collections'))

    // Get a product for further tests
    const productsResult = await makeRequest('/catalog/products?pageSize=1')
    if (productsResult.status === 'PASS' && productsResult.response?.items?.[0]) {
      const product = productsResult.response.items[0]
      setTestProduct(product)
      addResult(await makeRequest(`/catalog/products/${product.slug}`))
    }

    // 3. Cart Tests
    console.log('🛒 Testing Cart endpoints...')
    
    const cartInitResult = await makeRequest('/cart/init', { method: 'POST' })
    addResult(cartInitResult)
    
    if (cartInitResult.status === 'PASS' && cartInitResult.response?.cartId) {
      const cartId = cartInitResult.response.cartId
      setCartId(cartId)
      
      addResult(await makeRequest(`/cart/${cartId}`))
      
      if (testProduct) {
        addResult(await makeRequest(`/cart/${cartId}/items`, {
          method: 'POST',
          body: JSON.stringify({
            productId: testProduct.id,
            quantity: 2
          })
        }))
        
        addResult(await makeRequest(`/cart/${cartId}`))
        
        addResult(await makeRequest(`/cart/${cartId}/items`, {
          method: 'PATCH',
          body: JSON.stringify({
            productId: testProduct.id,
            quantity: 1
          })
        }))
        
        addResult(await makeRequest(`/cart/${cartId}`))
      }
    }

    // 4. Orders Tests (require auth)
    console.log('📋 Testing Orders endpoints...')
    
    if (authToken && cartId && testProduct) {
      // First add item to cart and checkout
      await makeRequest(`/cart/${cartId}/items`, {
        method: 'POST',
        body: JSON.stringify({
          productId: testProduct.id,
          quantity: 1
        })
      })
      
      const checkoutResult = await makeRequest(`/cart/${cartId}/checkout`, { method: 'POST' })
      addResult(checkoutResult)
      
      if (checkoutResult.status === 'PASS' && checkoutResult.response?.order) {
        const orderId = checkoutResult.response.order.id
        
        addResult(await makeRequest('/orders'))
        addResult(await makeRequest(`/orders/${orderId}`))
        addResult(await makeRequest(`/orders/${orderId}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status: 'PAID' })
        }))
      }
    } else {
      addResult({
        endpoint: '/orders/*',
        method: 'GET',
        status: 'SKIP',
        error: 'No auth token or cart setup'
      })
    }

    // 5. Error Cases
    console.log('❌ Testing error cases...')
    
    addResult(await makeRequest('/catalog/products/invalid-slug'))
    addResult(await makeRequest('/cart/invalid-uuid'))
    addResult(await makeRequest('/orders/999999'))
    
    if (authToken) {
      addResult(await makeRequest('/orders/999999'))
    }

    console.log('✅ API Tests completed!')
    setIsRunning(false)
  }


  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PASS': return '✅'
      case 'FAIL': return '❌'
      case 'SKIP': return '⏭️'
      default: return '❓'
    }
  }

  const passedTests = results.filter(r => r.status === 'PASS').length
  const failedTests = results.filter(r => r.status === 'FAIL').length
  const skippedTests = results.filter(r => r.status === 'SKIP').length

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">API Endpoint Tester</h1>
      
      <div className="mb-6">
        <button 
          onClick={runAllTests}
          disabled={isRunning}
          className="btn btn-primary"
        >
          {isRunning ? 'Running Tests...' : 'Run All Tests'}
        </button>
        
        {results.length > 0 && (
          <div className="mt-4 flex gap-4 text-sm">
            <span className="text-green-500">✅ Passed: {passedTests}</span>
            <span className="text-red-500">❌ Failed: {failedTests}</span>
            <span className="text-yellow-500">⏭️ Skipped: {skippedTests}</span>
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          {results.map((result, index) => (
            <div key={index} className="border rounded-lg p-4 bg-bg-alt">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span>{getStatusIcon(result.status)}</span>
                  <span className="font-mono text-sm">
                    {result.method} {result.endpoint}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {result.statusCode && (
                    <span className={`px-2 py-1 rounded text-xs ${
                      result.statusCode >= 200 && result.statusCode < 300 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {result.statusCode}
                    </span>
                  )}
                  {result.duration && (
                    <span className="text-gray-400">{result.duration}ms</span>
                  )}
                </div>
              </div>
              
              {result.error && (
                <div className="text-red-400 text-sm mb-2">
                  Error: {result.error}
                </div>
              )}
              
              {result.response && (
                <details className="text-sm">
                  <summary className="cursor-pointer text-gray-400 hover:text-gray-300">
                    Response Data
                  </summary>
                  <pre className="mt-2 p-2 bg-bg-inner rounded text-xs overflow-auto max-h-40">
                    {JSON.stringify(result.response, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 p-4 bg-bg-alt rounded-lg">
        <h3 className="font-semibold mb-2">Test Coverage</h3>
        <div className="text-sm space-y-1">
          <div>🔐 <strong>Auth:</strong> /auth/register, /auth/login</div>
          <div>📦 <strong>Catalog:</strong> /catalog/categories, /catalog/meta, /catalog/products, /catalog/products/:slug, /catalog/collections</div>
          <div>🛒 <strong>Cart:</strong> /cart/init, /cart/:cartId, /cart/:cartId/items, /cart/:cartId/checkout</div>
          <div>📋 <strong>Orders:</strong> /orders, /orders/:id, /orders/:id/status (requires auth)</div>
          <div>❌ <strong>Error Cases:</strong> Invalid slugs, invalid UUIDs, non-existent resources</div>
        </div>
      </div>
    </div>
  )
}
