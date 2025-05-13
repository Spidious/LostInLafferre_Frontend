import React from 'react';
import Directions from '../../components/directions';

// Mock the API response from W0003 to W0013
const mockApiResponse = [
    {
        "x": 195.0,
        "y": 263.0,
        "z": 0.0
    },
    {
        "x": 201.94528616800625,
        "y": 304.62752531282837,
        "z": 0.0
    },
    {
        "x": 205.0,
        "y": 311.0,
        "z": 0.0
    },
    {
        "x": 208.0625,
        "y": 311.5,
        "z": 0.0
    },
    {
        "x": 205.21875,
        "y": 314.5625,
        "z": 0.0
    },
    {
        "x": 204.80357142857144,
        "y": 316.5,
        "z": 0.0
    },
    {
        "x": 198.28571428571428,
        "y": 326.5,
        "z": 0.0
    },
    {
        "x": 188.94136110418225,
        "y": 336.56314958011143,
        "z": 0.0
    },
    {
        "x": 181.58333333333331,
        "y": 334.92658730158729,
        "z": 0.0
    },
    {
        "x": 173.30266628379383,
        "y": 331.83458830536233,
        "z": 0.0
    },
    {
        "x": 167.08333333333331,
        "y": 332.51470588235293,
        "z": 0.0
    },
    {
        "x": 157.41666666666669,
        "y": 331.99346405228761,
        "z": 0.0
    },
    {
        "x": 147.5,
        "y": 329.55882352941177,
        "z": 0.0
    },
    {
        "x": 137.07074006941224,
        "y": 325.53046270145711,
        "z": 0.0
    },
    {
        "x": 131.21536231884059,
        "y": 328.76660499537468,
        "z": 0.0
    },
    {
        "x": 123.0744,
        "y": 337.15,
        "z": 0.0
    },
    {
        "x": 119.468,
        "y": 342.05,
        "z": 0.0
    },
    {
        "x": 115.1364,
        "y": 351.85,
        "z": 0.0
    },
    {
        "x": 114.4112,
        "y": 356.75,
        "z": 0.0
    },
    {
        "x": 114.30634390651085,
        "y": 395.12353923205342,
        "z": 0.0
    },
    {
        "x": 115.95714285714286,
        "y": 401.64126984126983,
        "z": 0.0
    },
    {
        "x": 114.48155186064923,
        "y": 409.23365003958833,
        "z": 0.0
    },
    {
        "x": 101.0,
        "y": 410.5,
        "z": 0.0
    }
]

describe('Directions Component', () => {
  it('should display no directions when passed null', () => {
    // Mock API response
    const nullMockApiResponse = null;

    // Mount the component with mock data
    cy.mount(<Directions apiResponse={nullMockApiResponse} />);

    // Check if directions container is rendered
    cy.get('.bg-emerald-50').should('exist');

    // Verify step counter does not exist
    cy.get('.text-emerald-700')
      .should('not.exist');

    // Verify navigation buttons are in correct initial state
    cy.get('button')
      .should('not.exist');
  });

  it('should display first direction when valid api response is passed', () => {
    // Mount the component with mock data
    cy.mount(<Directions apiResponse={mockApiResponse} />);

    // Check if directions container is rendered
    cy.get('.bg-emerald-50').should('exist');

    // Verify step counter does not exist
    cy.get('.text-emerald-700')
      .should('not.exist');  // Changed from 'notexist' to 'not.exist'

    // Verify first direction is displayed
    cy.get('.text-emerald-700')
      .should('contain', 'then walk')
      .and('be.visible');

    // Verify navigation buttons are in correct initial state
    cy.get('button')
      .contains('Next')
      .should('exist')

    cy.get('button')
      .contains('Back')
      .and('be.disabled')
      .should('exist');
  });
});

describe('Directions Component with Valid API Response', () => {
  it('should call the handleNext function when the next button is pressed', () => {
    // Create a spy for onClick handler
    const onClickSpy = cy.spy().as('handleNextSpy');
    
    // Mount component with the spy
    cy.mount(
      <Directions 
        apiResponse={mockApiResponse}
        // @ts-ignore - Ignore type checking for test purposes
        onNext={onClickSpy}
      />
    );

    // Get initial step number
    cy.get('.text-emerald-700').should('contain', 'Step 1 of');

    // Click next button
    cy.get('button')
      .contains('Next')
      .click();

    // Verify the spy was called
    cy.get('@handleNextSpy').should('have.been.called');

    // Verify we moved to next step
    cy.get('.text-emerald-700').should('contain', 'Step 2 of');

    // Verify the Back button is enabled
    cy.get('button')
      .contains('Back')
      .should('be.enabled');
  });

  it('should call the handleBack function when the back button is pressed', () => {
    // Create a spy for onClick handler
    const onClickSpy = cy.spy().as('handleBackSpy');
    
    // Mount component with the spy
    cy.mount(
      <Directions 
        apiResponse={mockApiResponse}
        // @ts-ignore - Ignore type checking for test purposes
        onNext={onClickSpy}
      />
    );
    
    // Click next button so we can go back
    cy.get('button')
      .contains('Next')
      .click();

    // Get initial step number
    cy.get('.text-emerald-700').should('contain', 'Step 2 of');

    // Click back button
    cy.get('button')
      .contains('Back')
      .click();

    // Verify the spy was called
    cy.get('@handleBackSpy').should('have.been.called');

    // Verify we moved to next step
    cy.get('.text-emerald-700').should('contain', 'Step 1 of');

    // Verify the Back button is enabled
    cy.get('button')
      .contains('Back')
      .should('be.disabled');
  });

  it('should disable the next button on the last step', () => {
    // Mount component with the spy
    cy.mount(
      <Directions 
        apiResponse={mockApiResponse}
      />
    );

    // Click through to the last step
    for (let i = 0; i < 4; i++) {
      cy.get('button')
        .contains('Next')
        .click();
    }

    // Verify we are on the last step
    cy.get('.text-emerald-700').should('contain', 'Step 5 of');

    // Verify the Next button is disabled
    cy.get('button')
      .contains('Next')
      .should('be.disabled');
  });

  describe('Checking Written Direction Changes', () => {
    beforeEach(() => {
      // Mount component
      cy.mount(<Directions apiResponse={mockApiResponse} />);

      // Store first direction text
      cy.get('.text-emerald-700')
        .invoke('text')
        .as('firstDirection');

      // Click next button
      cy.get('button')
        .contains('Next')
        .click();

      // Store second direction text
      cy.get('.text-emerald-700')
        .invoke('text')
        .as('secondDirection');
    });

    it('should display the next direction when next button is clicked', () => {
      // Click next button
      cy.get('button')
        .contains('Next')
        .click();

      // Verify the new direction is different from the first
      cy.get('.text-emerald-700').then(($newDirection) => {
        cy.get('@secondDirection').then((secondDirection) => {
          expect($newDirection).to.not.equal(secondDirection);
        });
      });
    });

    it('should display the previous direction when previous button is clicked', () => {
      // Click next button
      cy.get('button')
        .contains('Next')
        .click();

      // Click back button
      cy.get('button')
        .contains('Back')
        .click();

      // Verify the new direction is different from the first
      cy.get('.text-emerald-700').then(($newDirection) => {
        cy.get('@firstDirection').then((firstDirection) => {
          expect($newDirection).to.not.equal(firstDirection);
        });
      });
    });
  });
});