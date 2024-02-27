const ShoppingService = require("../services/shopping-service");
const { PublishMessage } = require("../utils");
const UserAuth = require('./middlewares/auth');
const { CUSTOMER_SERVICE } = require("../config");
const { SubscribeMessage } = require('../utils');

module.exports = (app, channel) => {
    
    const service = new ShoppingService();

    SubscribeMessage(channel, service);

    app.post('/order',UserAuth, async (req,res,next) => {

        const { _id } = req.user;
        const { txnNumber } = req.body;

        const { data } = await service.PlaceOrder({_id, txnNumber});
        
        const payload = await service.GetOrderPayload(_id, data, 'CREATE_ORDER')

        // PublishCustomerEvent(payload)
        PublishMessage(channel,CUSTOMER_SERVICE, JSON.stringify(payload))

        res.status(200).json(data);
    });

    app.get('/orders',UserAuth, async (req,res,next) => {

        const { _id } = req.user;

        const { data } = await service.GetOrders(_id);
        
        res.status(200).json(data);

    });
       
    
    app.get('/cart', UserAuth, async (req,res,next) => {

        const { _id } = req.user;
        
        const { data } = await service.GetCart({ _id });

        return res.status(200).json(data);
    });
}