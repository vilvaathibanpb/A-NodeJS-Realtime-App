const config = require('../../config/main');
const textSearch = require('mongoose-text-search');
const Product = require('../models/product');

// SMS Notification
exports.masterSearch = function (req, res) {
    console.log(req.body.category);
    if(req.body.category){
        Product.findOne({
            product_category: req.body.category
        }, function (err, response) {
            if (err) { res.send(req.params.category); return; }
            if (!response) { res.status(404).send("The product type dont exist"); return; }
            res.json(response);
        })
    }else{
        Product.find({},(err, response)=>{
            if(err) { res.send(err); return; }
            res.send(response);

        });
    }
}

