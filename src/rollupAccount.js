const crypto = require('crypto');
const ZERO = BigInt(0);

/**
 * @title Offchain (EdDSA) account state
 */
module.exports = class L2Account {

    /// CIRCOMLIBJS HELPERS ///
    poseidon; // Poseidon Hasher Object
    eddsa; // EdDSA Signing/ Verification w. stored private key

    /// ACCOUNT STATE ///
    index; // bigint
    prvkey; // bigint
    pubkey; // bigint[2]
    balance; // bigint;
    nonce; // bigint;
    tokenType; // bigint

    /// ACCOUNT CRYPTO ///
    root; // bigint

    /**
     * Construct a new L2 account
     * 
     * @param { Object } _poseidon - the circomlibjs poseidon hasher
     * @param { Object } _eddsa - the circomlibjs eddsa signer
     * @param { bigint } _prvkey - 32 byte string
     * @param { bigint } _balance - (default 0) the amount of tokens held by this account
     * @param { bigint } _nonce - (default 0) the number of transactions this account has sent
     * @param { bigint } _tokenType - (default ether) the type of ERC20 
     * @return { L2Account } - initialized L2 account class
     */
    constructor(
        _poseidon,
        _eddsa,
        _prvkey,
        _balance = BigInt(0),
        _nonce = BigInt(0),
        _tokenType = BigInt(1)
    ) {
        // assign circomlibjs helpers
        this.poseidon = _poseidon;
        this.eddsa = _eddsa
        // set account wallet
        this.prvkey = _prvkey;
        this.pubkey = this.eddsa.prv2pub(this.prvkey);
        // set rollup account
        this.balance = _balance;
        this.nonce = _nonce;
        this.tokenType = _tokenType;
        // generate and set account root hash
        this.root = this.hash();
    }

    /** 
     * Return the root for an empty leaf
     * @param { Object } _poseidon - the circomlibjs poseidon hasher
     * @return { bigint }- initialized account root
     */
    static emptyRoot(_poseidon) {
        const data = [ZERO, ZERO, ZERO, ZERO, ZERO];
        return _poseidon(data)
    }

    /**
     * Generate a new account with a random eddsa private key
     * @param {Object} _poseidon - the circomlibjs poseidon hasher
     * @param {Object} _eddsa - the circomlibjs eddsa signer
     */
    static genAccount(_poseidon, _eddsa) {
        const prv = crypto.randomBytes(32);
        return new L2Account(_poseidon, _eddsa, prv);
    }

    /**
     * Generate a hash of the account to get the account leaf hash
     * 
     * @return { bigint } - the MiMC7 hash of the account state
     */
    hash() {
        const data = [
            this.pubkey[0].toString(),
            this.pubkey[1].toString(),
            this.balance.toString(),
            this.nonce.toString(),
            this.tokenType.toString()
        ]
        return this.mimc7.multiHash(data);
    }

    /**
     * Debit balance from the account & increase nonce
     * @param { bigint } _amount - the amount of tokens being withdrawn from the account
     */
    debit(_amount) {
        this.balance -= _amount;
        this.nonce += 1;
        this.root = this.hash();
    }

    /**
     * Credit balance in the account
     * @param { bigint } _amount - the amount of tokens being deposited in the account
     */
    credit(_amount) {
        this.balance += _amount;
        this.root = this.hash();
    }

    /**
     * Sign a message with the account's private key using Poseidon EdDSA
     * @param {bigint} data - the data to sign the account with
     */
    sign(data) {

    }
}




