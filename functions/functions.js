const crypto = require('crypto');
const { URLSearchParams } = require('url');

/*
    -----------------
    HELPING FUNCTIONS
    -----------------
    don't repeat
    -----------------
*/

/**
    *
    * @param {string} sc Base URL 
    * @param {string} u URL Query String
    * @param {string} s Signature
    * 
*/
const rs = (u, q, s) => {
    return `${u}/${q}&signature=${s}`;
}

const fn_pair = (asset, base) => {
    let str = asset.toUpperCase()+base.toUpperCase();
    return { asset, base, str };
}

/**
    *
    * @param {object} p Payload
    * @param {number} s API Secret
    * 
*/
const pl = (p, s) => {
    p['timestamp'] = Date.now();
    let payload = (new URLSearchParams(p)).toString();

    let signature = crypto.createHmac('sha256', s).update(payload).digest("hex");
    return { payload, signature };
}

const fn_order_validate = (order) => {
    if (typeof order !== 'object') { return { status: false, message: "Order is not object" }; }
    if (!('side' in order)) { return { status: false, message: "Order object 'side' key not exists" }; }
    if (!('executedQty' in order)) { return { status: false, message: "Order object 'executedQty' key not exists" }; }
    if (!('price' in order)) { return { status: false, message: "Order object 'price' key not exists" }; }

    return { status: true, side: order.side, amount: order.executedQty, price: order.price };
}

module.exports = { rs, fn_pair, pl, fn_order_validate }
