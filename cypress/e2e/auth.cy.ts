describe('Authentication', () => {
  it('loads the login page', () => {
    cy.visit('/login')
    cy.contains('Welcome Back').should('be.visible')
    cy.get('input[type="email"]').should('exist')
    cy.get('input[type="password"]').should('exist')
  })

  it('shows error on invalid credentials', () => {
    cy.visit('/login')
    cy.get('input[type="email"]').type('test@example.com')
    cy.get('input[type="password"]').type('wrongpassword')
    cy.get('button[type="submit"]').click()
    
    // Debería mostrar alerta de error
    cy.get('.alert-error').should('be.visible')
  })

  it('navigates to register page from login', () => {
    cy.visit('/login')
    cy.contains('Sign up').click()
    cy.url().should('include', '/register')
    cy.contains('Create an Account').should('be.visible')
  })

  it('redirects unauthenticated user trying to access admin', () => {
    // Cuando no hay sesión, ProtectedRoute debería redirigir a /login o /
    cy.visit('/admin')
    cy.url().should('not.include', '/admin')
  })

  it('redirects unauthenticated user trying to access user dashboard', () => {
    cy.visit('/dashboard')
    cy.url().should('not.include', '/dashboard')
  })
})
