const express = require('express');
const router = express.Router();
const connection = require("../util/db")
const result = require("../util/json")

router.get("/list", function (req, res) {
    res.render("userinfo/userinfo-list");
})

router.get("/page", function (req, res) {
    const {query} = req;
    let sql = "select u.*,d.name dname from userinfo u left join department d on u.department_id = d.id where 1 = 1 ";
    const params = [];
    sql = setSqlParams(query, sql, params);
    sql += " order by u.id desc limit ?,?";
    params.push((query.page - 1) * query.limit);
    params.push(parseInt(query.limit));
    connection.query(sql, params, function (e, userList) {
        if (e) throw e;
        let countSql = "select count(u.id) count from userinfo u left join department d on u.department_id = d.id where 1 = 1 ";
        const countParams = [];
        countSql = setSqlParams(query, countSql, countParams);
        connection.query(countSql, countParams, function (e, r) {
            if (e) throw e;
            res.send(result.page(userList, r[0].count));
        });
    });
})

router.delete("/delete/:id", function (req, res) {
    const userId = req.params.id;
    if (userId == 1) {
        res.send(result.error("管理员禁止删除！"));
    } else if (userId == req.session.loginInfo.id) {
        res.send(result.error("当前登录用户禁止删除！"));
    } else {
        connection.query("delete from userinfo where id = ? ", [userId], function (e, r) {
            if (e) throw e;
            res.send(r.affectedRows === 1 ? result.ok() : result.error("删除失败!"))
        });
    }
})

router.get("/edit", function (req, res) {
    const {query} = req;
    if (query.id) {
        connection.query("select * from userinfo where id = ?", [query.id], function (e, r) {
            if (e) throw e;
            res.render("userinfo/userinfo-edit", {userinfo: r[0]})
        });
    } else {
        res.render("userinfo/userinfo-edit", {userinfo: {}})
    }
})
router.post("/save", function (req, res) {
    const {body} = req;
    connection.query("select * from userinfo where username = ?", [body.username], function (e, r) {
        if (e) throw e;
        if (r.length > 0) {
            res.json(result.error("该用户名已存在！"));
        } else {
            let sql = "INSERT INTO userinfo values (null,?,'666888',?,?,?,?,?,?,?,?)"
            const params = [body.username, body.nickname, body.phone, body.department_id, body.power, body.status, body.avatar, body.driver_license, body.driver_age ? body.driver_age : null];
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

router.post("/update", function (req, res) {
    const {body} = req;
    let sql = "update userinfo set nickname = ?, phone = ?, department_id = ?, power = ?, status = ?,avatar = ?, driver_license = ?, driver_age = ? where id = ?";
    const params = [body.nickname, body.phone, body.department_id, body.power ? body.power : 1, body.status, body.avatar, body.driver_license, body.driver_age ? body.driver_age : null, body.id];
    connection.query(sql, params, function (e, r) {
        if (e) throw e;
        if (r.affectedRows === 1) {
            res.json(result.ok());
        } else {
            res.json(result.error("修改失败"))
        }
    });
})
router.get('/password', function (req, res) {
    res.render('userinfo/userinfo-password', {username: req.session.loginInfo.username})
})
router.post('/pwd', function (req, res) {
    const {body} = req;
    const userId = req.session.loginInfo.id;
    connection.query("select * from userinfo where id = ? and password = ?", [userId, body.oldPassword], function (e, r) {
        if (e) throw e;
        if (r.length > 0) {
            connection.query("update userinfo set password = ? where id = ?", [body.password, userId], function (e, r) {
                if (e) throw e;
                if (r.affectedRows > 0) {
                    req.session.loginInfo = null;
                    res.json(result.ok())
                } else {
                    res.json(result.error("修改失败"))
                }
            })
        } else {
            res.json(result.error("原密码不正确！"));
        }
    });
})

function setSqlParams(query, sql, params) {
    if (query.username) {
        sql += " and u.username = ? ";
        params.push(query.username);
    }
    if (query.nickname) {
        sql += "and u.nickname like ? ";
        params.push(`%${query.nickname}%`);
    }
    if (query.phone) {
        sql += "and u.phone = ? ";
        params.push(query.phone);
    }
    if (query.department_id) {
        sql += "and u.department_id = ? ";
        params.push(query.department_id);
    }
    if (query.power) {
        sql += "and u.power = ? ";
        params.push(query.power);
    }
    if (query.status) {
        sql += "and u.status = ? ";
        params.push(query.status);
    }
    return sql;
}

module.exports = router;
