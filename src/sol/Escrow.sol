// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

contract EscrowEvents {
    event Approved(uint256 balance);
}

contract Escrow {
    // --- errors ---
    error ArbiterOnly();

    // --- state ---
    address public depositor;
    address public beneficiary;
    address public arbiter;
    bool public isApproved;

    // --- events ---
    event Approved(uint256 balance);

    // --- modifiers ---
    modifier onlyArbiter {
        if (msg.sender != arbiter) revert ArbiterOnly();
        _;
    }

    // --- fns ---
    constructor(address arbiter_, address beneficiary_) payable {
        depositor = msg.sender;
        arbiter = arbiter_;
        beneficiary = beneficiary_;
    }

    function approve() external onlyArbiter{
        uint xferAmount = address(this).balance;
        (bool success,) = beneficiary.call{value: xferAmount}('');
        require(success);
        isApproved = true;
        emit Approved(xferAmount);
    }

}
