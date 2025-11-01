// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ChallengePool
 * @dev Gerencia um desafio de fitness com 3 metas: flexões, abdominais e corrida
 * Período: Novembro (1-30)
 * Depósito fixo: 0.005 ETH
 * Metas: 1000 flexões, 1000 abdominais, 100 km de corrida
 */
contract ChallengePool {
    // ============ CONSTANTES ============
    uint256 public constant DEPOSIT_AMOUNT = 0.005 ether;
    uint256 public constant FLEXOES_META = 1000;
    uint256 public constant ABDOMINAIS_META = 1000;
    uint256 public constant KM_META = 100;

    // Período do desafio
    uint256 public challengeStartDate;
    uint256 public challengeEndDate;

    // ============ ESTRUTURAS ============
    struct Participant {
        uint256 flexoes;
        uint256 abdominais;
        uint256 km;
        uint256 deposito;
        uint256 dataDeposito;
    }

    // ============ ESTADO ============
    mapping(address => Participant) public participants;
    address[] public participantsList;
    mapping(address => bool) public isParticipant;

    // ============ EVENTOS ============
    event DepositoRealizado(address indexed user, uint256 amount);
    event ExerciciosAdicionados(address indexed user, uint256 flexoes, uint256 abdominais, uint256 km);
    event MetaBatida(address indexed user);
    event PremioDitribuido(address indexed user, uint256 amount);
    event DesafioFinalizado();

    // ============ MODIFICADORES ============
    modifier onlyDuringChallenge() {
        require(block.timestamp >= challengeStartDate, "Desafio ainda nao comecou");
        require(block.timestamp < challengeEndDate, "Desafio ja terminou");
        _;
    }

    modifier onlyParticipant() {
        require(isParticipant[msg.sender], "Nao e um participante");
        _;
    }

    modifier afterChallenge() {
        require(block.timestamp >= challengeEndDate, "Desafio ainda esta em andamento");
        _;
    }

    // ============ CONSTRUTOR ============
    constructor() {
        // Para testes locais:
        challengeStartDate = block.timestamp;
        challengeEndDate = block.timestamp + 30 days;
    }

    // ============ FUNÇÕES PRIVADAS ============

    /**
     * @dev Verifica se um participante bateu a meta
     * Calcula on-demand, sem armazenar em storage
     */
    function _hasCompletedChallenge(address user) private view returns (bool) {
        if (!isParticipant[user]) {
            return false;
        }
        Participant memory p = participants[user];
        return p.flexoes >= FLEXOES_META &&
               p.abdominais >= ABDOMINAIS_META &&
               p.km >= KM_META;
    }

    // ============ FUNÇÕES PÚBLICAS (SEM AUTENTICAÇÃO) ============

    /**
     * @dev Retorna os somatórios globais de exercícios
     */
    function getTotalExercises() public view returns (
        uint256 totalFlex,
        uint256 totalAbd,
        uint256 totalKm,
        uint256 participantsCount
    ) {
        for (uint256 i = 0; i < participantsList.length; i++) {
            address participant = participantsList[i];
            totalFlex += participants[participant].flexoes;
            totalAbd += participants[participant].abdominais;
            totalKm += participants[participant].km;
        }
        participantsCount = participantsList.length;
    }

    /**
     * @dev Retorna todos os participantes ordenados por exercício total
     */
    function getLeaderboardGeral() public view returns (address[] memory, uint256[] memory) {
        if (participantsList.length == 0) {
            return (new address[](0), new uint256[](0));
        }

        address[] memory ranked = new address[](participantsList.length);
        uint256[] memory totals = new uint256[](participantsList.length);

        // Copiar dados
        for (uint256 i = 0; i < participantsList.length; i++) {
            ranked[i] = participantsList[i];
            Participant memory p = participants[ranked[i]];
            totals[i] = p.flexoes + p.abdominais + p.km;
        }

        // Bubble sort
        for (uint256 i = 0; i < ranked.length; i++) {
            for (uint256 j = i + 1; j < ranked.length; j++) {
                if (totals[j] > totals[i]) {
                    // Swap addresses
                    address tempAddr = ranked[i];
                    ranked[i] = ranked[j];
                    ranked[j] = tempAddr;

                    // Swap totals
                    uint256 tempTotal = totals[i];
                    totals[i] = totals[j];
                    totals[j] = tempTotal;
                }
            }
        }

        return (ranked, totals);
    }

    /**
     * @dev Retorna leaderboard de flexões
     */
    function getLeaderboardFlexoes() public view returns (address[] memory, uint256[] memory) {
        return _getLeaderboardByExercise(0);
    }

    /**
     * @dev Retorna leaderboard de abdominais
     */
    function getLeaderboardAbdominais() public view returns (address[] memory, uint256[] memory) {
        return _getLeaderboardByExercise(1);
    }

    /**
     * @dev Retorna leaderboard de km
     */
    function getLeaderboardKm() public view returns (address[] memory, uint256[] memory) {
        return _getLeaderboardByExercise(2);
    }

    /**
     * @dev Função interna para gerar leaderboards por tipo de exercício
     */
    function _getLeaderboardByExercise(uint256 exerciseType) internal view returns (address[] memory, uint256[] memory) {
        if (participantsList.length == 0) {
            return (new address[](0), new uint256[](0));
        }

        address[] memory ranked = new address[](participantsList.length);
        uint256[] memory values = new uint256[](participantsList.length);

        // Copiar dados
        for (uint256 i = 0; i < participantsList.length; i++) {
            ranked[i] = participantsList[i];
            Participant memory p = participants[ranked[i]];

            if (exerciseType == 0) {
                values[i] = p.flexoes;
            } else if (exerciseType == 1) {
                values[i] = p.abdominais;
            } else {
                values[i] = p.km;
            }
        }

        // Bubble sort
        for (uint256 i = 0; i < ranked.length; i++) {
            for (uint256 j = i + 1; j < ranked.length; j++) {
                if (values[j] > values[i]) {
                    address tempAddr = ranked[i];
                    ranked[i] = ranked[j];
                    ranked[j] = tempAddr;

                    uint256 tempVal = values[i];
                    values[i] = values[j];
                    values[j] = tempVal;
                }
            }
        }

        return (ranked, values);
    }

    /**
     * @dev Retorna dados públicos de um participante
     */
    function getParticipantData(address user) public view returns (
        uint256 flexoes,
        uint256 abdominais,
        uint256 km,
        bool bateuMeta,
        bool isParticipating
    ) {
        if (!isParticipant[user]) {
            return (0, 0, 0, false, false);
        }

        Participant memory p = participants[user];
        bool hasCompleted = _hasCompletedChallenge(user);

        return (p.flexoes, p.abdominais, p.km, hasCompleted, true);
    }

    // ============ FUNÇÕES AUTENTICADAS ============

    /**
     * @dev Usuário deposita 0.005 ETH para entrar no desafio
     */
    function deposit() public payable onlyDuringChallenge {
        require(msg.value == DEPOSIT_AMOUNT, "Deposito deve ser exatamente 0.005 ETH");
        require(!isParticipant[msg.sender], "Usuario ja esta participando");

        participants[msg.sender] = Participant({
            flexoes: 0,
            abdominais: 0,
            km: 0,
            deposito: msg.value,
            dataDeposito: block.timestamp
        });

        isParticipant[msg.sender] = true;
        participantsList.push(msg.sender);

        emit DepositoRealizado(msg.sender, msg.value);
    }

    /**
     * @dev Participante adiciona exercícios
     * @param flexoes Quantidade de flexões (pode ser 0)
     * @param abdominais Quantidade de abdominais (pode ser 0)
     * @param kmCorrida Quantidade de km de corrida (pode ser 0)
     */
    function addExercises(
        uint256 flexoes,
        uint256 abdominais,
        uint256 kmCorrida
    ) public onlyDuringChallenge onlyParticipant {
        require(flexoes > 0 || abdominais > 0 || kmCorrida > 0, "Deve adicionar pelo menos um exercicio");

        participants[msg.sender].flexoes += flexoes;
        participants[msg.sender].abdominais += abdominais;
        participants[msg.sender].km += kmCorrida;

        // Verifica se bateu a meta (calcula on-demand)
        if (_hasCompletedChallenge(msg.sender)) {
            emit MetaBatida(msg.sender);
        }

        emit ExerciciosAdicionados(msg.sender, flexoes, abdominais, kmCorrida);
    }

    // ============ FUNÇÕES DE ADMINISTRAÇÃO ============

    /**
     * @dev Calcula e distribui prêmios após o fim do desafio
     * Quem bateu a meta: recebe seu ETH + divisão do ETH de quem não bateu
     * Quem não bateu: perde o ETH
     */
    function distributePrizes() public afterChallenge {
        require(participantsList.length > 0, "Nenhum participante");

        // Contar quantos bateram a meta e total do pool
        uint256 winnersCount = 0;
        uint256 totalPool = 0;

        for (uint256 i = 0; i < participantsList.length; i++) {
            address participant = participantsList[i];
            Participant memory p = participants[participant];
            totalPool += p.deposito;

            if (_hasCompletedChallenge(participant)) {
                winnersCount++;
            }
        }

        require(winnersCount > 0, "Nenhum vencedor");

        // Distribuir prêmios para vencedores
        for (uint256 i = 0; i < participantsList.length; i++) {
            address participant = participantsList[i];

            if (_hasCompletedChallenge(participant)) {
                uint256 prizeAmount = totalPool / winnersCount;

                (bool success, ) = payable(participant).call{value: prizeAmount}("");
                require(success, "Falha ao enviar premio");

                emit PremioDitribuido(participant, prizeAmount);
            }
        }

        emit DesafioFinalizado();
    }

    /**
     * @dev Define novas datas para o desafio (apenas para testes)
     */
    function setChallengeDates(uint256 startDate, uint256 endDate) public {
        require(startDate < endDate, "Data de inicio deve ser antes da data de fim");
        challengeStartDate = startDate;
        challengeEndDate = endDate;
    }

    // ============ FUNÇÕES DE CONSULTA ============

    /**
     * @dev Retorna o saldo do contrato
     */
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev Retorna o número total de participantes
     */
    function getParticipantsCount() public view returns (uint256) {
        return participantsList.length;
    }

    /**
     * @dev Retorna as datas do desafio
     */
    function getChallengeDates() public view returns (uint256 start, uint256 end) {
        return (challengeStartDate, challengeEndDate);
    }
}
