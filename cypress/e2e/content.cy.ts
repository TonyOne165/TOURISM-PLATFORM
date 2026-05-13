describe('Content Exploration', () => {
  it('loads and displays tours', () => {
    cy.visit('/tours')
    // Esperamos que haya alguna tarjeta o contenedor de tour
    // Podría ser un card o un listado. Verificamos que la carga termine.
    cy.get('.loading').should('not.exist')
    
    // Asumiendo que las tarjetas tienen la clase 'card' de daisyui
    // Si no hay tours creados en db, tal vez muestre 'No tours found', pero idealmente
    // verificamos que la grilla o lista esté renderizada.
    cy.get('body').then($body => {
      if ($body.find('.card').length > 0) {
        cy.get('.card').should('have.length.at.least', 1)
      } else {
        cy.contains(/no tours|no hay/i).should('exist')
      }
    })
  })

  it('loads and displays accommodations', () => {
    cy.visit('/accommodations')
    cy.get('.loading').should('not.exist')
    
    cy.get('body').then($body => {
      if ($body.find('.card').length > 0) {
        cy.get('.card').should('have.length.at.least', 1)
      } else {
        cy.contains(/no accommodations|no hay/i).should('exist')
      }
    })
  })
})
