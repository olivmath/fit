// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/ChallengePool.sol";
import "../src/lib/Constants.sol";
import "../src/lib/Types.sol";
import "../src/lib/Events.sol";

contract BaseTest is Test {
    ChallengePool public pool;
    address public user1;
    address public user2;
    address public user3;

    function setUp() public virtual {
        pool = new ChallengePool();
        user1 = address(0x1);
        user2 = address(0x2);
        user3 = address(0x3);
        
        // Fund test users
        vm.deal(user1, 10 ether);
        vm.deal(user2, 10 ether);
        vm.deal(user3, 10 ether);
    }

    // Helper function to deposit as a specific user
    function _depositAs(address user) internal {
        vm.prank(user);
        pool.deposit{value: Constants.DEPOSIT_AMOUNT}();
    }

    // Helper function to add exercises as a specific user
    function _addExercisesAs(
        address user,
        uint256 flexoes,
        uint256 abdominais,
        uint256 km,
        string memory description
    ) internal {
        vm.prank(user);
        pool.addExercises(flexoes, abdominais, km, description);
    }

    // Helper function to advance to the next season
    function _advanceToNextSeason() internal {
        uint256 blocksToAdvance = Constants.SEASON_DURATION_BLOCKS + 1;
        vm.roll(block.number + blocksToAdvance);
    }

    // Helper function to check if a user has completed the challenge
    function _hasCompletedChallenge(address user) internal view returns (bool) {
        (uint256 flexoes, uint256 abdominais, uint256 km, bool bateuMeta, , , ) = pool.getParticipantData(user);
        return bateuMeta || 
               (flexoes >= Constants.META_FLEXOES && 
                abdominais >= Constants.META_ABDOMINAIS && 
                km >= Constants.META_KM);
    }
}