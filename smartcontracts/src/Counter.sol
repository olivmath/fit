// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Counter {
    uint256 public number;

    event Increment(uint256 newValue);
    event Decrement(uint256 newValue);

    function increment() public {
        number++;
        emit Increment(number);
    }

    function decrement() public {
        require(number > 0, "Counter cannot go below 0");
        number--;
        emit Decrement(number);
    }

    function setNumber(uint256 newNumber) public {
        number = newNumber;
    }
}
