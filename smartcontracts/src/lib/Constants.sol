// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Constants
 * @dev Centraliza todas as constantes do sistema
 */
library Constants {
    // ============ VALORES FIXOS ============
    uint256 public constant DEPOSIT_AMOUNT = 0.005 ether;

    // ============ METAS DO DESAFIO ============
    uint256 public constant FLEXOES_META = 1000;
    uint256 public constant ABDOMINAIS_META = 1000;
    uint256 public constant KM_META = 100;

    // ============ TEMPORADAS ============
    // Arbitrum: ~0.25 segundos por bloco
    // 30 dias = 30 * 24 * 60 * 60 / 0.25 = 10,368,000 blocos
    uint256 public constant SEASON_DURATION_BLOCKS = 10_368_000;

    // ============ VALIDAÇÕES (ANTI-SPAM) ============
    uint256 public constant MAX_FLEXOES_SUBMISSION = 100_000;
    uint256 public constant MAX_ABDOMINAIS_SUBMISSION = 100_000;
    uint256 public constant MAX_KM_SUBMISSION = 1_000;
}
