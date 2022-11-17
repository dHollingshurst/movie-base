const express = require('express'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    uuid = require('uuid'),
    mongoose = require('mongoose');

const { check, validationResult } = require('express-validator');

const Models = require('./models.js');


const Movies = Models.Movie;
const Users = Models.User;


const app = express();

// apply body-parser
// the below line is commented out but should be used instead of the one below it if you wish to test locally
//mongoose.connect('mongodb://localhost:27017/MovieBaseDB', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// cross origin resource sharing package

const cors = require('cors');
app.use(cors());

//the following code limits access to listed origins. 
//if used, it replaces app.use(cors()) above 
// let allowedOrigins = ['http://localhost:8080', 'http://testsite.com', 'http://localhost:1234', 'https://davemoviebase.herokuapp.com/'];

// app.use(cors({
//     origin: (origin, callback) => {
//         if (!origin) return callback(null, true);
//         if (allowedOrigins.indexOf(origin) === -1) {//if a specific origin isn't found on the list of allowed origins. -1 is a non existant index value as indices start at 0

//             let message = 'The CORS policy for this application does not allow access from origin' + origin;
//             return callback(new Error(message), false);
//         }
//         return callback(null, true);
//     }
// }));

// passport. this must come after body-parser
let auth = require('./auth.js')(app);
const passport = require('passport');
require('./passport.js');

// apply morgan
app.use(morgan('common'));


// direct static request to the public folder
app.use(express.static('public'));

// CRUD operations begin

// READS

app.get('/', (req, res) => {
    res.sendFile(__dirname + 'index.html')
})

// send request for the ENTIRE movie list
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.find()
        .then((movies) => {
            res.status(201).json(movies);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send("Error: " + err);
        });
});

// request movie by title
app.get('/movies/:title', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ Title: req.params.title })
        .then((movie) => {
            res.json(movie);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// get fav movies
app.get('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.find({ MovieID: req.params.MovieID })
        .then((movie) => {
            res.json(movie);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error:' + err);
        });
});

// request info about genre
app.get('/movies/genres/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ 'Genre.Name': req.params.Name })
        .then((movies) => {
            res.json(movies.Genre);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error ' + err);
        });
});

// request director by name
app.get('/movies/directors/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ 'Director.Name': req.params.Name })
        .then((movies) => {
            res.json(movies.Director);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error' + err);
        });
});

// get all users
app.get('/users', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.find()
        .then((users) => {
            res.status(201).json(users);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error:' + err);
        });
});

// get a user by username
app.get('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOne({ Username: req.params.Username })
        .then((user) => {
            res.json(user);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error' + err);
        });
});



// CREATE

// create new user
app.post('/users', /*validation logic for request. */[
    check('Username', 'Username is required').isLength({ min: 5 }),
    check('Username', 'Username containts non-alphanumberic characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').isLength({ min: 8 }),
    check('Email', 'Email is not valid').isEmail()
], (req, res) => {
    // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username }) // check if username already exists
        .then((user) => {
            if (user) {
                return res.status(400).send(req.body.Username + 'already exists');
            } else {
                Users
                    .create({
                        Username: req.body.Username,
                        Password: hashedPassword,
                        Email: req.body.Email,
                        Birthday: req.body.Birthday
                    })
                    .then((user) => { res.status(201).json(user) })
                    .catch((error) => {
                        console.error(error);
                        res.status(500).send('Error: ' + error);
                    })
            }
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
        });
});

// allow user to add to favorite movies
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username }, {
        $push: { FavouriteMovies: req.params.MovieID }
    },
        { new: true },
        (err, updatedUser) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error: ' + err);
            } else {
                res.json(updatedUser);
            }
        });
});

// Delete

// allow user to delete from favoriteMovies
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username }, {
        $pull: { FavouriteMovies: req.params.MovieID }
    },
        { new: true },
        (err, updatedUser) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error: ' + err);
            } else {
                res.json(updatedUser);
            }
        });
});

// Delete a user by username
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndRemove({ Username: req.params.Username })
        .then((user) => {
            if (!user) {
                res.status(400).send(req.params.Username + ' was not found');
            } else {
                res.status(200).send(req.params.Username + ' was deleted');
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});


// UPDATEs

// allow user to update info
app.put('/users/:Username', passport.authenticate('jwt', { session: false }), [
    check('Username', 'Username is required').isLength({ min: 5 }),
    check('Username', 'Username contains non-alphanumeric characters - not allowed').isAlphanumeric(),
    check('Password', 'Password is required').isLength({ min: 8 }),
    check('Email', 'Email is not valid').isEmail()
], (req, res) => {

    // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);

    Users.findOneAndUpdate({ Username: req.params.Username }, {
        $set:
        {
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday
        }
    },
        { new: true }, // this line makes sure that the updated document is returned
        (err, updatedUser) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error' + err);
            } else {
                res.json(updatedUser);
            }
        });
});


app.get('/documentation.html', (req, res) => {
    res.sendFile('public/documentation.html', { root: __dirname });
});

// // error handling middleware
// app.use((err, req, res, next) => {
//     console.error(err.stack);
//     res.status(500).send('...feels like a mistake to me.')
// });

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log('Listening on Port' + port);
});