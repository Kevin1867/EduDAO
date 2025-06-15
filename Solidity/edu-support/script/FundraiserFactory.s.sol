// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {FundraiserFactory} from "../src/FundraiserFactory.sol";
import {Fundraiser} from "../src/Fundraiser.sol";
import * as fs from "fs";

contract DeployFundraiserFactory is Script {
    function run() public returns (FundraiserFactory) {
        vm.startBroadcast();
        FundraiserFactory factory = new FundraiserFactory();
        vm.stopBroadcast();

        // Get the path to the frontend's abi directory
        string memory abiPath = "../../Web/edu-support-app/src/edu-support/abi/";
        
        // Write the factory address to a JSON file
        string memory factoryAddressJson = string.concat(
            '{"address":"',
            vm.toString(address(factory)),
            '"}'
        );
        fs.writeFile(
            string.concat(abiPath, "FundraiserFactory-addr.json"),
            factoryAddressJson
        );

        // Write the factory ABI to a JSON file
        fs.writeFile(
            string.concat(abiPath, "FundraiserFactory-abi.json"),
            vm.readFile("out/FundraiserFactory.sol/FundraiserFactory.json")
        );

        // Write the fundraiser ABI to a JSON file
        fs.writeFile(
            string.concat(abiPath, "Fundraiser-abi.json"),
            vm.readFile("out/Fundraiser.sol/Fundraiser.json")
        );

        return factory;
    }
}
