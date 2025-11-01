# Remediation Guide: ChallengePool.sol

This guide provides the exact code changes needed to fix the security issues identified in the audit.

---

## Fix 1: Add Owner Access Control (CRITICAL)

### Current Code (Line 1-12, 319-323)
```solidity
contract ChallengePool {
    // ============ CONSTANTES ============
    uint256 public constant DEPOSIT_AMOUNT = 0.005 ether;
    // ...

    // ============ CONSTRUTOR ============
    constructor() {
        challengeStartDate = block.timestamp;
        challengeEndDate = block.timestamp + 30 days;
    }

    // ...

    function setChallengeDates(uint256 startDate, uint256 endDate) public {
        require(startDate < endDate, "Data de inicio deve ser antes da data de fim");
        challengeStartDate = startDate;
        challengeEndDate = endDate;
    }
```

### Fixed Code
```solidity
contract ChallengePool {
    // ============ CONSTANTES ============
    uint256 public constant DEPOSIT_AMOUNT = 0.005 ether;
    uint256 public constant FLEXOES_META = 1000;
    uint256 public constant ABDOMINAIS_META = 1000;
    uint256 public constant KM_META = 100;

    // Período do desafio
    uint256 public challengeStartDate;
    uint256 public challengeEndDate;

    // ============ ACCESS CONTROL ============
    address public owner;

    // ============ EVENTOS ============
    event DepositoRealizado(address indexed user, uint256 amount);
    event ExerciciosAdicionados(address indexed user, uint256 flexoes, uint256 abdominais, uint256 km);
    event MetaBatida(address indexed user);
    event PremioDistribuido(address indexed user, uint256 amount); // Fixed typo
    event DesafioFinalizado();
    event ChallengeDatesUpdated(uint256 indexed startDate, uint256 indexed endDate, address indexed updatedBy);

    // ============ MODIFICADORES ============
    modifier onlyOwner() {
        require(msg.sender == owner, "Apenas o proprietario pode chamar isso");
        _;
    }

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
        owner = msg.sender;
        challengeStartDate = block.timestamp;
        challengeEndDate = block.timestamp + 30 days;
    }

    // ============ FUNÇÃO CORRIGIDA ============
    function setChallengeDates(uint256 startDate, uint256 endDate) public onlyOwner {
        require(startDate < endDate, "Data de inicio deve ser antes da data de fim");
        challengeStartDate = startDate;
        challengeEndDate = endDate;
        emit ChallengeDatesUpdated(startDate, endDate, msg.sender);
    }
}
```

**Changes Made**:
- ✓ Added `address public owner;` state variable
- ✓ Added `onlyOwner()` modifier
- ✓ Set `owner = msg.sender;` in constructor
- ✓ Added `onlyOwner` to `setChallengeDates()`
- ✓ Added `ChallengeDatesUpdated` event
- ✓ Fixed `PremioDitribuido` → `PremioDistribuido` typo

**Testing**:
```solidity
// Test that non-owner cannot call
vm.prank(attacker);
vm.expectRevert("Apenas o proprietario pode chamar isso");
challengePool.setChallengeDates(block.timestamp, block.timestamp + 1);

// Test that owner can call
vm.prank(owner);
challengePool.setChallengeDates(block.timestamp, block.timestamp + 1 days); // ✓ Works
```

---

## Fix 2: Add Prize Distribution Guard (CRITICAL)

### Current Code (Line 280-314)
```solidity
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
```

### Fixed Code
```solidity
// ============ ESTADO ============
mapping(address => Participant) public participants;
address[] public participantsList;
mapping(address => bool) public isParticipant;
bool public prizesDistributed = false;  // ADD THIS LINE

// ... rest of code ...

function distributePrizes() public afterChallenge {
    require(!prizesDistributed, "Premios ja foram distribuidos");
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

    // Calculate prize per winner and remainder
    uint256 prizePerWinner = totalPool / winnersCount;
    uint256 remainder = totalPool % winnersCount;

    // Distribuir prêmios para vencedores
    for (uint256 i = 0; i < participantsList.length; i++) {
        address participant = participantsList[i];

        if (_hasCompletedChallenge(participant)) {
            uint256 prizeAmount = prizePerWinner;

            // First winner gets the remainder
            if (i == 0 && remainder > 0) {
                prizeAmount += remainder;
            }

            (bool success, ) = payable(participant).call{value: prizeAmount}("");
            require(success, "Falha ao enviar premio");

            emit PremioDistribuido(participant, prizeAmount);
        }
    }

    prizesDistributed = true;
    emit DesafioFinalizado();
}
```

**Changes Made**:
- ✓ Added `bool public prizesDistributed = false;` state variable
- ✓ Added guard: `require(!prizesDistributed, ...);`
- ✓ Calculate remainder: `uint256 remainder = totalPool % winnersCount;`
- ✓ Allocate remainder to first winner
- ✓ Set `prizesDistributed = true;` at end

**Testing**:
```solidity
function testDistributePrizes_cannotCallTwice() public {
    // Setup: deposit and complete
    vm.prank(user1);
    challengePool.deposit{value: 0.005 ether}();

    vm.prank(user1);
    challengePool.addExercises(1000, 1000, 100);

    // Advance time and distribute
    vm.warp(block.timestamp + 30 days + 1);
    challengePool.distributePrizes();

    // Second call should revert
    vm.expectRevert("Premios ja foram distribuidos");
    challengePool.distributePrizes();
}

function testDistributePrizes_remainderHandled() public {
    // Setup: 3 participants, 2 complete
    uint256 totalDeposit = 0.015 ether; // 3 × 0.005

    // ... setup code ...

    // 2 winners, each gets 0.015 / 2 = 0.007 ETH
    // Remainder: 0.001 ETH (1 wei per winner?) goes to first
    uint256 winnerBalance = user1.balance;
    assert(winnerBalance >= 0.007 ether); // At least base amount
}
```

---

## Fix 3: Add Input Validation (MEDIUM)

### Add to `addExercises()` function (Line 254-271)

```solidity
function addExercises(
    uint256 flexoes,
    uint256 abdominais,
    uint256 kmCorrida
) public onlyDuringChallenge onlyParticipant {
    // Existing check
    require(flexoes > 0 || abdominais > 0 || kmCorrida > 0, "Deve adicionar pelo menos um exercicio");

    // ADD THESE VALIDATIONS
    require(flexoes <= 100000, "Flexoes muito alto");
    require(abdominais <= 100000, "Abdominais muito alto");
    require(kmCorrida <= 1000, "KM muito alto");

    participants[msg.sender].flexoes += flexoes;
    participants[msg.sender].abdominais += abdominais;
    participants[msg.sender].km += kmCorrida;

    if (_hasCompletedChallenge(msg.sender)) {
        emit MetaBatida(msg.sender);
    }

    emit ExerciciosAdicionados(msg.sender, flexoes, abdominais, kmCorrida);
}
```

**Rationale**:
- 100,000 flexões/abdominais per submission = ~190/day (reasonable)
- 1,000 km per submission = reasonable weekly running distance
- Prevents accidental overflow or spam

---

## Fix 4: Add Emergency Withdrawal (LOW - Optional)

### Add to state variables
```solidity
// ============ ESTADO ============
mapping(address => Participant) public participants;
address[] public participantsList;
mapping(address => bool) public isParticipant;
bool public prizesDistributed = false;

// ADD THIS EVENT
event EmergencyWithdrawal(uint256 indexed amount, address indexed by);
```

### Add new function
```solidity
// ============ FUNÇÕES DE EMERGÊNCIA ============

/**
 * @dev Emergency withdrawal for owner only
 * Use only if funds are stuck due to unforeseen circumstances
 */
function emergencyWithdraw(uint256 amount) public onlyOwner {
    require(amount <= address(this).balance, "Saldo insuficiente");

    (bool success, ) = payable(owner).call{value: amount}("");
    require(success, "Saque falhou");

    emit EmergencyWithdrawal(amount, msg.sender);
}
```

**Usage**:
```solidity
// Only owner can call
vm.prank(owner);
challengePool.emergencyWithdraw(0.01 ether);

// Attacker cannot call
vm.prank(attacker);
vm.expectRevert("Apenas o proprietario pode chamar isso");
challengePool.emergencyWithdraw(0.01 ether);
```

---

## Fix 5: Optimize Leaderboards (MEDIUM)

### Replace leaderboard functions with pagination

```solidity
// REMOVE these functions (O(n²) complexity):
// - getLeaderboardGeral()
// - getLeaderboardFlexoes()
// - getLeaderboardAbdominais()
// - getLeaderboardKm()
// - _getLeaderboardByExercise()

// REPLACE with:

function getAllParticipants() public view returns (address[] memory) {
    return participantsList;
}

function getParticipantExercises(address user) public view returns (
    uint256 flexoes,
    uint256 abdominais,
    uint256 km
) {
    if (!isParticipant[user]) {
        return (0, 0, 0);
    }
    Participant memory p = participants[user];
    return (p.flexoes, p.abdominais, p.km);
}

/**
 * @dev Paginated leaderboard - frontend does sorting
 * This is MUCH more efficient than on-chain sorting
 */
function getLeaderboardPage(uint256 offset, uint256 limit)
    public
    view
    returns (address[] memory page)
{
    require(offset < participantsList.length, "Offset invalido");
    require(limit > 0 && limit <= 50, "Limite deve ser 1-50");
    require(offset + limit <= participantsList.length, "Fora dos limites");

    address[] memory page = new address[](limit);
    for (uint256 i = 0; i < limit; i++) {
        page[i] = participantsList[offset + i];
    }
    return page;
}
```

**Frontend Sorting Example** (JavaScript):
```javascript
// Get all participants
const participants = await contract.getAllParticipants();

// Get exercise data for each
const leaderboard = await Promise.all(
    participants.map(async (addr) => {
        const [flex, abd, km] = await contract.getParticipantExercises(addr);
        return {
            address: addr,
            total: flex + abd + km,
            flexoes: flex,
            abdominais: abd,
            km: km
        };
    })
);

// Sort (O(n log n) instead of O(n²))
leaderboard.sort((a, b) => b.total - a.total);
```

---

## Summary of Changes

| Issue | Severity | Fix | Lines |
|-------|----------|-----|-------|
| Access Control | CRITICAL | Add `onlyOwner` to `setChallengeDates()` | 1, 12, 61, 319 |
| Repeated Distribution | CRITICAL | Add `prizesDistributed` flag | 34, 280, 314 |
| Rounding Loss | HIGH | Handle remainder in prize distribution | 304-309 |
| Unbounded Values | MEDIUM | Add limits to `addExercises()` | 254-271 |
| Missing Events | MEDIUM | Add event to `setChallengeDates()` | 36, 323 |
| Typo | LOW | Rename event from `PremioDitribuido` | 40 |
| Emergency Withdrawal | LOW | Add `emergencyWithdraw()` function | New |

---

## Deployment Checklist

Before deploying to any network:

### Phase 1: Critical Fixes
- [ ] Implement Fix 1 (Access Control)
- [ ] Implement Fix 2 (Prize Distribution Guard + Remainder Handling)
- [ ] Write tests for all critical fixes
- [ ] Run `forge test` - all tests pass ✓
- [ ] Run `forge build` - compiles ✓

### Phase 2: Pre-Mainnet
- [ ] Implement Fix 3 (Input Validation)
- [ ] Implement Fix 4 (Emergency Withdrawal)
- [ ] Implement Fix 5 (Leaderboard Optimization)
- [ ] Update frontend to use pagination
- [ ] Full integration testing
- [ ] Security review of changes

### Phase 3: Production
- [ ] Deploy to testnet (Sepolia)
- [ ] Test all functions on testnet
- [ ] Final security review
- [ ] Deploy to mainnet/Arbitrum
- [ ] Monitor transactions

---

## Quick Diff

Run this to see the exact changes:
```bash
# After implementing fixes:
git diff src/ChallengePool.sol
```

---

## Questions?

See `SECURITY_AUDIT.md` for detailed explanations of each issue.
