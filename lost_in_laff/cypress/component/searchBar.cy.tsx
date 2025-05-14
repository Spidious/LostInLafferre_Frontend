import React from 'react';
import SearchBar from '../../components/searchBar';

describe('SearchBar Component Option Sorting', () => {
  it('should sort room options into correct floor groups', () => {
    // Mock room options
    const mockOptions = [
      {value: 'basement-W0005', label: 'W0005 (MSP,Mizzou,Space,Program,Aero,Tigers,Club)'},
      // {value: 'basement-W0003', label: 'W0003 (Environmental,Lab)'},
      // {value: 'basement-W0009', label: 'W0009 (AR,VR,Lab,Labs)'},
      // {value: 'basement-W0010', label: 'W0010 (AR,VR,Lab,Labs)'},
      // {value: 'basement-W0013', label: 'W0013 '},
      // {value: 'basement-W0014', label: 'W0014 (Machine,Shop)'},
    ];

    // Mount component
    cy.mount(
      <SearchBar
        value=""
        onChange={() => {}}
        options={mockOptions}
        placeholder="Select a room"
      />
    );

    // Click to open the dropdown
    cy.get('input[placeholder="Select a room"]').click();

    // Check each floor group exists and contains correct rooms
    cy.get('div').contains('Entrances')
      .parent()

    cy.get('div').contains('Basement')
      .parent()
      .find('[class*="px-4 py-2"]')
      .should('contain', 'W0005');

    cy.get('div').contains('First Floor')
      .parent()

    cy.get('div').contains('Second Floor')
      .parent()

    cy.get('div').contains('Third Level')
      .parent()
  });
});