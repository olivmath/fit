// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Events
 * @dev Centraliza todos os eventos do sistema
 */
interface Events {
    // ============ PARTICIPAÇÃO ============
    event DepositoRealizado(
        address indexed user,
        uint256 amount,
        uint256 indexed seasonId
    );

    event SaqueRealizado(
        address indexed user,
        uint256 amount,
        bool completedChallenge,
        uint256 indexed seasonId
    );

    // ============ EXERCÍCIOS ============
    event ExerciciosAdicionados(
        address indexed user,
        uint256 flexoes,
        uint256 abdominais,
        uint256 km,
        string mensagemMotivacional
    );

    event MetaBatida(address indexed user);

    // ============ TEMPORADAS ============
    event NovaTemporadaIniciada(
        uint256 indexed seasonId,
        uint256 startBlock,
        uint256 endBlock
    );
}
