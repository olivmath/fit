// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Types
 * @dev Define tipos e estruturas compartilhadas
 */

/// @dev Dados de um participante em uma temporada
struct Participant {
    uint256 flexoes;
    uint256 abdominais;
    uint256 km;
    uint256 depositAmount;
    uint256 depositBlock;
    uint256 seasonId;
    bool hasWithdrawn;
}

/// @dev Informações de uma temporada
struct SeasonInfo {
    uint256 seasonId;
    uint256 startBlock;
    uint256 endBlock;
    uint256 blocksRemaining;
    bool isActive;
}

/// @dev Resultado de verificação de saque
struct WithdrawEligibility {
    bool canWithdraw;
    string reason;
}

/// @dev Resultado de leaderboard
struct LeaderboardEntry {
    address user;
    uint256 value;
}
