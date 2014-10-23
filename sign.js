var assert = require('assert')
var _ = require('lodash')
var RippleLib = require('ripple-lib')
var DEFAULT_FEE = 10000

module.exports = function(ripple, txJson, secret, cb) {
    txJson = _.clone(txJson)
    txJson.Fee || (txJson.Fee = DEFAULT_FEE)

    // Determine the account sequence
    var req = { account: txJson.Account }

    ripple.request('account_info', req, function(err, res) {
        if (err) return cb(err)

        assert(res.account_data.Sequence)
        txJson.Sequence = res.account_data.Sequence

        var tx = new RippleLib.Transaction()
        tx.remote = null
        tx.tx_json = txJson
        tx._secret = secret
        tx.complete()

        try {
            tx.sign()
        } catch (e) {
            cb(e)
        }

        var hex = tx.serialize().to_hex()

        cb(null, { tx_blob: hex })
    })
}
