// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./BaseTest.sol";

contract ViewFunctionTest is BaseTest {
    function setUp() public override {
        super.setUp();
        _depositAs(user1);
        _depositAs(user2);
        _addExercisesAs(user1, 100, 200, 30, "User1 exercises");
        _addExercisesAs(user2, 300, 100, 20, "User2 exercises");
    }

    function testGetCurrentSeasonInfo() public {
        // When: getCurrentSeasonInfo() é chamado
        (uint256 seasonId, uint256 startBlock, uint256 endBlock, uint256 blocksRemaining, bool isActive) = pool.getCurrentSeasonInfo();
        
        // Then: retorna valores corretos
        assertEq(seasonId, 1, "Season ID should be 1");
        assertEq(startBlock, 1, "Start block should be 1"); // Assuming test starts at block 1
        assertEq(endBlock, startBlock + Constants.SEASON_DURATION_BLOCKS, "End block should be calculated correctly");
        assertEq(blocksRemaining, Constants.SEASON_DURATION_BLOCKS - (block.number - startBlock), "Blocks remaining should be calculated correctly");
        assertTrue(isActive, "Season should be active");
    }
    
    function testGetParticipantData() public {
        // When: getParticipantData(user1) é chamado
        (uint256 flexoes, uint256 abdominais, uint256 km, bool bateuMeta, bool isParticipating, uint256 seasonId, bool hasWithdrawn) = pool.getParticipantData(user1);
        
        // Then: retorna dados corretos
        assertEq(flexoes, 100, "Should have 100 flexoes");
        assertEq(abdominais, 200, "Should have 200 abdominais");
        assertEq(km, 30, "Should have 30 km");
        assertFalse(bateuMeta, "Should not have completed challenge");
        assertTrue(isParticipating, "Should be participating");
        assertEq(seasonId, 1, "Should be in season 1");
        assertFalse(hasWithdrawn, "Should not have withdrawn");
    }
    
    function testCanWithdraw() public {
        // Test when user has not completed challenge
        (bool canWithdraw1, string memory reason1) = pool.canWithdraw(user1);
        assertFalse(canWithdraw1, "User1 should not be able to withdraw");
        assertEq(reason1, "Nao pode sacar ainda", "Reason should be correct");
        
        // Test when user has completed challenge
        _addExercisesAs(user1, 900, 800, 70, "Complete challenge");
        (bool canWithdraw2, string memory reason2) = pool.canWithdraw(user1);
        assertTrue(canWithdraw2, "User1 should be able to withdraw after completing challenge");
        
        // Test when user has already withdrawn
        vm.prank(user1);
        pool.withdraw();
        (bool canWithdraw3, string memory reason3) = pool.canWithdraw(user1);
        assertFalse(canWithdraw3, "User1 should not be able to withdraw again");
        assertEq(reason3, "Ja sacou nesta temporada", "Reason should be correct");
        
        // Test when user is not a participant
        (bool canWithdraw4, string memory reason4) = pool.canWithdraw(address(0x99));
        assertFalse(canWithdraw4, "Non-participant should not be able to withdraw");
        assertEq(reason4, "Nao e um participante", "Reason should be correct");
    }
    
    function testLeaderboards() public {
        // Test getLeaderboardGeral
        (address[] memory addresses1, uint256[] memory values1) = pool.getLeaderboardGeral();
        assertEq(addresses1.length, 2, "Should have 2 addresses in general leaderboard");
        assertEq(addresses1[0], user2, "User2 should be first (420 total)");
        assertEq(addresses1[1], user1, "User1 should be second (330 total)");
        assertEq(values1[0], 300 + 100 + 20, "User2 should have 420 total");
        assertEq(values1[1], 100 + 200 + 30, "User1 should have 330 total");
        
        // Test getLeaderboardFlexoes
        (address[] memory addresses2, uint256[] memory values2) = pool.getLeaderboardFlexoes();
        assertEq(addresses2[0], user2, "User2 should be first in flexoes");
        assertEq(values2[0], 300, "User2 should have 300 flexoes");
        
        // Test getLeaderboardAbdominais
        (address[] memory addresses3, uint256[] memory values3) = pool.getLeaderboardAbdominais();
        assertEq(addresses3[0], user1, "User1 should be first in abdominais");
        assertEq(values3[0], 200, "User1 should have 200 abdominais");
        
        // Test getLeaderboardKm
        (address[] memory addresses4, uint256[] memory values4) = pool.getLeaderboardKm();
        assertEq(addresses4[0], user1, "User1 should be first in km");
        assertEq(values4[0], 30, "User1 should have 30 km");
    }
}