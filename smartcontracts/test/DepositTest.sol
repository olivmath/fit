// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./BaseTest.sol";

contract DepositTest is BaseTest {
    function testDepositSuccess() public {
        // Given: temporada está ativa (default state)
        // When: usuário chama deposit() com 0.005 ETH
        vm.prank(user1);
        pool.deposit{value: Constants.DEPOSIT_AMOUNT}();
        
        // Then: usuário é adicionado como participante
        (,,,,bool isParticipating, uint256 seasonId,) = pool.getParticipantData(user1);
        assertTrue(isParticipating, "User should be participating");
        assertEq(seasonId, 1, "User should be in season 1");
    }
    
    function testDepositIncorrectValue() public {
        // Given: temporada está ativa
        // When: usuário tenta depositar valor errado
        vm.prank(user1);
        
        // Then: transação reverte
        vm.expectRevert("Deposito deve ser exatamente 0.005 ETH");
        pool.deposit{value: 0.004 ether}();
    }
    
    function testDepositAlreadyParticipated() public {
        // Given: usuário já depositou nesta temporada
        _depositAs(user1);
        
        // When: usuário tenta depositar novamente
        vm.prank(user1);
        
        // Then: transação reverte
        vm.expectRevert("Ja participou desta temporada");
        pool.deposit{value: Constants.DEPOSIT_AMOUNT}();
    }
    
    function testDepositSeasonEnded() public {
        // Given: temporada terminou
        _advanceToNextSeason();
        
        // When: usuário tenta depositar na temporada anterior
        vm.roll(block.number - 1); // Volta um bloco para tentar depositar na temporada anterior
        vm.prank(user1);
        
        // Then: transação reverte
        vm.expectRevert("Temporada ja terminou");
        pool.deposit{value: Constants.DEPOSIT_AMOUNT}();
    }
    
    function testDepositAfterWithdrawalSameSeason() public {
        // Given: usuário já depositou e sacou nesta temporada
        _depositAs(user1);
        
        // Complete challenge
        _addExercisesAs(user1, Constants.META_FLEXOES, Constants.META_ABDOMINAIS, Constants.META_KM, "Complete challenge");
        
        // Withdraw
        vm.prank(user1);
        pool.withdraw();
        
        // When: usuário tenta depositar novamente na MESMA temporada
        vm.prank(user1);
        
        // Then: transação reverte
        vm.expectRevert("Ja participou desta temporada");
        pool.deposit{value: Constants.DEPOSIT_AMOUNT}();
    }
}