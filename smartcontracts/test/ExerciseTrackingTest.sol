// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./BaseTest.sol";
import {Events} from "../src/lib/Events.sol";

contract ExerciseTrackingTest is BaseTest, Events {
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
        emit MetaBatida(user1);
        _addExercisesAs(user1, Constants.FLEXOES_META, Constants.ABDOMINAIS_META, Constants.KM_META, "Meta completa");

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
        vm.prank(user1);
        
        // Then: transação reverte
        vm.expectRevert("Deve adicionar pelo menos um exercicio");
        pool.addExercises(0, 0, 0, "Valores zero");
    }
    
    function testAddExercisesExceedMaxFlexoes() public {
        // When: usuário tenta adicionar mais que o máximo de flexões
        vm.prank(user1);

        // Then: transação reverte
        vm.expectRevert("Muitas flexoes de uma vez");
        pool.addExercises(Constants.MAX_FLEXOES_SUBMISSION + 1, 0, 0, "Excede max flexoes");
    }

    function testAddExercisesExceedMaxAbdominais() public {
        // When: usuário tenta adicionar mais que o máximo de abdominais
        vm.prank(user1);

        // Then: transação reverte
        vm.expectRevert("Muitos abdominais de uma vez");
        pool.addExercises(0, Constants.MAX_ABDOMINAIS_SUBMISSION + 1, 0, "Excede max abdominais");
    }

    function testAddExercisesExceedMaxKm() public {
        // When: usuário tenta adicionar mais que o máximo de km
        vm.prank(user1);

        // Then: transação reverte
        vm.expectRevert("Muitos km de uma vez");
        pool.addExercises(0, 0, Constants.MAX_KM_SUBMISSION + 1, "Excede max km");
    }
    
    function testAddExercisesSeasonEnded() public {
        // Given: temporada terminou
        _advanceToNextSeason();
        _depositAs(user2); // Trigger season advance
        
        // When: usuário da temporada anterior tenta adicionar exercícios
        vm.prank(user1);
        
        // Then: transação reverte
        vm.expectRevert("Nao participou desta temporada");
        pool.addExercises(100, 200, 30, "Temporada terminada");
    }
}