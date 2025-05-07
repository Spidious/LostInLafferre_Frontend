describe('Directions Component', () => {
  beforeEach(() => {
    // Visit the page where Directions component is rendered
    cy.visit('http://localhost:3000', { failOnStatusCode: false });
  });

  it('should display initial message when page first loads', () => {
      cy.get('.text-emerald-600').should('contain', 'Select locations to get directions');
  });
});