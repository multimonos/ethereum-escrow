## sveltekit ethers solidity escrow poc

A naive escrow contract dapp built with sveltekit, ethers, solidity, sqllite and forge.

Assumes use of anvil and it's accounts to run on local node.

## roles

- depositor : anvil account 0
- arbiter : anvil account 1
- beneficiary : any other anvil account

## workflow

## setup

- import anvil account 0 into metamask wallet as _depositor_
- import anvil account 1 into metamask wallet as _arbiter_
- start anvil `npm run anvil`
- start dapp `npm run dev`

## dapp

- goto `http://localhost:5173`
- app displays all anvil accounts and their balances
- _depositor_ connects wallet using anvil account 0 
