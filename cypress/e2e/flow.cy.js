import { faker } from '@faker-js/faker'

describe('Automation Challenge 2', () => {
  it('Buy a book', () => {
    cy.visit('/')
    
    Cypress.on('uncaught:exception', () => { return false })

    cy.get('a[href="https://practice.automationtesting.in/shop/"]')
      .eq(0)
      .should('have.text', 'Shop' )
      .click()


    cy.location('pathname').should('equal', '/shop/')

    cy.get('a')
      .find('h3')
      .contains('Android Quick Start Guide')
      .click()


    cy.location('pathname').should('equal', '/product/android-quick-start-guide/')

    const quantity = 2
    cy.get('input[type="number"]').clear().type(quantity)

    cy.get('button[type="submit"]')
      .contains('Add to basket')
      .click()

      cy.get('.woocommerce-Price-amount.amount').eq(1).invoke('text').then(priceText => {
        const price = parseFloat(priceText.replace('₹', '').trim()) // Parse the price
    
        // Get the total amount
        cy.get('.amount').invoke('text').then(amountText => {
            const amount = parseFloat(amountText.replace('₹', '').trim()) // Parse the amount
    
            // Assert that the total amount equals the product of the price and quantity
            expect(amount).to.eq(price * quantity)
            cy.wrap(amount).as('totalAmount') //save it for later use
        })
    })

    cy.get('.amount').eq(0).click()


    cy.location('pathname').should('equal', '/basket/')

    cy.get('input[type="number"]').invoke('val').then(inputValue => {
      expect(inputValue).to.eql(`${quantity}`)
    })

    cy.get('@totalAmount').then(totalAmount => {
      // You can use totalAmount here
  
      // Get the total price from the span
      cy.get('td[data-title="Total"]').find('.woocommerce-Price-amount.amount').then(priceElement => {
          const priceText = priceElement.text(); // Get the text of the element
          const price = parseFloat(priceText.replace('₹', '')) // Remove the currency symbol and parse to a number
  
          // Assert that the price is equal to the total amount
          expect(price).to.eq(totalAmount)
      })
  })

    cy.get('.wc-proceed-to-checkout')
      .find('a')
      .should('contain', '	Proceed to Checkout')
      .click()

    cy.location('pathname').should('equal', '/checkout/')

    cy.get('#billing_first_name').type(faker.person.firstName())
    cy.get('#billing_last_name').type(faker.person.lastName())
    cy.get('#billing_company').type(faker.company.name())
    cy.get('#billing_email_field').type(faker.internet.email())
    cy.get('#billing_phone_field').type(69)
    cy.get('#billing_address_1').type(faker.location.streetAddress())
    cy.get('#billing_city').type(faker.location.city())
    cy.get('#billing_postcode').type(faker.location.zipCode())
    cy.get('#order_comments').type(faker.lorem.paragraph())

    cy.get('#payment').find('[type="radio"]').then( radioButton => {
      cy.wrap(radioButton)
        .eq(1)
        .check()
        .should('be.checked')
    })

    cy.get('#place_order').click()

    cy.location('pathname').should('include', '/order-received/')


  cy.get('@totalAmount').then(totalAmount => {
    cy.get('tfoot tr').contains('Subtotal:').should('be.visible').then(() => {
      cy.get('tfoot tr:contains("Subtotal:") td').then(($price) => {
          const priceText = $price.text(); // This would return something like "₹900.00"
          const priceNumber = parseFloat(priceText.replace(/[^0-9.-]+/g,"")); // This will remove the "₹" and parse the remaining string to a float
          expect(priceNumber).to.eq(totalAmount); // Assertion
      });
    });
  }) 

  })



})