// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./BaseTest.sol";

contract WithdrawalTest is BaseTest {
    function setUp() public override {
        super.setUp();
        _depositAs(user1);
    }

    function testWithdrawAfterCompletingChallenge() public {
        // Given: usuário completou o desafio
        _addExercisesAs(user1, Constants.FLEXOES_META, Constants.ABDOMINAIS_META, Constants.KM_META, "Complete challenge");

        // When: usuário saca
        uint256 balanceBefore = user1.balance;
        vm.prank(user1);
        pool.withdraw();

        // Then: usuário recebe seu depósito de volta
        assertEq(user1.balance, balanceBefore + Constants.DEPOSIT_AMOUNT, "User should receive deposit back");
        (,,,,,, bool hasWithdrawn) = pool.getParticipantData(user1);
        assertTrue(hasWithdrawn, "User should be marked as withdrawn");
    }
    
    function testWithdrawAfterSeasonEnds() public {
        // Given: temporada terminou sem completar o desafio
        _advanceToNextSeason();
        
        // When: usuário tenta sacar
        vm.prank(user1);
        
        // Then: transação reverte
        vm.expectRevert("Nao pode sacar ainda");
        pool.withdraw();
    }
    
    function testWithdrawMultipleTimes() public {
        // Given: usuário já sacou
        _addExercisesAs(user1, Constants.FLEXOES_META, Constants.ABDOMINAIS_META, Constants.KM_META, "Complete challenge");
        vm.prank(user1);
        pool.withdraw();
        
        // When: usuário tenta sacar novamente
        vm.prank(user1);
        
        // Then: transação reverte
        vm.expectRevert("Ja sacou nesta temporada");
        pool.withdraw();
    }
    
    function testWithdrawSeasonActiveNotCompleted() public {
        // Given: temporada ativa mas desafio não completado
        _addExercisesAs(user1, 100, 200, 30, "Not enough");
        
        // When: usuário tenta sacar
        vm.prank(user1);
        
        // Then: transação reverte
        vm.expectRevert("Nao pode sacar ainda");
        pool.withdraw();
    }
    
    function testWithdrawNonParticipant() public {
        // When: não-participante tenta sacar
        vm.prank(user2);
        
        // Then: transação reverte
        vm.expectRevert("Nao e um participante");
        pool.withdraw();
    }
}