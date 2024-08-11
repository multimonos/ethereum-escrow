// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {Escrow,EscrowEvents}from "./Escrow.sol";


contract EscrowTest is Test,EscrowEvents {

    Escrow public escrow;

    address public depositor;
    address public beneficiary;
    address public arbiter;

    uint256 public deposit = 5 ether;

    function setUp() external {

        // other parties
        beneficiary = makeAddr("beneficiary");
        arbiter = makeAddr("arbiter");

        // create
        depositor = makeAddr("depositor");
        vm.deal(depositor, 2 * deposit);

        vm.prank(depositor);
        escrow = new Escrow{value: deposit}(arbiter, beneficiary);
    }

    function test_true() public pure {
        assertTrue(true);
    }

    function test_depositor_set() public view {
        assertEq(depositor, escrow.depositor());
    }

    function test_beneficiary_set() public view {
        assertEq(beneficiary, escrow.beneficiary());
    }

    function test_arbiter_set() public view {
        assertEq(arbiter, escrow.arbiter());
    }

    function test_initial_deposit_via_contstructor() public view {
        assertEq(address(escrow).balance, deposit);
    }

    function test_not_approved_by_default() public view {
        assertFalse(escrow.isApproved());
    }

    function test_approve_by_arbiter_only() public {
        vm.expectRevert();
        escrow.approve();
    }

    function test_approval_sets_is_approved_true() public {
        vm.prank(arbiter);
        escrow.approve();
        assertTrue(escrow.isApproved());
    }

    function test_approval_xfers_balance_to_beneficiary() public {
        assertEq(beneficiary.balance, 0);
        assertEq(address(escrow).balance, deposit);

        vm.prank(arbiter);
        escrow.approve();

        assertEq(beneficiary.balance, deposit);
        assertEq(address(escrow).balance, 0);
    }

    function test_approval_emits_approved_event() public {
        vm.expectEmit();
        emit Approved(deposit);
        vm.prank(arbiter);
        escrow.approve();
    }
}
