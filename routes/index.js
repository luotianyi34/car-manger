const express = require('express');
const router = express.Router();
const conn = require("../util/db")
const result = require("../util/json")

/*跳转登录页*/
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get("/home",function (req,res) {
  res.render("home/home",{loginInfo:req.session.loginInfo})
})
router.get("/welcome",function (req, res) {
  res.render("home/welcome")
})

router.post("/login",function (req, res) {
  const {body} = req;
  let sql = "select * from userinfo where username = ? and password = ?";
  conn.query(sql,[body.username,body.password],function (e,r) {
    if(e) throw e;
    if(r.length === 1){
      const user = r[0];
      if(user.status === 1){
        req.session.loginInfo = user;
        res.json(result.ok(user));
      } else {
        res.json(result.error("该用户已被封禁"));
      }
    } else {
      res.json(result.error("用户名或密码不正确"));
    }
  })
})
router.post('/logout', function (req, res) {
  req.session.loginInfo = null;
  res.json(result.ok());
})

module.exports = router;
