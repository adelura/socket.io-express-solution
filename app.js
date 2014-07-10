var app = require('express')(),
    session = require('express-session'),
    cookie = require('cookie'),
    cookieParser = require('cookie-parser'),
    sessionStore = new session.MemoryStore();

app.get('/', function (req, res) {
   res.render('index');
});

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(cookieParser('secret'));
app.use(session({
    name: 'sid',
    store: sessionStore,
    secret: 'secret',
    saveUninitialized: true,
    resave: true,
    cookie: {
        path: '/',
        httpOnly: true,
        secure: false,
        maxAge: null
    }
}));

var server = require('http').Server(app).listen(8888),
    io = require('socket.io')(server);

io.use(function(socket, next) {
    var data = socket.handshake || socket.request;

    if (data.headers.cookie) {
        data.cookie = cookie.parse(cookieParser.signedCookie(data.headers.cookie, 'secret'));

        console.log('data.cookies ( %s )', JSON.stringify(data.cookie));

        if (data.cookie.sid) {
            data.sid = data.headers.cookie.sid;
            sessionStore.get(data.headers.cookie.sid, function(err, session) {
                data.session = session;
            });
        }
    }

    next();
});