// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Participant as ParticipantStruct, WithdrawEligibility} from "../lib/Types.sol";

/**
 * @title Withdrawal
 * @dev Gerencia lógica de saque de depósitos
 *
 * Responsabilidades:
 * - Determinar elegibilidade para saque
 * - Executar transferências
 * - Validar regras de saque
 *
 * Regra: Pode sacar se:
 * 1. Completou todos os desafios (imediatamente), OU
 * 2. Temporada terminou (depois do fim)
 */
contract Withdrawal {
    // ============ FUNÇÕES INTERNAS ============

    /**
     * @dev Determina se usuário pode sacar
     *
     * @param p Dados do participante
     * @param hasCompleted Se completou os desafios
     * @param isSeasonActive Se temporada ainda está ativa
     *
     * @return can True se pode sacar
     * @return reason String explicando por quê
     */
    function _canWithdraw(
        ParticipantStruct memory p,
        bool hasCompleted,
        bool isSeasonActive
    ) internal pure returns (bool can, string memory reason) {
        // Já sacou?
        if (p.hasWithdrawn) {
            return (false, "Ja sacou nesta temporada");
        }

        // Se completou, pode sacar imediatamente
        if (hasCompleted) {
            return (true, "Pode sacar - completou a meta");
        }

        // Se não completou mas temporada terminou, pode sacar
        if (!isSeasonActive) {
            return (true, "Pode sacar - temporada encerrada");
        }

        // Caso contrário, não pode sacar
        return (false, "Nao pode sacar ainda");
    }

    /**
     * @dev Executa a transferência de saque
     *
     * @param user Endereço do usuário
     * @param amount Valor a transferir
     */
    function _executeWithdrawal(address payable user, uint256 amount) internal {
        (bool success, ) = user.call{value: amount}("");
        require(success, "Falha ao transferir ETH");
    }

    // Nota: Emissão de eventos é responsabilidade do contrato que chama

    // ============ FUNÇÕES PÚBLICAS (LEITURA) ============

    /**
     * @dev Determina elegibilidade para saque (pública para testes)
     */
    function canWithdraw(
        ParticipantStruct memory p,
        bool hasCompleted,
        bool isSeasonActive
    ) public pure returns (bool can, string memory reason) {
        return _canWithdraw(p, hasCompleted, isSeasonActive);
    }

    /**
     * @dev Valida se pode sacar antes de executar
     */
    function validateWithdrawal(
        ParticipantStruct memory p,
        bool hasCompleted,
        bool isSeasonActive
    ) public pure returns (bool) {
        (bool can, ) = _canWithdraw(p, hasCompleted, isSeasonActive);
        return can;
    }

    /**
     * @dev Retorna mensagem de elegibilidade
     */
    function getWithdrawReason(
        ParticipantStruct memory p,
        bool hasCompleted,
        bool isSeasonActive
    ) public pure returns (string memory) {
        (, string memory reason) = _canWithdraw(p, hasCompleted, isSeasonActive);
        return reason;
    }
}
