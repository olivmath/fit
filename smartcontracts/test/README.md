# ChallengePool - Test Suite Documentation (BDD)

## 📋 Regime de Negócio

### Visão Geral
ChallengePool é um contrato de desafio de fitness baseado em **temporadas automáticas de 30 dias**. Usuários depositam 0.005 ETH para participar. Se completarem todos os 3 desafios dentro da temporada, sacam seu depósito de volta. Se não completarem, o dinheiro fica travado até que completem em uma temporada futura.

**Rede**: Arbitrum (1 bloco ≈ 0.25 segundos)
**Duração da Temporada**: 30 dias = 10,368,000 blocos
**Depósito**: 0.005 ETH (fixo)
**Metas**:
- 1000 flexões (push-ups)
- 1000 abdominais (sit-ups)
- 100 km de corrida

---

## 🎮 Mecânica do Jogo

### Fluxo Básico

```
Temporada Ativa
    ↓
Usuário Deposita 0.005 ETH
    ↓
Usuário Adiciona Exercícios
    ↓
    ├─ Se completar todas as 3 metas ANTES do fim da temporada
    │  └─ Pode sacar 0.005 ETH (seu depósito)
    │
    └─ Se NÃO completar até o fim
       └─ Dinheiro fica travado
       └─ Próxima temporada começa automaticamente
       └─ Pontos resetam para 0
       └─ Pode depositar novamente e tentar de novo
```

### Pontos-Chave
- ✅ **Uma participação por temporada**: cada usuário pode depositar apenas 1x por temporada
- ✅ **Saque único**: cada usuário saca apenas 1x por temporada
- ✅ **Sem pool compartilhado**: não há divisão de prêmios, cada um saca o que depositou
- ✅ **Temporadas automáticas**: novos blocos = próxima temporada começa
- ✅ **Pontos resetam**: exercícios adicionados não carregam para próxima temporada
- ✅ **Sem emergência**: única forma de sacar é completar os desafios

---

## 📝 Cenários de Teste (BDD)

### 1. DEPOSIT - Entrar na Temporada

#### 1.1 ✅ Sucesso: Depositar durante temporada ativa
```gherkin
Given: temporada está ativa
And:   usuário não participou desta temporada
When:  usuário chama deposit() com 0.005 ETH
Then:  usuário é adicionado como participante
And:   evento DepositoRealizado é emitido
And:   participantData.isParticipating == true
And:   participantData.seasonId == currentSeasonId
```

#### 1.2 ❌ Falha: Valor incorreto
```gherkin
Given: temporada está ativa
When:  usuário tenta depositar 0.004 ETH (valor errado)
Then:  transação reverte
And:   mensagem: "Deposito deve ser exatamente 0.005 ETH"
```

#### 1.3 ❌ Falha: Já participou da temporada
```gherkin
Given: usuário já depositou nesta temporada
When:  usuário tenta depositar novamente
Then:  transação reverte
And:   mensagem: "Ja participou desta temporada"
```

#### 1.4 ❌ Falha: Temporada não ativa
```gherkin
Given: temporada terminou
When:  usuário tenta depositar
Then:  transação reverte
And:   mensagem: "Temporada ja terminou"
```

#### 1.5 ❌ Falha: Re-participação na mesma temporada
```gherkin
Given: usuário já depositou e sacou nesta temporada
When:  usuário tenta depositar novamente na MESMA temporada
Then:  transação reverte
And:   mensagem: "Ja participou desta temporada"
```

---

### 2. EXERCISE TRACKING - Adicionar Exercícios

#### 2.1 ✅ Sucesso: Adicionar exercícios válidos
```gherkin
Given: usuário é participante da temporada ativa
And:   temporada está em andamento
When:  usuário chama addExercises(100, 50, 5, "mensagem")
Then:  flexoes += 100
And:   abdominais += 50
And:   km += 5
And:   evento ExerciciosAdicionados é emitido
```

#### 2.2 ✅ Sucesso: Emissão de evento MetaBatida
```gherkin
Given: usuário tem 950 flexões, 950 abdominais, 95 km
When:  usuário adiciona 50 flexões, 50 abdominais, 5 km
Then:  participantData.bateuMeta == true
And:   evento MetaBatida é emitido
```

#### 2.3 ❌ Falha: Não é participante
```gherkin
Given: usuário não depositou
When:  usuário tenta chamar addExercises()
Then:  transação reverte
And:   mensagem: "Nao e um participante"
```

#### 2.4 ❌ Falha: Todos os valores são zero
```gherkin
Given: usuário é participante
When:  usuário chama addExercises(0, 0, 0, "msg")
Then:  transação reverte
And:   mensagem: "Deve adicionar pelo menos um exercicio"
```

#### 2.5 ❌ Falha: Excede limite de flexões (anti-spam)
```gherkin
Given: usuário é participante
When:  usuário tenta adicionar 100_001 flexões (MAX = 100_000)
Then:  transação reverte
And:   mensagem: "Muitas flexoes de uma vez"
```

#### 2.6 ❌ Falha: Excede limite de abdominais
```gherkin
Given: usuário é participante
When:  usuário tenta adicionar 100_001 abdominais
Then:  transação reverte
And:   mensagem: "Muitos abdominais de uma vez"
```

#### 2.7 ❌ Falha: Excede limite de km
```gherkin
Given: usuário é participante
When:  usuário tenta adicionar 1_001 km (MAX = 1_000)
Then:  transação reverte
And:   mensagem: "Muitos km de uma vez"
```

#### 2.8 ❌ Falha: Temporada não ativa
```gherkin
Given: temporada terminou
When:  usuário (da temporada anterior) tenta adicionar exercícios
Then:  transação reverte
And:   mensagem: "Temporada ja terminou"
```

---

### 3. WITHDRAWAL - Sacar Depósito

#### 3.1 ✅ Sucesso: Sacar após completar meta (temporada ativa)
```gherkin
Given: usuário completou todos os 3 desafios
And:   temporada está ativa
When:  usuário chama withdraw()
Then:  usuário recebe 0.005 ETH
And:   participantData.hasWithdrawn == true
And:   evento SaqueRealizado é emitido com completedChallenge=true
And:   canWithdraw() retorna false na segunda tentativa
```

#### 3.2 ✅ Sucesso: Sacar após temporada terminar
```gherkin
Given: usuário não completou os desafios
And:   temporada terminou
When:  usuário chama withdraw()
Then:  usuário recebe 0.005 ETH (seu depósito)
And:   participantData.hasWithdrawn == true
And:   evento SaqueRealizado é emitido com completedChallenge=false
```

#### 3.3 ❌ Falha: Já sacou nesta temporada
```gherkin
Given: usuário já sacou sua 0.005 ETH
When:  usuário tenta chamar withdraw() novamente
Then:  transação reverte
And:   mensagem: "Ja sacou nesta temporada"
```

#### 3.4 ❌ Falha: Temporada ativa e não completou
```gherkin
Given: usuário tem 500 flexões, 500 abdominais, 50 km (não completou)
And:   temporada está ativa
When:  usuário tenta withdraw()
Then:  transação reverte
And:   mensagem: "Nao pode sacar ainda"
```

#### 3.5 ❌ Falha: Não é participante
```gherkin
Given: usuário nunca depositou
When:  usuário tenta withdraw()
Then:  transação reverte
And:   mensagem: "Nao e um participante"
```

---

### 4. TEMPORADAS - Ciclo Automático

#### 4.1 ✅ Sucesso: Próxima temporada começa automaticamente
```gherkin
Given: temporada atual terminou (block.number >= seasonStartBlock + SEASON_DURATION_BLOCKS)
When:  usuário chama qualquer função de leitura (ex: getCurrentSeasonInfo)
Then:  currentSeasonId incrementa automaticamente
And:   seasonStartBlock atualiza para o bloco atual
And:   evento NovaTemporadaIniciada é emitido
```

#### 4.2 ✅ Sucesso: Pontos resetam entre temporadas
```gherkin
Given: usuário tem 1000 flexões, 1000 abdominais, 100 km na temporada 1
And:   temporada 1 termina e temporada 2 começa
When:  usuário deposita na temporada 2
Then:  participantData.flexoes == 0
And:   participantData.abdominais == 0
And:   participantData.km == 0
```

#### 4.3 ✅ Sucesso: Pode depositar novamente na próxima temporada
```gherkin
Given: usuário participou e sacou na temporada 1
And:   temporada 2 começou
When:  usuário deposita 0.005 ETH
Then:  usuário é registrado como participante da temporada 2
And:   participatedInSeason[user][2] == true
And:   evento DepositoRealizado é emitido com seasonId=2
```

#### 4.4 ✅ Sucesso: Leaderboards mostram apenas temporada atual
```gherkin
Given: temporada 1 teve 5 participantes
And:   temporada 2 começou com 3 novos participantes
When:  getLeaderboardGeral() é chamado
Then:  retorna apenas 3 endereços (da temporada 2)
And:   totalExercises conta apenas exercícios da temporada 2
```

---

### 5. SEGURANÇA - Validações e Proteções

#### 5.1 ✅ Sem Rounding Loss
```gherkin
Given: contrato tem 5 participantes com 0.005 ETH cada = 0.025 ETH total
And:   todos completam desafios
When:  todos sacam
Then:  cada um recebe exatamente 0.005 ETH
And:   contractBalance == 0 (ou dust negligível)
```

#### 5.2 ✅ Input Validation Funciona
```gherkin
Given: função addExercises tem limites
When:  diferentes valores inválidos são testados
Then:  todas as validações funcionam corretamente
And:   edge cases (0, MAX, MAX+1) são cobertos
```

#### 5.3 ✅ Events Corretos
```gherkin
Given: contrato emite eventos
When:  operações são executadas
Then:  DepositoRealizado inclui (user, amount, seasonId)
And:   SaqueRealizado inclui (user, amount, completedChallenge, seasonId)
And:   MetaBatida inclui (user)
And:   ExerciciosAdicionados inclui todos os dados
```

#### 5.4 ❌ Sem Vulnerabilidades de Reentrância
```gherkin
Given: contrato usa call{value:...} para transferências
When:  um ataque de reentrância é tentado
Then:  participantData.hasWithdrawn é setado ANTES da transferência
And:   segunda chamada é prevenida
```

#### 5.5 ❌ Overflow/Underflow Protegido
```gherkin
Given: Solidity 0.8.20 com checked math nativo
When:  operações aritméticas são executadas
Then:  não há overflow/underflow silencioso
And:   revert automático se exceder limites
```

---

### 6. VIEW FUNCTIONS - Leitura de Dados

#### 6.1 ✅ getCurrentSeasonInfo
```gherkin
When:  getCurrentSeasonInfo() é chamado
Then:  retorna (seasonId, startBlock, endBlock, blocksRemaining, isActive)
And:   valores são sempre atualizados
```

#### 6.2 ✅ getParticipantData
```gherkin
When:  getParticipantData(user) é chamado
Then:  retorna (flexoes, abdominais, km, bateuMeta, isParticipating, seasonId, hasWithdrawn)
And:   bateuMeta é calculado on-demand (sem storage)
```

#### 6.3 ✅ canWithdraw
```gherkin
When:  canWithdraw(user) é chamado
Then:  retorna (bool canWithdraw, string reason)
And:   reason explica por quê pode ou não sacar
```

#### 6.4 ✅ Leaderboards (Geral, Flexões, Abdominais, Km)
```gherkin
When:  getLeaderboardGeral() é chamado
Then:  retorna (addresses[], values[])
And:   ordenado decrescente por total de exercícios
And:   contém apenas participantes da temporada atual
```

---

## 🧪 Estrutura de Teste

### Setup Padrão
```solidity
contract ChallengePoolTest is Test {
    ChallengePool pool;

    address user1 = address(0x1);
    address user2 = address(0x2);
    address user3 = address(0x3);

    function setUp() public {
        pool = new ChallengePool();
        vm.deal(user1, 10 ether);
        vm.deal(user2, 10 ether);
        vm.deal(user3, 10 ether);
    }
}
```

### Helpers
- `_fastForwardBlocks(uint256 blocks)`: pula blocos para testar temporadas
- `_depositAs(address user)`: shortcut para depositar
- `_addExercisesAs(...)`: shortcut para adicionar exercícios
- `_completeChallenge(address user)`: completa todos 3 desafios

---

## 📊 Cobertura de Testes

| Funcionalidade | Cenários | Status |
|---|---|---|
| Deposit | 5 | ⏳ Pending |
| Exercise Tracking | 8 | ⏳ Pending |
| Withdrawal | 5 | ⏳ Pending |
| Temporadas | 4 | ⏳ Pending |
| Segurança | 5 | ⏳ Pending |
| View Functions | 4 | ⏳ Pending |
| **TOTAL** | **31 cenários** | ⏳ Pending |

---

## 🚀 Como Rodar

```bash
cd smartcontracts

# Compile
forge build

# Run all tests
forge test -vvv

# Run specific test
forge test --match "testDepositSuccess" -vvv

# Coverage
forge coverage
```

---

## ✅ Critérios de Sucesso

- [ ] Todos os 31 cenários implementados
- [ ] Todos os testes passam
- [ ] Cobertura > 95%
- [ ] Sem vulner abilidades
- [ ] Edge cases cobertos
