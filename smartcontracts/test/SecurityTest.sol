// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./BaseTest.sol";

contract SecurityTest is BaseTest {
    function setUp() public override {
        super.setUp();
    }

    function testNoRoundingLoss() public {
        // When: Múltiplos usuários depositam
        _depositAs(user1);
        _depositAs(user2);
        _depositAs(user3);
        
        // Then: O saldo do contrato deve ser exatamente igual à soma dos depósitos
        uint256 expectedBalance = Constants.DEPOSIT_VALUE * 3;
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
        pool.deposit{value: Constants.DEPOSIT_VALUE}();
        
        uint256 maxUint = type(uint256).max;
        vm.expectRevert("Flexoes excede o limite maximo");
        pool.addExercises(maxUint, 100, 10, "Too many flexoes");
        
        vm.expectRevert("Abdominais excede o limite maximo");
        pool.addExercises(100, maxUint, 10, "Too many abdominais");
        
        vm.expectRevert("Km excede o limite maximo");
        pool.addExercises(100, 100, maxUint, "Too many km");
        
        vm.stopPrank();
    }
    
    function testCorrectEventEmissions() public {
        // When: Usuário deposita
        vm.expectEmit(true, false, false, true);
        emit Deposit(user1, Constants.DEPOSIT_VALUE, 1);
        vm.prank(user1);
        pool.deposit{value: Constants.DEPOSIT_VALUE}();
        
        // When: Usuário adiciona exercícios
        vm.expectEmit(true, false, false, true);
        emit ExerciseAdded(user1, 100, 200, 30, "Test exercises");
        vm.prank(user1);
        pool.addExercises(100, 200, 30, "Test exercises");
        
        // When: Usuário completa o desafio
        _addExercisesAs(user1, 900, 800, 70, "Complete challenge");
        
        // When: Usuário saca
        vm.expectEmit(true, false, false, true);
        emit Withdrawal(user1, Constants.DEPOSIT_VALUE, 1);
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
        
        // Add exercises close to the maximum
        _addExercisesAs(user1, Constants.MAX_FLEXOES - 10, 0, 0, "Almost max flexoes");
        
        // Try to add more than the remaining allowed (should fail)
        vm.expectRevert("Flexoes excede o limite maximo");
        vm.prank(user1);
        pool.addExercises(20, 0, 0, "Overflow flexoes");
        
        // Similar tests for abdominais and km
        _addExercisesAs(user1, 0, Constants.MAX_ABDOMINAIS - 10, 0, "Almost max abdominais");
        vm.expectRevert("Abdominais excede o limite maximo");
        vm.prank(user1);
        pool.addExercises(0, 20, 0, "Overflow abdominais");
        
        _addExercisesAs(user1, 0, 0, Constants.MAX_KM - 1, "Almost max km");
        vm.expectRevert("Km excede o limite maximo");
        vm.prank(user1);
        pool.addExercises(0, 0, 2, "Overflow km");
    }
}