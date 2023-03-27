const express = require('express');
const router = express.Router();
const connection = require("../util/db")
const result = require("../util/json")

router.get("/list", function (req, res) {
    res.render("car/car-list");
})

router.get("/page", function (req, res) {
    const {query} = req;
    const params = [];
    let sql = "select * from car where 1 = 1 ";
    if(query.name){
        sql += "and name = ? ";
        params.push(query.name);
    }
    if(query.status){
        sql+= "and status = ? ";
        params.push(query.status);
    }
    sql+=" order by id desc limit ?,?";
    params.push((query.page - 1) * query.limit);
    params.push(parseInt(query.limit));
    connection.query(sql,params,function (e,carList) {
        if(e) throw e;
        let countSql = "select count(*) count from car where 1 = 1 ";
        const countParams = [];
        if(query.name){
            countSql += "and name = ? ";
            countParams.push(query.name);
        }
        if(query.status){
            countSql+= "and status = ? ";
            countParams.push(query.status);
        }
        connection.query(countSql,countParams,function (e,r){
            if(e) throw e;
            res.send(result.page(carList, r[0].count));
        });
    });
})

router.get("/edit", function (req, res) {
    const {query} = req;
    if (query.id) {
        connection.query("select * from car where id = ?", [query.id], function (e, r) {
            if (e) throw e;
            res.render("car/car-edit", {car: r[0]})
        });
    } else {
        res.render("car/car-edit", {car: {}})
    }
})

router.post("/update", function (req, res) {
    const {body} = req;
    let sql = "update car set car_no = ?, color = ?, brand_id = ?, frame_number = ?, driver_photo = ?,car_status = ?, mileage = ?, status = ? where id = ?";
    const params = [body.car_no, body.color, body.brand_id,  body.frame_number, body.driver_photo, body.car_status,body.mileage, body.status, body.id];
    connection.query(sql, params, function (e, r) {
        if (e) throw e;
        if (r.affectedRows === 1) {
            res.json(result.ok());
        } else {
            res.json(result.error("修改失败"))
        }
    });
})

router.delete("/delete/:id", function (req, res) {
    connection.query("delete from car where id = ?", [req.params.id], function (e, r) {
        if (e) throw e;
        if (r.affectedRows === 1) {
            res.send(result.ok());
        } else {
            res.send(result.error("删除失败"));
        }
    })
});

router.get("/select", function (req, res) {
    const {query} = req;
    let sql = "select * from car";
    const params = [];
    if (query.status) {
        sql += "where status = ? ";
        params.push(query.status)
    }
    sql += "order by id desc";
    connection.query(sql, params, function (e, carList) {
        if (e) throw e;
        res.send(result.ok(carList));
    });
})


router.post("/save", function (req, res) {
    const {body} = req;
    connection.query("select * from car where car_no = ?", [body.car_no], function (e, r) {
        if (e) throw e;
        if (r.length > 0) {
            res.json(result.error("该用户名已存在！"));
        } else {
            let sql = "INSERT INTO car values (null,?,?,?,?,?,?,?,?)"
            const params = [body.car_no, body.color, body.brand_id, body.frame_number, body.driver_photo, body.car_status, body.mileage, body.status];
            connection.query(sql, params, function (e, r) {
                if (e) throw e;
                console.log(r)
                if (r.affectedRows === 1) {
                    res.json(result.ok());
                } else {
                    res.json(result.error("添加失败"))
                }
            });
        }
    })
})


module.exports = router;