// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./BaseTest.sol";

contract ExerciseTrackingTest is BaseTest {
    function setUp() public override {
        super.setUp();
        _depositAs(user1);
    }

    function testAddExercisesSuccess() public {
        // When: usuário adiciona exercícios válidos
        _addExercisesAs(user1, 100, 200, 30, "Exercicios validos");
        
        // Then: exercícios são registrados corretamente
        (uint256 flexoes, uint256 abdominais, uint256 km,,,,) = pool.getParticipantData(user1);
        assertEq(flexoes, 100, "Should have 100 flexoes");
        assertEq(abdominais, 200, "Should have 200 abdominais");
        assertEq(km, 30, "Should have 30 km");
    }
    
    function testMetaBatidaEvent() public {
        // When: usuário completa todas as metas
        vm.expectEmit(true, false, false, false);
        emit Events.MetaBatida(user1);
        _addExercisesAs(user1, Constants.META_FLEXOES, Constants.META_ABDOMINAIS, Constants.META_KM, "Meta completa");
        
        // Then: evento MetaBatida é emitido
        (,,,bool bateuMeta,,,) = pool.getParticipantData(user1);
        assertTrue(bateuMeta, "Should have completed challenge");
    }
    
    function testAddExercisesNonParticipant() public {
        // When: não-participante tenta adicionar exercícios
        vm.prank(user2);
        
        // Then: transação reverte
        vm.expectRevert("Nao e um participante");
        pool.addExercises(100, 200, 30, "Nao participante");
    }
    
    function testAddExercisesZeroValues() public {
        // When: usuário adiciona exercícios com valores zero
        _addExercisesAs(user1, 0, 0, 0, "Valores zero");
        
        // Then: transação é aceita mas não altera valores
        (uint256 flexoes, uint256 abdominais, uint256 km,,,,) = pool.getParticipantData(user1);
        assertEq(flexoes, 0, "Should have 0 flexoes");
        assertEq(abdominais, 0, "Should have 0 abdominais");
        assertEq(km, 0, "Should have 0 km");
    }
    
    function testAddExercisesExceedMaxFlexoes() public {
        // When: usuário tenta adicionar mais que o máximo de flexões
        vm.prank(user1);
        
        // Then: transação reverte
        vm.expectRevert("Valor de flexoes excede o maximo");
        pool.addExercises(Constants.MAX_FLEXOES + 1, 0, 0, "Excede max flexoes");
    }
    
    function testAddExercisesExceedMaxAbdominais() public {
        // When: usuário tenta adicionar mais que o máximo de abdominais
        vm.prank(user1);
        
        // Then: transação reverte
        vm.expectRevert("Valor de abdominais excede o maximo");
        pool.addExercises(0, Constants.MAX_ABDOMINAIS + 1, 0, "Excede max abdominais");
    }
    
    function testAddExercisesExceedMaxKm() public {
        // When: usuário tenta adicionar mais que o máximo de km
        vm.prank(user1);
        
        // Then: transação reverte
        vm.expectRevert("Valor de km excede o maximo");
        pool.addExercises(0, 0, Constants.MAX_KM + 1, "Excede max km");
    }
    
    function testAddExercisesSeasonEnded() public {
        // Given: temporada terminou
        _advanceToNextSeason();
        
        // When: usuário tenta adicionar exercícios na temporada anterior
        vm.prank(user1);
        
        // Then: transação reverte
        vm.expectRevert("Temporada ja terminou");
        pool.addExercises(100, 200, 30, "Temporada terminada");
    }
}