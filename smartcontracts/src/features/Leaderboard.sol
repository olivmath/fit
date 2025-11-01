// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Participant as ParticipantStruct} from "../lib/Types.sol";
import {ParticipantManager} from "../core/Participant.sol";

/**
 * @title Leaderboard
 * @dev Gera e mantém leaderboards
 *
 * Responsabilidades:
 * - Calcular leaderboards por tipo de exercício
 * - Ordenar participantes
 * - Filtrar por temporada atual
 *
 * Herda de ParticipantManager para ter acesso aos dados de participantes
 */
contract Leaderboard is ParticipantManager {
    // ============ TIPOS INTERNOS ============
    enum ExerciseType {
        GENERAL,
        FLEXOES,
        ABDOMINAIS,
        KM
    }

    // ============ FUNÇÕES INTERNAS ============

    /**
     * @dev Calcula valor de exercício baseado no tipo
     */
    function _getExerciseValue(
        ParticipantStruct memory p,
        ExerciseType exerciseType
    ) internal pure returns (uint256) {
        if (exerciseType == ExerciseType.FLEXOES) {
            return p.flexoes;
        } else if (exerciseType == ExerciseType.ABDOMINAIS) {
            return p.abdominais;
        } else if (exerciseType == ExerciseType.KM) {
            return p.km;
        } else {
            // GENERAL = total
            return p.flexoes + p.abdominais + p.km;
        }
    }

    /**
     * @dev Ordena leaderboard com bubble sort
     * Nota: Em produção, considerar off-chain sorting por performance
     */
    function _sortLeaderboard(
        address[] memory addresses,
        uint256[] memory values
    ) internal pure {
        require(addresses.length == values.length, "Length mismatch");

        for (uint256 i = 0; i < addresses.length; i++) {
            for (uint256 j = i + 1; j < addresses.length; j++) {
                if (values[j] > values[i]) {
                    // Swap addresses
                    address tempAddr = addresses[i];
                    addresses[i] = addresses[j];
                    addresses[j] = tempAddr;

                    // Swap values
                    uint256 tempVal = values[i];
                    values[i] = values[j];
                    values[j] = tempVal;
                }
            }
        }
    }

    // ============ FUNÇÕES PÚBLICAS (LEITURA) ============

    /**
     * @dev Gera leaderboard para um tipo de exercício
     *
     * @param currentSeasonId ID da temporada atual
     * @param exerciseType Tipo de exercício (0=geral, 1=flexões, 2=abdominais, 3=km)
     *
     * @return addresses Endereços ordenados
     * @return values Valores ordenados
     */
    function generateLeaderboard(
        uint256 currentSeasonId,
        uint256 exerciseType
    ) public view returns (address[] memory, uint256[] memory) {
        // Contar participantes da temporada atual
        uint256 currentSeasonCount = 0;
        for (uint256 i = 0; i < participantsList.length; i++) {
            if (participants[participantsList[i]].seasonId == currentSeasonId) {
                currentSeasonCount++;
            }
        }

        if (currentSeasonCount == 0) {
            return (new address[](0), new uint256[](0));
        }

        // Copiar apenas participantes da temporada atual
        address[] memory ranked = new address[](currentSeasonCount);
        uint256[] memory values = new uint256[](currentSeasonCount);

        uint256 index = 0;
        ExerciseType exType = ExerciseType(exerciseType);

        for (uint256 i = 0; i < participantsList.length; i++) {
            address addr = participantsList[i];
            if (participants[addr].seasonId == currentSeasonId) {
                ranked[index] = addr;
                values[index] = _getExerciseValue(
                    participants[addr],
                    exType
                );
                index++;
            }
        }

        // Ordenar
        _sortLeaderboard(ranked, values);

        return (ranked, values);
    }

    /**
     * @dev Calcula totais de exercício para a temporada
     */
    function calculateTotals(uint256 currentSeasonId)
        public
        view
        returns (
            uint256 totalFlex,
            uint256 totalAbd,
            uint256 totalKm,
            uint256 participantsCount
        )
    {
        for (uint256 i = 0; i < participantsList.length; i++) {
            address addr = participantsList[i];
            ParticipantStruct memory p = participants[addr];

            // Só contar participantes da temporada atual
            if (p.seasonId == currentSeasonId) {
                totalFlex += p.flexoes;
                totalAbd += p.abdominais;
                totalKm += p.km;
                participantsCount++;
            }
        }
    }

    /**
     * @dev Retorna posição de um usuário no leaderboard
     */
    function getUserRank(
        address user,
        uint256 currentSeasonId,
        uint256 exerciseType
    ) public view returns (uint256) {
        (address[] memory ranked, ) = generateLeaderboard(
            currentSeasonId,
            exerciseType
        );

        for (uint256 i = 0; i < ranked.length; i++) {
            if (ranked[i] == user) {
                return i + 1; // 1-indexed
            }
        }

        return 0; // Não encontrado
    }
}
