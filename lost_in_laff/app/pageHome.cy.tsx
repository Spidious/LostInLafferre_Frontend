import React from 'react'
import Home from './page'

describe('<Home />', () => {
  beforeEach(() => {
    cy.mount(<Home />)
  })
  
  it('contains all components on load', () => {
    cy.get('input').should('have.attr', 'placeholder', 'Select starting point')
    cy.get('input').should('have.attr', 'placeholder', 'Select starting point')
    cy.get('button').contains('Submit')
    cy.get('div.w-full.h-full').should('be.visible')
    cy.get('p').should('contain', 'Select locations to get directions')
  })
})