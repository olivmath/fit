// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Season} from "./core/Season.sol";
import {ParticipantManager} from "./core/Participant.sol";
import {ExerciseTracker} from "./core/ExerciseTracker.sol";
import {Withdrawal} from "./features/Withdrawal.sol";
import {Leaderboard} from "./features/Leaderboard.sol";
import {Constants} from "./lib/Constants.sol";
import {Events} from "./lib/Events.sol";
import {Participant as ParticipantStruct, WithdrawEligibility} from "./lib/Types.sol";

/**
 * @title ChallengePool
 * @dev Orquestrador principal que compõe todos os módulos
 *
 * Responsabilidades:
 * - Compor módulos via composição
 * - Expor interface pública unificada
 * - Garantir regras de negócio
 *
 * Arquitetura:
 * - Season: gerencia temporadas automáticas
 * - ParticipantManager: armazena dados de participantes
 * - ExerciseTracker: valida e rastreia exercícios
 * - Withdrawal: lógica de saque
 * - Leaderboard: gera leaderboards
 */
contract ChallengePool is
    Season,
    ParticipantManager,
    ExerciseTracker,
    Withdrawal,
    Leaderboard,
    Events
{
    // ============ MODIFICADORES ============

    /**
     * @dev Requer que seja temporada ativa
     */
    modifier onlyDuringCurrentSeason() {
        _checkAndEmitSeasonAdvance();
        require(_isSeasonActive(), "Temporada ja terminou");
        _;
    }

    /**
     * @dev Requer que seja participante
     */
    modifier onlyParticipant() {
        require(isParticipant[msg.sender], "Nao e um participante");
        _;
    }

    /**
     * @dev Requer que seja participante desta temporada
     */
    modifier onlyCurrentSeasonParticipant() {
        require(
            isParticipant[msg.sender],
            "Nao e um participante"
        );
        require(
            participants[msg.sender].seasonId == currentSeasonId,
            "Nao participou desta temporada"
        );
        _;
    }

    // ============ FUNÇÕES INTERNAS ============

    /**
     * @dev Verifica se temporada avançou e emite evento
     */
    function _checkAndEmitSeasonAdvance() internal {
        bool advanced = _checkAndAdvanceSeason();
        if (advanced) {
            emit NovaTemporadaIniciada(
                currentSeasonId,
                seasonStartBlock,
                seasonStartBlock + Constants.SEASON_DURATION_BLOCKS
            );
        }
    }

    // ============ CONSTRUTOR ============

    /**
     * @dev Inicializa o contrato
     * Herda de Season (inicia temporada 1)
     */
    constructor() Season() {
        emit NovaTemporadaIniciada(
            currentSeasonId,
            seasonStartBlock,
            seasonStartBlock + Constants.SEASON_DURATION_BLOCKS
        );
    }

    // ============ FUNÇÕES PÚBLICAS (PARTICIPAÇÃO) ============

    /**
     * @dev Usuário deposita 0.005 ETH para entrar na temporada
     *
     * Regra: pode depositar apenas 1x por temporada
     * Valor: exatamente 0.005 ETH
     * Período: apenas durante temporada ativa
     */
    function deposit() public payable onlyDuringCurrentSeason {
        require(
            msg.value == Constants.DEPOSIT_AMOUNT,
            "Deposito deve ser exatamente 0.005 ETH"
        );
        require(
            !participatedInSeason[msg.sender][currentSeasonId],
            "Ja participou desta temporada"
        );

        _registerParticipant(msg.sender, currentSeasonId);
        emit DepositoRealizado(msg.sender, Constants.DEPOSIT_AMOUNT, currentSeasonId);
    }

    // ============ FUNÇÕES PÚBLICAS (EXERCÍCIOS) ============

    /**
     * @dev Adiciona exercícios para o usuário
     *
     * @param flexoes Quantidade de flexões (pode ser 0)
     * @param abdominais Quantidade de abdominais (pode ser 0)
     * @param km Quantidade de km (pode ser 0)
     * @param mensagem Mensagem motivacional opcional
     *
     * Regra: pelo menos 1 exercício deve ser > 0
     * Validação: cada tipo tem limite máximo (anti-spam)
     * Evento: MetaBatida se completar todos os desafios
     */
    function addExercises(
        uint256 flexoes,
        uint256 abdominais,
        uint256 km,
        string memory mensagem
    ) public onlyDuringCurrentSeason onlyCurrentSeasonParticipant {
        // Validar entrada
        _validateExerciseInput(flexoes, abdominais, km);

        // Adicionar exercícios
        _addExercises(msg.sender, flexoes, abdominais, km);

        // Emitir evento de exercício adicionado
        emit ExerciciosAdicionados(msg.sender, flexoes, abdominais, km, mensagem);

        // Verificar se completou desafio
        if (_hasCompletedChallenge(msg.sender)) {
            emit MetaBatida(msg.sender);
        }
    }

    // ============ FUNÇÕES PÚBLICAS (SAQUE) ============

    /**
     * @dev Saca o depósito
     *
     * Regra: pode sacar se:
     * 1. Completou todos os desafios (imediatamente), OU
     * 2. Temporada terminou
     *
     * Valor: exatamente 0.005 ETH (seu depósito)
     * Uma vez por temporada
     */
    function withdraw() public onlyParticipant {
        _checkAndEmitSeasonAdvance();

        ParticipantStruct memory p = participants[msg.sender];

        require(
            !p.hasWithdrawn,
            "Ja sacou nesta temporada"
        );

        bool hasCompleted = _hasCompletedChallenge(msg.sender);
        bool isSeasonActive = _isSeasonActive();

        // Verificar elegibilidade
        (bool can, ) = _canWithdraw(p, hasCompleted, isSeasonActive);
        require(can, "Nao pode sacar ainda");

        // Marcar como sacado
        _markAsWithdrawn(msg.sender);

        // Executar transferência
        _executeWithdrawal(payable(msg.sender), p.depositAmount);

        // Emitir evento
        emit SaqueRealizado(msg.sender, p.depositAmount, hasCompleted, p.seasonId);
    }

    // ============ FUNÇÕES PÚBLICAS (INFORMAÇÕES) ============

    /**
     * @dev Retorna dados gerais do contrato para exibição
     */
    function getTotalExercises()
        public
        view
        returns (
            uint256 totalFlex,
            uint256 totalAbd,
            uint256 totalKm,
            uint256 participantsCount
        )
    {
        return calculateTotals(currentSeasonId);
    }

    /**
     * @dev Retorna informações da temporada atual
     */
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    // ============ LEADERBOARDS ============

    /**
     * @dev Retorna leaderboard geral (todos os exercícios)
     */
    function getLeaderboardGeral()
        public
        view
        returns (address[] memory, uint256[] memory)
    {
        return generateLeaderboard(currentSeasonId, 0);
    }

    /**
     * @dev Retorna leaderboard de flexões
     */
    function getLeaderboardFlexoes()
        public
        view
        returns (address[] memory, uint256[] memory)
    {
        return generateLeaderboard(currentSeasonId, 1);
    }

    /**
     * @dev Retorna leaderboard de abdominais
     */
    function getLeaderboardAbdominais()
        public
        view
        returns (address[] memory, uint256[] memory)
    {
        return generateLeaderboard(currentSeasonId, 2);
    }

    /**
     * @dev Retorna leaderboard de km
     */
    function getLeaderboardKm()
        public
        view
        returns (address[] memory, uint256[] memory)
    {
        return generateLeaderboard(currentSeasonId, 3);
    }

    // ============ HELPER FUNCTIONS ============

    /**
     * @dev Verifica se pode sacar
     */
    function canWithdraw(address user)
        public
        view
        returns (bool canWithdraw_, string memory reason)
    {
        if (!isParticipant[user]) {
            return (false, "Nao e um participante");
        }

        ParticipantStruct memory p = participants[user];
        bool hasCompleted = _hasCompletedChallenge(user);
        bool isSeasonActive = block.number < _getCurrentSeasonEndBlock();

        return _canWithdraw(p, hasCompleted, isSeasonActive);
    }
}
