if(process.env.NODE_ENV !== "production"){
    require('dotenv').config(); 
}

console.log(process.env.SECRET);

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const cors=require('cors');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError'); 
const passport = require('passport');
const LocalStrategy = require('passport-local');    
const User = require('./models/user');

const userRoutes = require('./routes/users')
const campgroundsRoutes = require('./routes/campgrounds');
const reviewsRoutes = require('./routes/reviews');

mongoose.connect('mongodb://0.0.0.0:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error"));
db.once("open", () => {
    console.log("Database connected");
});

 
const app = express();

app.engine('ejs',ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use(express.urlencoded({ extended: true })); //parse data
app.use(methodOverride('_method'));
app.use(cors())
app.use(express.static(path.join(__dirname,'public')));



const sessionConfig={
    secret:'thisshouldbeabettersecret',
    resave: false,
    saveUninitialized: true,
    cookie:{
        htttpOnly: true,
        expires:Date.now() + 1000* 60 * 60 * 24 * 7,
        maxAge: Date.now() + 1000* 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig));
app.use(flash())

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); 

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    console.log(req.session);
    res.locals.currentUser = req.user;  
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error')
    next();
})

app.get('/fakeuser', async(req,res) => {
    const user = new User({email:'anurag@gmail.com', username:'anurag'});
    const newUser = await User.register(user,'chiken');
    res.send(newUser);
})

app.use('/',userRoutes);
app.use('/campgrounds', campgroundsRoutes);
app.use('/campgrounds/:id/reviews', reviewsRoutes);


app.get('/', (req, res) => {
    res.render('home');
})

app.all('*',(req,res,next) => {
    next(new ExpressError(404,'Page Not Found'));
})

app.use((err,req,res,next) => {
    const{status=500} = err;
    if(!err.message) err.message = 'Oh no, Something Went Wrong'
    res.status(status).render('error', { err });
})

app.listen(3000, () => {
    console.log("Connection Open");
})