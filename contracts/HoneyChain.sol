// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// @title HoneyChain
/// @notice Stores an immutable, tamper-evident hash for each honey batch.
///         The actual batch data (beekeeper, hive, quantity, quality, IoT
///         readings) lives in the off-chain database; only its hash is
///         written here, so anyone can prove the off-chain record was not
///         altered after the fact.
contract HoneyChain {
    struct BatchRecord {
        string dataHash;
        uint256 timestamp;
        address registeredBy;
        bool exists;
    }

    mapping(string => BatchRecord) private batches;
    address public owner;

    event BatchRegistered(
        string indexed batchId,
        string dataHash,
        address indexed registeredBy,
        uint256 timestamp
    );

    constructor() {
        owner = msg.sender;
    }

    /// @notice Registers a new honey batch. Reverts if the batchId was
    ///         already registered, so records can never be overwritten.
    function registerBatch(string memory batchId, string memory dataHash) public {
        require(!batches[batchId].exists, "Batch already registered");
        batches[batchId] = BatchRecord(dataHash, block.timestamp, msg.sender, true);
        emit BatchRegistered(batchId, dataHash, msg.sender, block.timestamp);
    }

    /// @notice Reads back a batch's on-chain record for verification.
    function getBatch(string memory batchId)
        public
        view
        returns (string memory dataHash, uint256 timestamp, address registeredBy)
    {
        require(batches[batchId].exists, "Batch not found");
        BatchRecord memory record = batches[batchId];
        return (record.dataHash, record.timestamp, record.registeredBy);
    }

    function batchExists(string memory batchId) public view returns (bool) {
        return batches[batchId].exists;
    }
}
