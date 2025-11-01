
import { GenericContractsDeclaration } from "~~/utils/fwt/contract";

const deployedContracts = {
    31337: {
    "ChallengePool": {
        "address": "0x0165878a594ca255338adfa4d48449f69242eb8f",
        "abi": [
            {
                "type": "constructor",
                "inputs": [],
                "stateMutability": "nonpayable"
            },
            {
                "type": "function",
                "name": "ABDOMINAIS_META",
                "inputs": [],
                "outputs": [
                    {
                        "name": "",
                        "type": "uint256",
                        "internalType": "uint256"
                    }
                ],
                "stateMutability": "view"
            },
            {
                "type": "function",
                "name": "DEPOSIT_AMOUNT",
                "inputs": [],
                "outputs": [
                    {
                        "name": "",
                        "type": "uint256",
                        "internalType": "uint256"
                    }
                ],
                "stateMutability": "view"
            },
            {
                "type": "function",
                "name": "FLEXOES_META",
                "inputs": [],
                "outputs": [
                    {
                        "name": "",
                        "type": "uint256",
                        "internalType": "uint256"
                    }
                ],
                "stateMutability": "view"
            },
            {
                "type": "function",
                "name": "KM_META",
                "inputs": [],
                "outputs": [
                    {
                        "name": "",
                        "type": "uint256",
                        "internalType": "uint256"
                    }
                ],
                "stateMutability": "view"
            },
            {
                "type": "function",
                "name": "addExercises",
                "inputs": [
                    {
                        "name": "flexoes",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "abdominais",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "kmCorrida",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "mensagemMotivacional",
                        "type": "string",
                        "internalType": "string"
                    }
                ],
                "outputs": [],
                "stateMutability": "nonpayable"
            },
            {
                "type": "function",
                "name": "challengeEndDate",
                "inputs": [],
                "outputs": [
                    {
                        "name": "",
                        "type": "uint256",
                        "internalType": "uint256"
                    }
                ],
                "stateMutability": "view"
            },
            {
                "type": "function",
                "name": "challengeStartDate",
                "inputs": [],
                "outputs": [
                    {
                        "name": "",
                        "type": "uint256",
                        "internalType": "uint256"
                    }
                ],
                "stateMutability": "view"
            },
            {
                "type": "function",
                "name": "deposit",
                "inputs": [],
                "outputs": [],
                "stateMutability": "payable"
            },
            {
                "type": "function",
                "name": "distributePrizes",
                "inputs": [],
                "outputs": [],
                "stateMutability": "nonpayable"
            },
            {
                "type": "function",
                "name": "getChallengeDates",
                "inputs": [],
                "outputs": [
                    {
                        "name": "start",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "end",
                        "type": "uint256",
                        "internalType": "uint256"
                    }
                ],
                "stateMutability": "view"
            },
            {
                "type": "function",
                "name": "getContractBalance",
                "inputs": [],
                "outputs": [
                    {
                        "name": "",
                        "type": "uint256",
                        "internalType": "uint256"
                    }
                ],
                "stateMutability": "view"
            },
            {
                "type": "function",
                "name": "getLeaderboardAbdominais",
                "inputs": [],
                "outputs": [
                    {
                        "name": "",
                        "type": "address[]",
                        "internalType": "address[]"
                    },
                    {
                        "name": "",
                        "type": "uint256[]",
                        "internalType": "uint256[]"
                    }
                ],
                "stateMutability": "view"
            },
            {
                "type": "function",
                "name": "getLeaderboardFlexoes",
                "inputs": [],
                "outputs": [
                    {
                        "name": "",
                        "type": "address[]",
                        "internalType": "address[]"
                    },
                    {
                        "name": "",
                        "type": "uint256[]",
                        "internalType": "uint256[]"
                    }
                ],
                "stateMutability": "view"
            },
            {
                "type": "function",
                "name": "getLeaderboardGeral",
                "inputs": [],
                "outputs": [
                    {
                        "name": "",
                        "type": "address[]",
                        "internalType": "address[]"
                    },
                    {
                        "name": "",
                        "type": "uint256[]",
                        "internalType": "uint256[]"
                    }
                ],
                "stateMutability": "view"
            },
            {
                "type": "function",
                "name": "getLeaderboardKm",
                "inputs": [],
                "outputs": [
                    {
                        "name": "",
                        "type": "address[]",
                        "internalType": "address[]"
                    },
                    {
                        "name": "",
                        "type": "uint256[]",
                        "internalType": "uint256[]"
                    }
                ],
                "stateMutability": "view"
            },
            {
                "type": "function",
                "name": "getParticipantData",
                "inputs": [
                    {
                        "name": "user",
                        "type": "address",
                        "internalType": "address"
                    }
                ],
                "outputs": [
                    {
                        "name": "flexoes",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "abdominais",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "km",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "bateuMeta",
                        "type": "bool",
                        "internalType": "bool"
                    },
                    {
                        "name": "isParticipating",
                        "type": "bool",
                        "internalType": "bool"
                    }
                ],
                "stateMutability": "view"
            },
            {
                "type": "function",
                "name": "getParticipantsCount",
                "inputs": [],
                "outputs": [
                    {
                        "name": "",
                        "type": "uint256",
                        "internalType": "uint256"
                    }
                ],
                "stateMutability": "view"
            },
            {
                "type": "function",
                "name": "getTotalExercises",
                "inputs": [],
                "outputs": [
                    {
                        "name": "totalFlex",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "totalAbd",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "totalKm",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "participantsCount",
                        "type": "uint256",
                        "internalType": "uint256"
                    }
                ],
                "stateMutability": "view"
            },
            {
                "type": "function",
                "name": "isParticipant",
                "inputs": [
                    {
                        "name": "",
                        "type": "address",
                        "internalType": "address"
                    }
                ],
                "outputs": [
                    {
                        "name": "",
                        "type": "bool",
                        "internalType": "bool"
                    }
                ],
                "stateMutability": "view"
            },
            {
                "type": "function",
                "name": "participants",
                "inputs": [
                    {
                        "name": "",
                        "type": "address",
                        "internalType": "address"
                    }
                ],
                "outputs": [
                    {
                        "name": "flexoes",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "abdominais",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "km",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "deposito",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "dataDeposito",
                        "type": "uint256",
                        "internalType": "uint256"
                    }
                ],
                "stateMutability": "view"
            },
            {
                "type": "function",
                "name": "participantsList",
                "inputs": [
                    {
                        "name": "",
                        "type": "uint256",
                        "internalType": "uint256"
                    }
                ],
                "outputs": [
                    {
                        "name": "",
                        "type": "address",
                        "internalType": "address"
                    }
                ],
                "stateMutability": "view"
            },
            {
                "type": "function",
                "name": "setChallengeDates",
                "inputs": [
                    {
                        "name": "startDate",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "endDate",
                        "type": "uint256",
                        "internalType": "uint256"
                    }
                ],
                "outputs": [],
                "stateMutability": "nonpayable"
            },
            {
                "type": "event",
                "name": "DepositoRealizado",
                "inputs": [
                    {
                        "name": "user",
                        "type": "address",
                        "indexed": true,
                        "internalType": "address"
                    },
                    {
                        "name": "amount",
                        "type": "uint256",
                        "indexed": false,
                        "internalType": "uint256"
                    }
                ],
                "anonymous": false
            },
            {
                "type": "event",
                "name": "DesafioFinalizado",
                "inputs": [],
                "anonymous": false
            },
            {
                "type": "event",
                "name": "ExerciciosAdicionados",
                "inputs": [
                    {
                        "name": "user",
                        "type": "address",
                        "indexed": true,
                        "internalType": "address"
                    },
                    {
                        "name": "flexoes",
                        "type": "uint256",
                        "indexed": false,
                        "internalType": "uint256"
                    },
                    {
                        "name": "abdominais",
                        "type": "uint256",
                        "indexed": false,
                        "internalType": "uint256"
                    },
                    {
                        "name": "km",
                        "type": "uint256",
                        "indexed": false,
                        "internalType": "uint256"
                    },
                    {
                        "name": "mensagemMotivacional",
                        "type": "string",
                        "indexed": false,
                        "internalType": "string"
                    }
                ],
                "anonymous": false
            },
            {
                "type": "event",
                "name": "MetaBatida",
                "inputs": [
                    {
                        "name": "user",
                        "type": "address",
                        "indexed": true,
                        "internalType": "address"
                    }
                ],
                "anonymous": false
            },
            {
                "type": "event",
                "name": "PremioDitribuido",
                "inputs": [
                    {
                        "name": "user",
                        "type": "address",
                        "indexed": true,
                        "internalType": "address"
                    },
                    {
                        "name": "amount",
                        "type": "uint256",
                        "indexed": false,
                        "internalType": "uint256"
                    }
                ],
                "anonymous": false
            }
        ]
    }
}
} as const;

export default deployedContracts satisfies GenericContractsDeclaration;
