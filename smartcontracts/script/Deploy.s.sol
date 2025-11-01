// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "lib/forge-std/src/Script.sol";
import {ChallengePool} from "../src/ChallengePool.sol";

contract DeployScript is Script {
    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        ChallengePool challengePool = new ChallengePool();
        console.log("ChallengePool deployed at:", address(challengePool));

        vm.stopBroadcast();
    }
}