// Import faker module for generating random data
import { faker } from '@faker-js/faker'

// The top-level suite for the automation challenge
describe('Automation Challenge 2', () => {

  // Executed before each test within the suite
  beforeEach('visit the store page', () => {

    // Visits the base URL defined in cypress.json (or 'CYPRESS_BASE_URL' environment variable)
    cy.visit('/')
    
    // This is to ignore any uncaught exceptions in the application
    Cypress.on('uncaught:exception', () => { return false })

  })


  // Test case for buying a book
  it('Buy a book', () => {

    // Navigate to shop page
    cy.get('a[href="https://practice.automationtesting.in/shop/"]')
      .eq(0)
      .should('have.text', 'Shop' )
      .click()

    // Check we're on the correct page
    cy.location('pathname').should('equal', '/shop/')

    // Click on the first book's name
    cy.get('[class="products masonry-done"]')
      .find('h3')
      .eq(0)
      .click()

    // Check we've navigated to the correct page
    cy.location('pathname').should('equal', '/product/android-quick-start-guide/')

    // Define quantity of the book and type in quantity input field
    const quantity = 2
    cy.get('input[type="number"]').clear().type(quantity)

    // Click on 'Add to basket' button
    cy.get('button[type="submit"]')
      .contains('Add to basket')
      .click()

    // Check the total price on basket page
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

    // Go to the basket page
    cy.get('.amount').eq(0).click()

    // Check we've navigated to the correct page
    cy.location('pathname').should('equal', '/basket/')

    // Assert that the quantity in the basket equals the expected quantity
    cy.get('input[type="number"]').invoke('val').then(inputValue => {
      expect(inputValue).to.eql(`${quantity}`)
    })

    // Retrieve the total amount
    cy.get('@totalAmount').then(totalAmount => {
        // Get the total price from the span
        cy.get('td[data-title="Total"]').find('.woocommerce-Price-amount.amount').then(priceElement => {
            const priceText = priceElement.text() // Get the text of the element
            const price = parseFloat(priceText.replace('₹', '')) // Remove the currency symbol and parse to a number

            // Assert that the price is equal to the total amount
            expect(price).to.eq(totalAmount)
        })
    })

    // Proceed to checkout
    cy.get('.wc-proceed-to-checkout')
      .find('a')
      .should('contain', 'Proceed to Checkout')
      .click()

    // Check we've navigated to the correct page
    cy.location('pathname').should('equal', '/checkout/')

    // Fill out the form with faker generated data
    cy.get('#billing_first_name').type(faker.person.firstName())
    cy.get('#billing_last_name').type(faker.person.lastName())
    cy.get('#billing_company').type(faker.company.name())
    cy.get('#billing_email_field').type(faker.internet.email())
    cy.get('#billing_phone_field').type(69)
    cy.get('#billing_address_1').type(faker.location.streetAddress())
    cy.get('#billing_city').type(faker.location.city())
    cy.get('#billing_postcode').type(faker.location.zipCode())
    cy.get('#order_comments').type(faker.lorem.paragraph())

    // Select a payment method
    cy.get('#payment').find('[type="radio"]').then( radioButton => {
      cy.wrap(radioButton)
        .eq(1)
        .check()
        .should('be.checked')
    })

    // Place the order
    cy.get('#place_order').click()

    // Check we've navigated to the order received page
    cy.location('pathname').should('include', '/order-received/')

    // Assert the final price on the receipt page
    cy.get('@totalAmount').then(totalAmount => {
      cy.get('tfoot tr').contains('Subtotal:').should('be.visible').then(() => {
        cy.get('tfoot tr:contains("Subtotal:") td').then(($price) => {
            const priceText = $price.text() // This would return something like "₹900.00"
            const priceNumber = parseFloat(priceText.replace(/[^0-9.-]+/g,"")) // This will remove the "₹" and parse the remaining string to a float
            expect(priceNumber).to.eq(totalAmount) // Assertion
        })
      })
    }) 

  })

  // Test case for searching a non-existent book
  it('look for a non-existent book', () => {

    // Type 'non-existent book' into the search box and press enter
    cy.get('input#s').type('non-existent book{enter}',{force:true})

    // Check the search parameter in the URL
    cy.location('search').should('equal', '?s=non-existent+book')

    // Assert 'non-existent book' is displayed on the page
    cy.get('#content .page-title em').should('have.text', 'non-existent book')

    // Assert 'Sorry, nothing found' is displayed on the page
    cy.get('#content p').should('have.text', 'Sorry, nothing found.')

  })

})