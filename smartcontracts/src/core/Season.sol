// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Constants} from "../lib/Constants.sol";

/**
 * @title Season
 * @dev Gerencia temporadas automáticas
 *
 * Responsabilidades:
 * - Rastrear temporada atual
 * - Detectar automaticamente transição de temporada
 * - Fornecer informações sobre temporada
 *
 * Nota: Emissão de eventos é responsabilidade do contrato que chama
 */
contract Season {
    // ============ ESTADO ============
    uint256 public currentSeasonId;
    uint256 public seasonStartBlock;

    // ============ CONSTRUTOR ============
    constructor() {
        currentSeasonId = 1;
        seasonStartBlock = block.number;
        // Nota: Evento é emitido pelo ChallengePool.constructor()
    }

    // ============ FUNÇÕES INTERNAS ============

    /**
     * @dev Verifica se temporada terminou e inicia nova se necessário
     * Retorna true se houve avanço de temporada
     * Nota: Evento é emitido pelo ChallengePool que chama essa função
     */
    function _checkAndAdvanceSeason() internal returns (bool advanced) {
        if (block.number >= seasonStartBlock + Constants.SEASON_DURATION_BLOCKS) {
            currentSeasonId++;
            seasonStartBlock = block.number;
            return true;
        }
        return false;
    }

    /**
     * @dev Retorna se a temporada está ativa
     */
    function _isSeasonActive() internal view returns (bool) {
        return block.number < seasonStartBlock + Constants.SEASON_DURATION_BLOCKS;
    }

    /**
     * @dev Retorna bloco final da temporada atual
     */
    function _getCurrentSeasonEndBlock() internal view returns (uint256) {
        return seasonStartBlock + Constants.SEASON_DURATION_BLOCKS;
    }

    /**
     * @dev Retorna blocos restantes na temporada
     */
    function _getBlocksRemaining() internal view returns (uint256) {
        uint256 endBlock = _getCurrentSeasonEndBlock();
        if (block.number >= endBlock) {
            return 0;
        }
        return endBlock - block.number;
    }

    // ============ FUNÇÕES PÚBLICAS (LEITURA) ============

    /**
     * @dev Retorna informações completas da temporada atual
     */
    function getCurrentSeasonInfo()
        public
        view
        returns (
            uint256 seasonId,
            uint256 startBlock,
            uint256 endBlock,
            uint256 blocksRemaining,
            bool isActive
        )
    {
        uint256 endBlock_local = _getCurrentSeasonEndBlock();
        uint256 blocksRemaining_local = _getBlocksRemaining();
        bool isActive_local = block.number < endBlock_local;

        return (
            currentSeasonId,
            seasonStartBlock,
            endBlock_local,
            blocksRemaining_local,
            isActive_local
        );
    }

    /**
     * @dev Retorna informações resumidas da temporada
     */
    function getSeasonInfo()
        public
        view
        returns (
            uint256 seasonId,
            uint256 startBlock,
            uint256 endBlock
        )
    {
        return (
            currentSeasonId,
            seasonStartBlock,
            _getCurrentSeasonEndBlock()
        );
    }
}
