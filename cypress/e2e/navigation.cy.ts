describe('Navigation & Public Views', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('loads the homepage correctly', () => {
    cy.contains('Descubre').should('be.visible')
    cy.get('nav').should('exist') // Header/Navbar
    cy.get('footer').should('exist')
  })

  it('navigates to Tours via navbar', () => {
    cy.contains('nav a', 'Tours').click()
    cy.url().should('include', '/tours')
    cy.get('h1').contains('Destinos').should('be.visible') // Or another header in tours
  })

  it('navigates to Accommodations via navbar', () => {
    cy.contains('nav a', 'Alojamientos').click()
    cy.url().should('include', '/accommodations')
    // We expect some header or text for accommodations
  })

  it('navigates to Planet Explorer', () => {
    cy.contains('nav a', 'Explorar').click()
    cy.url().should('include', '/navegar')
    // The globe is rendered in a canvas usually
    cy.get('canvas').should('exist')
  })
})
