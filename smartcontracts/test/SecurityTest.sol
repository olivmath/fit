// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./BaseTest.sol";
import {Events} from "../src/lib/Events.sol";

contract SecurityTest is BaseTest, Events {
    function setUp() public override {
        super.setUp();
    }

    function testNoRoundingLoss() public {
        // When: Múltiplos usuários depositam
        _depositAs(user1);
        _depositAs(user2);
        _depositAs(user3);

        // Then: O saldo do contrato deve ser exatamente igual à soma dos depósitos
        uint256 expectedBalance = Constants.DEPOSIT_AMOUNT * 3;
        assertEq(address(pool).balance, expectedBalance, "Contract balance should match total deposits");

        // When: Todos os usuários completam o desafio e sacam
        _addExercisesAs(user1, 1000, 1000, 100, "Complete challenge user1");
        _addExercisesAs(user2, 1000, 1000, 100, "Complete challenge user2");
        _addExercisesAs(user3, 1000, 1000, 100, "Complete challenge user3");

        vm.prank(user1);
        pool.withdraw();
        vm.prank(user2);
        pool.withdraw();
        vm.prank(user3);
        pool.withdraw();

        // Then: O saldo do contrato deve ser zero
        assertEq(address(pool).balance, 0, "Contract balance should be zero after all withdrawals");
    }
    
    function testInputValidation() public {
        // When: Tentativa de adicionar exercícios com valores negativos
        // Then: Deve falhar (Solidity não permite valores negativos para uint)
        
        // When: Tentativa de adicionar exercícios com valores muito grandes
        vm.startPrank(user1);
        pool.deposit{value: Constants.DEPOSIT_AMOUNT}();
        
        uint256 maxFlexoes = Constants.MAX_FLEXOES_SUBMISSION;
        vm.expectRevert("Muitas flexoes de uma vez");
        pool.addExercises(maxFlexoes + 1, 100, 10, "Too many flexoes");
        
        uint256 maxAbdominais = Constants.MAX_ABDOMINAIS_SUBMISSION;
        vm.expectRevert("Muitos abdominais de uma vez");
        pool.addExercises(100, maxAbdominais + 1, 10, "Too many abdominais");
        
        uint256 maxKm = Constants.MAX_KM_SUBMISSION;
        vm.expectRevert("Muitos km de uma vez");
        pool.addExercises(100, 100, maxKm + 1, "Too many km");
        
        vm.stopPrank();
    }
    
    function testCorrectEventEmissions() public {
        // When: Usuário deposita
        vm.expectEmit(true, false, false, true);
        emit DepositoRealizado(user1, Constants.DEPOSIT_AMOUNT, 1);
        vm.prank(user1);
        pool.deposit{value: Constants.DEPOSIT_AMOUNT}();

        // When: Usuário adiciona exercícios
        vm.expectEmit(true, false, false, true);
        emit ExerciciosAdicionados(user1, 100, 200, 30, "Test exercises");
        vm.prank(user1);
        pool.addExercises(100, 200, 30, "Test exercises");

        // When: Usuário completa o desafio
        _addExercisesAs(user1, 900, 800, 70, "Complete challenge");

        // When: Usuário saca
        vm.expectEmit(true, false, false, true);
        emit SaqueRealizado(user1, Constants.DEPOSIT_AMOUNT, true, 1);
        vm.prank(user1);
        pool.withdraw();
    }
    
    function testNoReentrancyVulnerability() public {
        // Setup a malicious contract that could attempt reentrancy
        // This is a simplified test since we don't have an actual attacker contract
        
        // Ensure withdraw function has proper checks
        _depositAs(user1);
        _addExercisesAs(user1, 1000, 1000, 100, "Complete challenge");
        
        vm.prank(user1);
        pool.withdraw();
        
        // Attempt to withdraw again (should fail)
        vm.expectRevert("Ja sacou nesta temporada");
        vm.prank(user1);
        pool.withdraw();
    }
    
    function testOverflowProtection() public {
        // When: Usuário tenta adicionar exercícios que causariam overflow
        _depositAs(user1);

        // Add exercises to have a non-zero starting point
        _addExercisesAs(user1, 100, 100, 10, "Initial exercises");

        // Try to add exercises that would cause an overflow
        vm.expectRevert(); // Expect a silent revert from overflow
        vm.prank(user1);
        pool.addExercises(type(uint256).max, 0, 0, "Overflow flexoes");

        vm.expectRevert(); // Expect a silent revert from overflow
        vm.prank(user1);
        pool.addExercises(0, type(uint256).max, 0, "Overflow abdominais");

        vm.expectRevert(); // Expect a silent revert from overflow
        vm.prank(user1);
        pool.addExercises(0, 0, type(uint256).max, "Overflow km");
    }
}