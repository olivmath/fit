// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Participant as ParticipantStruct} from "../lib/Types.sol";
import {Constants} from "../lib/Constants.sol";

/**
 * @title ParticipantManager
 * @dev Gerencia dados e estado de participantes
 *
 * Responsabilidades:
 * - Armazenar dados de participantes
 * - Rastrear participação por temporada
 * - Fornecer interface de leitura de dados
 *
 * Nota: Emissão de eventos é responsabilidade do contrato que chama
 */
contract ParticipantManager {
    // ============ ESTADO ============
    mapping(address => ParticipantStruct) public participants;
    mapping(address => mapping(uint256 => bool)) public participatedInSeason;
    address[] public participantsList;
    mapping(address => bool) public isParticipant;

    // ============ FUNÇÕES INTERNAS ============

    /**
     * @dev Registra novo participante em uma temporada
     * Nota: Quem chama essa função é responsável por emitir o evento
     */
    function _registerParticipant(
        address user,
        uint256 seasonId
    ) internal {
        // Se é novo participante global, adicionar à lista
        if (!isParticipant[user]) {
            isParticipant[user] = true;
            participantsList.push(user);
        }

        // Criar novo registro para esta temporada
        participants[user] = ParticipantStruct({
            flexoes: 0,
            abdominais: 0,
            km: 0,
            depositAmount: Constants.DEPOSIT_AMOUNT,
            depositBlock: block.number,
            seasonId: seasonId,
            hasWithdrawn: false
        });

        participatedInSeason[user][seasonId] = true;
    }

    /**
     * @dev Marca participante como tendo sacado
     */
    function _markAsWithdrawn(address user) internal {
        participants[user].hasWithdrawn = true;
    }

    /**
     * @dev Adiciona exercícios ao participante
     */
    function _addExercises(
        address user,
        uint256 flexoes,
        uint256 abdominais,
        uint256 km
    ) internal {
        participants[user].flexoes += flexoes;
        participants[user].abdominais += abdominais;
        participants[user].km += km;
    }

    // ============ FUNÇÕES PÚBLICAS (LEITURA) ============

    /**
     * @dev Retorna dados completos de um participante
     */
    function getParticipantData(address user)
        public
        view
        returns (
            uint256 flexoes,
            uint256 abdominais,
            uint256 km,
            bool bateuMeta,
            bool isParticipating,
            uint256 seasonId,
            bool hasWithdrawn
        )
    {
        if (!isParticipant[user]) {
            return (0, 0, 0, false, false, 0, false);
        }

        ParticipantStruct memory p = participants[user];
        bool hasCompleted = _hasCompletedChallenge(user);

        return (
            p.flexoes,
            p.abdominais,
            p.km,
            hasCompleted,
            p.seasonId > 0, // isParticipating baseado em seasonId existente
            p.seasonId,
            p.hasWithdrawn
        );
    }

    /**
     * @dev Retorna se participante completou os desafios
     */
    function hasCompletedChallenge(address user) public view returns (bool) {
        return _hasCompletedChallenge(user);
    }

    /**
     * @dev Retorna número total de participantes (histórico)
     */
    function getParticipantsCount() public view returns (uint256) {
        return participantsList.length;
    }

    /**
     * @dev Retorna lista de todos os participantes
     */
    function getParticipantsList() public view returns (address[] memory) {
        return participantsList;
    }

    // ============ FUNÇÕES INTERNAS (LÓGICA) ============

    /**
     * @dev Verifica se participante bateu a meta
     * Calcula on-demand, sem armazenar em storage
     */
    function _hasCompletedChallenge(address user) internal view returns (bool) {
        if (!isParticipant[user]) {
            return false;
        }
        ParticipantStruct memory p = participants[user];
        return p.flexoes >= Constants.FLEXOES_META &&
               p.abdominais >= Constants.ABDOMINAIS_META &&
               p.km >= Constants.KM_META;
    }
}
