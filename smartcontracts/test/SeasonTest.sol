// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./BaseTest.sol";

contract SeasonTest is BaseTest {
    function testAutomaticSeasonAdvance() public {
        // Given: temporada 1 está ativa
        assertEq(pool.getCurrentSeasonId(), 1, "Should be season 1");
        
        // When: blocos avançam além da duração da temporada
        _advanceToNextSeason();
        
        // Then: temporada avança automaticamente
        assertEq(pool.getCurrentSeasonId(), 2, "Should advance to season 2");
    }
    
    function testExerciseResetBetweenSeasons() public {
        // Given: usuário depositou e adicionou exercícios na temporada 1
        _depositAs(user1);
        _addExercisesAs(user1, 100, 200, 30, "Season 1 exercises");
        
        // When: temporada avança
        _advanceToNextSeason();
        
        // Then: exercícios não são carregados para próxima temporada
        (uint256 flexoes, uint256 abdominais, uint256 km,,,,) = pool.getParticipantData(user1);
        assertEq(flexoes, 100, "Exercises should remain in season 1 data");
        assertEq(abdominais, 200, "Exercises should remain in season 1 data");
        assertEq(km, 30, "Exercises should remain in season 1 data");
        
        // And: usuário pode depositar na nova temporada
        vm.prank(user1);
        pool.deposit{value: Constants.DEPOSIT_AMOUNT}();
        
        // And: novos exercícios começam do zero
        _addExercisesAs(user1, 50, 50, 10, "Season 2 exercises");
        (flexoes, abdominais, km,,,,) = pool.getParticipantData(user1);
        assertEq(flexoes, 50, "Should have 50 flexoes in season 2");
        assertEq(abdominais, 50, "Should have 50 abdominais in season 2");
        assertEq(km, 10, "Should have 10 km in season 2");
    }
    
    function testDepositNextSeason() public {
        // Given: usuário depositou na temporada 1
        _depositAs(user1);
        
        // When: temporada avança
        _advanceToNextSeason();
        
        // Then: usuário pode depositar na temporada 2
        vm.prank(user1);
        pool.deposit{value: Constants.DEPOSIT_AMOUNT}();
        
        // And: está participando da temporada 2
        (,,,,bool isParticipating, uint256 seasonId,) = pool.getParticipantData(user1);
        assertTrue(isParticipating, "User should be participating");
        assertEq(seasonId, 2, "User should be in season 2");
    }
    
    function testLeaderboardsShowOnlyCurrentSeason() public {
        // Given: usuários depositaram e adicionaram exercícios na temporada 1
        _depositAs(user1);
        _depositAs(user2);
        _addExercisesAs(user1, 100, 200, 30, "User1 season 1");
        _addExercisesAs(user2, 300, 100, 20, "User2 season 1");
        
        // When: verificamos leaderboard na temporada 1
        (address[] memory addresses1, uint256[] memory values1) = pool.getLeaderboardGeral();
        assertEq(addresses1.length, 2, "Should have 2 addresses in season 1 leaderboard");
        
        // When: temporada avança e novos usuários participam
        _advanceToNextSeason();
        _depositAs(user3);
        _addExercisesAs(user3, 500, 500, 50, "User3 season 2");
        
        // Then: leaderboard mostra apenas participantes da temporada atual
        (address[] memory addresses2, uint256[] memory values2) = pool.getLeaderboardGeral();
        assertEq(addresses2.length, 1, "Should have 1 address in season 2 leaderboard");
        assertEq(addresses2[0], user3, "Should be user3 in season 2 leaderboard");
    }
}