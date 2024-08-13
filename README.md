## sveltekit ethers solidity escrow poc

A naive escrow contract dapp built with sveltekit, ethers, solidity, sqllite and forge.

Assumes use of anvil and it's accounts to run on local node.

## roles

- depositor : anvil account 0 ( hardcoded )
- arbiter : anvil account 1
- beneficiary : any other anvil account

## workflow

## setup

- import anvil account 0 into metamask wallet as _depositor_
- import anvil account 1 into metamask wallet as _arbiter_
- start anvil `npm run anvil`
- start dapp `npm run dev`

## dapp

Start,
- goto `http://localhost:5173`
- app displays all anvil accounts and their balances

Complete form,
- select _arbiter_
- select _beneficiary_
- select _value_

Deploy,
- open metamask / wallet
- select _depositor_ account ( anvil0 )
- close wallet
- click _deploy_
- wait ...
- contract should be deployed with,
    - balance = deposit 
    - approved = false

Approve,
- open metamask / wallet
- select _artiber_ account
- close wallet
- click _approve_
- wait ...
- deployment should be updated 
    - approved = true, 
    - balance = zero, 
    - funds transferred



## basic use cases
```cucumber
given anvil is running 
    when loaded
    then "anvil" is checked

given wallet extension exists
    when loaded
    then "wallet" is checked

given wallet has any account connected
    when loaded
    then "accounts" is checked

given wallet has no account account
    when loaded
    then "connect" is displayed

git anvil is up
    and wallet exists
    and one account is connected
    when loaded
    then depositor is set to anvil account 0
        and the connected icon is green
        and the selected account arrow points to depositor

given fresh new form
   when arbiter is set 
   then arbiter badge appears as role beside address
    
given fresh new form
   when beneficiary is set 
   then beneficiary badge appears as role beside address
   
given fresh new form
    and arbiter is set
    and beneficiay is set
    and value is set
    then deploy is enabled
    
given valid form
    and selected wallet account is depositor ( anvil0 )
    and deploy is enabled
    when click deploy
    then contract deployed with ethers
        and approve is enabled
        and new deployment added to deployments with 
            balance = deposit
            approved = false
            owner = depositor
            address is set

given contract deployed 
    and selected wallet account is arbiter
    and approve is enabled
    when click approve
    then contract is approved
        and funds transferred to beneficiary
        and deployment is updated with 
            balance = 0 
            approved = true
            
given contract deployed 
    and selected wallet account is NOT arbiter
    and approve is enabled
    when click approve
    then OnlyArbiter error message displayed
```
