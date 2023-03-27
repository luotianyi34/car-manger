const express = require('express');
const router = express.Router();
const connection = require("../util/db")
const result = require("../util/json")

router.get("/list",function (req,res) {
    res.render("department/department-list");
})

router.get("/page",function (req, res) {
    const { query } = req;
    const params = [];
    let sql = "select * from department where 1 = 1 ";
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
    connection.query(sql,params,function (e,dList) {
        if(e) throw e;
        let countSql = "select count(*) count from department where 1 = 1 ";
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
            res.send(result.page(dList, r[0].count));
        });
    });
})

router.delete("/delete/:id", function (req, res) {
    connection.query("delete from department where id = ?", [req.params.id], function (e, r) {
        if (e) throw e;
        if (r.affectedRows === 1) {
            res.send(result.ok());
        } else {
            res.send(result.error("删除失败"));
        }
    })
});

router.get("/edit", function (req, res) {
    const {query} = req;
    if (query.id) {
        connection.query("select * from department where id = ?", query.id, function (e, r) {
            if (e) throw e;
            res.render("department/department-edit", {department: r[0]})
        })
    } else {
        res.render("department/department-edit", {department: {}})
    }
})

router.post("/update", function (req, res) {
    const {body} = req;
    if (body.id) {
        let sql = "update department set name = ?,profile = ?,status = ? where id = ?";
        const params = [body.name, body.profile, body.status, body.id];
        connection.query(sql, params, function (e, r) {
            if (e) throw e;
            if (r.affectedRows === 1) {
                res.send(result.ok());
            } else {
                res.send(result.error("修改失败"));
            }
        });
    } else {
        let sql = "insert into department values(null,?,?,?)";
        const params = [body.name, body.profile, body.status];
        connection.query(sql, params, function (e, r) {
            if (e) throw e;
            if (r.affectedRows === 1) {
                res.send(result.ok());
            } else {
                res.send(result.error("添加失败"));
            }
        });
    }
})

router.get("/select", function (req, res) {
    const {query} = req;
    let sql = "select * from department ";
    const params = [];
    if (query.status) {
        sql += "where status = ? ";
        params.push(query.status)
    }
    sql += "order by id desc";
    connection.query(sql, params, function (e, dList) {
        if (e) throw e;
        res.send(result.ok(dList));
    });
})

module.exports = router;
