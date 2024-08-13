import "cypress-each"

describe( 'GET /api/accounts', () => {
    beforeEach( () => {
        cy.request( '/api/accounts' ).as( "res" )
    } )
    it( 'returns 200 OK', function () {
        cy.get( "@res" ).its( 'status' ).should( 'equal', 200 )
    } )

    describe( `body`, () => {

        it( `.data exists`, () => {
            cy.get( "@res" ).its( "body" ).should( 'have.property', 'data' )
        } )
        it( `.data is array`, () => {
            cy.get( "@res" ).its( "body.data" ).should( 'be.an', 'array' )
        } )
        it( `.data has many items`, () => {
            cy.get( "@res" ).its( "body.data" ).should( 'have.length.gt', 0 )
        } )

        describe( `.data[]`, () => {

            const props = [
                'type',
                'address',
                'balance',
            ]

            it( `.type = "account"`, () => {
                cy.get( '@res' ).its( 'body.data' ).each( x => {
                    cy.wrap( x ).its( 'type' ).should( 'equal', 'account' )
                } )
            } )

            it.each( props )( `.data.%s`, prop => {
                cy.get( "@res" ).its( `body.data` ).each( x => {
                    cy.wrap( x ).its( prop ).should( 'exist' )
                } )
            } )
        } )
    } )
} )