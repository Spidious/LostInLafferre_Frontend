describe('template spec', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000', { failOnStatusCode: false });
  });

  it('should display initial message when page first loads', () => {
    //Starting point input field
    cy.get('input[placeholder="Select starting point"]')
    .should('be.visible')
    .and('have.attr', 'placeholder', 'Select starting point');
    //Destination point input field
    cy.get('input[placeholder="Select destination point"]')
    .should('be.visible')
    .and('have.attr', 'placeholder', 'Select destination point');
    // Search button
    cy.get('button').contains('Submit')
    // Map component
    cy.get('div.w-full.h-full')
    .should('be.visible');
    // Check if initial directions is displayed
    cy.get('.text-emerald-600').should('contain', 'Select locations to get directions');
  });
})