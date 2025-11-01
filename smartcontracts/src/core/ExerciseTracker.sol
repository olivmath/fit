// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Constants} from "../lib/Constants.sol";

/**
 * @title ExerciseTracker
 * @dev Rastreia e valida exercícios
 *
 * Responsabilidades:
 * - Validar entrada de exercícios
 * - Registrar exercícios adicionados
 * - Determinar quando metas são atingidas
 */
contract ExerciseTracker {

    // ============ FUNÇÕES INTERNAS ============

    /**
     * @dev Valida valores de exercício
     * Reverte se algum valor exceder o limite permitido
     */
    function _validateExerciseInput(
        uint256 flexoes,
        uint256 abdominais,
        uint256 km
    ) internal pure {
        require(
            flexoes > 0 || abdominais > 0 || km > 0,
            "Deve adicionar pelo menos um exercicio"
        );

        require(
            flexoes <= Constants.MAX_FLEXOES_SUBMISSION,
            "Muitas flexoes de uma vez"
        );

        require(
            abdominais <= Constants.MAX_ABDOMINAIS_SUBMISSION,
            "Muitos abdominais de uma vez"
        );

        require(
            km <= Constants.MAX_KM_SUBMISSION,
            "Muitos km de uma vez"
        );
    }

    // Nota: Emissão de eventos é responsabilidade do contrato que chama

    // ============ FUNÇÕES PÚBLICAS (LEITURA) ============

    /**
     * @dev Valida entrada de exercício (pública para testes)
     */
    function validateExerciseInput(
        uint256 flexoes,
        uint256 abdominais,
        uint256 km
    ) public pure {
        _validateExerciseInput(flexoes, abdominais, km);
    }

    /**
     * @dev Retorna totais de exercícios de um participante
     */
    function getExerciseTotals(address user)
        public
        view
        returns (
            uint256 flexoes,
            uint256 abdominais,
            uint256 km
        )
    {
        // Implementação será delegada ao Participant
        // Este é apenas um ponto de acesso lógico
    }

    /**
     * @dev Calcula progresso em direção a uma meta
     * Retorna percentual (0-100)
     */
    function calculateGoalProgress(
        uint256 current,
        uint256 target
    ) public pure returns (uint256) {
        if (target == 0) return 0;
        return (current * 100) / target;
    }
}
