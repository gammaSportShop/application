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

async function makeRequest(endpoint: string, options: RequestInit = {}): Promise<TestResult> {
  const start = Date.now()
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
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

async function runApiTests() {
  console.log('🧪 Starting API Tests...')
  const results: TestResult[] = []
  let authToken: string | null = null
  let cartId: string | null = null
  let testProduct: any = null

  const addResult = (result: TestResult) => {
    results.push(result)
    console.log(`${result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⏭️'} ${result.method} ${result.endpoint} ${result.statusCode ? `(${result.statusCode})` : ''} ${result.duration ? `${result.duration}ms` : ''}`)
    if (result.error) console.log(`   Error: ${result.error}`)
  }

  // 1. Auth Tests
  console.log('\n🔐 Testing Auth endpoints...')
  
  addResult(await makeRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User'
    })
  }))

  const loginResult = await makeRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'password123'
    })
  })
  addResult(loginResult)
  
  if (loginResult.status === 'PASS' && loginResult.response?.token) {
    authToken = loginResult.response.token
  }

  // 2. Catalog Tests
  console.log('\n📦 Testing Catalog endpoints...')
  
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
  addResult(productsResult)
  if (productsResult.status === 'PASS' && productsResult.response?.items?.[0]) {
    testProduct = productsResult.response.items[0]
    addResult(await makeRequest(`/catalog/products/${testProduct.slug}`))
  }

  // 3. Cart Tests
  console.log('\n🛒 Testing Cart endpoints...')
  
  const cartInitResult = await makeRequest('/cart/init', { method: 'POST' })
  addResult(cartInitResult)
  
  if (cartInitResult.status === 'PASS' && cartInitResult.response?.cartId) {
    cartId = cartInitResult.response.cartId
    
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
  console.log('\n📋 Testing Orders endpoints...')
  
  if (authToken && cartId && testProduct) {
    // First add item to cart and checkout
    await makeRequest(`/cart/${cartId}/items`, {
      method: 'POST',
      body: JSON.stringify({
        productId: testProduct.id,
        quantity: 1
      })
    })
    
    const checkoutResult = await makeRequest(`/cart/${cartId}/checkout`, { 
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authToken}` }
    })
    addResult(checkoutResult)
    
    if (checkoutResult.status === 'PASS' && checkoutResult.response?.order) {
      const orderId = checkoutResult.response.order.id
      
      addResult(await makeRequest('/orders', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      }))
      addResult(await makeRequest(`/orders/${orderId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      }))
      addResult(await makeRequest(`/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${authToken}` },
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
  console.log('\n❌ Testing error cases...')
  
  addResult(await makeRequest('/catalog/products/invalid-slug'))
  addResult(await makeRequest('/cart/invalid-uuid'))
  addResult(await makeRequest('/orders/999999'))
  
  if (authToken) {
    addResult(await makeRequest('/orders/999999', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    }))
  }

  // Summary
  const passedTests = results.filter(r => r.status === 'PASS').length
  const failedTests = results.filter(r => r.status === 'FAIL').length
  const skippedTests = results.filter(r => r.status === 'SKIP').length

  console.log('\n📊 Test Summary:')
  console.log(`✅ Passed: ${passedTests}`)
  console.log(`❌ Failed: ${failedTests}`)
  console.log(`⏭️ Skipped: ${skippedTests}`)
  console.log(`📈 Success Rate: ${Math.round((passedTests / (passedTests + failedTests)) * 100)}%`)

  return results
}

// Run tests if this script is executed directly
if (typeof window !== 'undefined') {
  runApiTests().catch(console.error)
}

export { runApiTests }
