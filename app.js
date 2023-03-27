const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

/*引入session模块*/
const session=require('express-session');

const indexRouter = require('./routes/index');
const departmentRouter = require('./routes/department');
const userinfoRouter = require('./routes/userinfo');
const uploadRouter = require('./routes/upload');
const brandRouter = require('./routes/brand');
const carRouter = require('./routes/car');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


/*配置session*/
app.use(session({
  secret: "keyboard cat",
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000 * 60 * 30
  }
}));
app.all("/*", function (req, res, next) {
  if (req.session.loginInfo) {
    next();
  } else {
    const urlList = ["/", "/login"];
    let isGo = false;
    for (let i = 0; i < urlList.length; i++) {
      if (urlList[i] === req.url) {
        isGo = true
        break;
      }
    }
    if (isGo) {
      next();
    } else {
      res.redirect("/");//未登录且非白名单则自动重定向到登录页
    }

  }
})

app.use('/', indexRouter);
app.use('/department', departmentRouter);
app.use('/userinfo', userinfoRouter);
app.use('/upload', uploadRouter);
app.use('/brand',brandRouter);
app.use('/car',carRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
