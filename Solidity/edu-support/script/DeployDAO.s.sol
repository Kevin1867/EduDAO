// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {EduDAO} from "../src/EduDAO.sol";
import {Fundraiser} from "../src/Fundraiser.sol";
import {FundraiserFactory} from "../src/FundraiserFactory.sol";

contract DeployDAO is Script {
    function run() external returns (EduDAO, FundraiserFactory) {
        address deployer = msg.sender;
        console.log("Deployer address:", deployer);
        vm.startBroadcast();

        // 1. Deploy EduDAO
        EduDAO eduDAO = new EduDAO();
        console.log("EduDAO deployed at:", address(eduDAO));

        // 2. Deploy FundraiserFactory and link it to the EduDAO contract
        FundraiserFactory fundraiserFactory = new FundraiserFactory(address(eduDAO));
        console.log("FundraiserFactory deployed at:", address(fundraiserFactory));

        // 3. Add the factory as a member of the DAO so it can create proposals
        eduDAO.addMember(address(fundraiserFactory));
        console.log("FundraiserFactory has been added as a member of EduDAO.");

        vm.stopBroadcast();
        return (eduDAO, fundraiserFactory);
    }
} 