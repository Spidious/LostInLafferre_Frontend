describe('Page', () => {
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

  it('should update map and directions when searching for a path', () => {
    // Select starting point
    cy.get('input[placeholder="Select starting point"]').click();
    cy.get('[class*="px-4 py-2"]').contains('W0003').click();
    
    // Select destination point
    cy.get('input[placeholder="Select destination point"]').click();
    cy.get('[class*="px-4 py-2"]').contains('W0013').click();
    
    // Click submit
    cy.get('button').contains('Submit').click();

    // Verify map updates
    cy.get('div.w-full.h-full')
      .should('be.visible')
      .find('svg')
      .should('exist');

    // Verify directions update
    cy.get('.text-emerald-700')
      .should('exist')
      .and('contain', 'Step 1 of');

    // Verify navigation buttons appear
    cy.get('button').contains('Next').should('be.visible');
    cy.get('button').contains('Back').should('be.visible').and('be.disabled');
  });
})