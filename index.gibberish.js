const axios = require('axios');
const strtotime = require('locutus/php/datetime/strtotime');

const { API_KEY, API_SECRET } = require('./config/config');
const { pl, fn_pair, rs, fn_order_validate } = require('./functions/functions');

axios.defaults.headers.common['X-MBX-APIKEY'] = API_KEY;

const SERVER = "https://api.binance.com/api";

// setting pairs here, first parameter -> asset, second parameter -> base currency
const PAIR = fn_pair("dot", "busd");

/**
    *
    * @section order data fetch
    * @description getting orders data and filtering to get the total
    * 
*/

// default -> 1 day from now
let orders_starting_from = (strtotime(Date.now()) - (86400)) * 1000;

let { payload, signature } = pl ({ symbol: PAIR.str, startTime: orders_starting_from, recvWindow: 5000 }, API_SECRET);
let orders_url = rs(SERVER, `v3/allOrders?${payload}`, signature);

axios.get(orders_url).then(response => {
    if (response.data !== undefined && response.data.trim !== "" && Array.isArray(response.data)) {

        let orders = response.data;
        
        let totals = { base_buy: 0, base_sell: 0, asset_buy: 0, asset_sell: 0, 
            profit: function () {
                return this.base_sell - this.base_buy
            },
            str: function () {
                return `| Buy: ${this.base_buy.toFixed(2)} ${PAIR.base} \t| Sell: ${this.base_sell.toFixed(2)} ${PAIR.base} |\n| Profit: ${this.profit().toFixed(2)} ${PAIR.base}`
            }
        };
        
        // checking orders data
        orders.forEach(order => {

            let _d = fn_order_validate(order);
            if (_d.status) {

                if (order.status !== 'CANCELED' || Number(_d.amount) > 0) {
                    if (_d.side === 'BUY') { 
                        totals.base_buy += Number(_d.amount) * Number(_d.price); 
                        totals.asset_buy += Number(_d.amount);
                    } else { 
                        totals.base_sell += Number(_d.amount) * Number(_d.price); 
                        totals.asset_sell += Number(_d.amount); 
                    }
                }

            } else {
                console.log('E.3.', _d.message);
            }

        });

        console.log(totals.str());

    } else {
        console.log('E.2.', "Response body is invalid");
    }
}).catch(error => {
    console.log('E.1.', error);
});
