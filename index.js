const express = require('express'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    uuid = require('uuid'),
    mongoose = require('mongoose');

const Models = require('./models.js');


const Movies = Models.Movie;
const Users = Models.User;
  

const app = express();

// apply body-parser
mongoose.connect('mongodb://localhost:27017/MovieBaseDB', { useNewUrlParser: true, useUnifiedTopology: true });
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

// apply morgan
app.use(morgan('common'));


// direct static request to the public folder
app.use(express.static('public'));



// list movies
/*let movies = [
    {
        title: 'Indiana Jones and the Last Crusade',
        director: {
            name: 'Steven Spielberg'
        },
        genre: {
            name:'Action Adventure',
            description:''
        }
    },
    {
        title: 'Indiana Jones and the Raiders of the Lost Ark',
        director: {
            name: 'Steven Spielberg'
        },
        genre: {
            name:'Action Adventure',
            description:''
        }
    },
    {
        title: 'Star Wars: A New Hope',
        director: {
            name: 'George Lucas'
        },
        genre: {
            name: 'Science Fiction',
            description:''
        }
    },
    {
        title: 'Star Wars: The Empire Strikes Back',
        director: {
            name: 'Irvin Kershner'
        },
        genre: {
            name: 'Science Fiction',
            description:''
        }
    },
    {
        title: 'Star Wars: The Return of the Jedi',
        director: {
            name: 'Richard Marquand'
        },
        genre: {
            name: 'Science Fiction',
            description:''
        }
    },
    {
        title: 'The Lord of the Rings: The FellowShip of the Ring',
        director: {
            name: 'Peter Jackson'
        },
        genre: {
            name: 'Fantasy',
            description:''
        }
    }
];

let users = [
    {
        name: 'David',
        id: 1,
        favoriteMovies: []
    }
];*/

// CREATES

// create new user
app.post('/users', (req, res) => {
    Users.findOne({ Username: req.body.Username})
    .then((user) => {
        if (user) {
            return res.status(400).send(req.body.Username + 'already exists');
        } else {
            Users
            .create({
                Username: req.body.Username,
                Password: req.body.Password,
                Email: req.body.Email,
                Birthday: req.body.Birthday
            })
            .then((user) =>{res.status(201).json(user) })
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
app.post('/users/:Username/movies/:MovieID', (req, res) => {
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
app.delete('/users/:Username/movies/:MovieID', (req, res) => {
   Users.findOneAndUpdate({ Username: req.params.Username }, {
        $pull: {FavouriteMovies: req.params.MovieID}
    },
    { new: true },
    (err, updatedUser) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error: '+ err);
        } else {
            res.json(updatedUser);
        }
   });
});

// Delete a user by username
app.delete('/users/:Username', (req, res) => {
    Users.findOneAndRemove ({ Username: req.params.Username})
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
app.put('/users/:Username', (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username}, { $set:
        {
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday
    }
},
{ new: true}, // this line makes sure that the updated document is returned
(err, updatedUser) => {
    if(err) {
        console.error(err);
        res.status(500).send('Error' + err);
        } else {
            res.json(updatedUser);
        }
    });
});

// READS

// send request for the ENTIRE movie list
app.get('/movies', (req, res)=>{
    Movies.find()
    .then((movies) => {
        res.status(201).json(movies);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send("Error: "+ err);
    });
});

// request movie by title
app.get('/movies/:title', (req, res) => {
  Movies.findOne({ Title: req.params.title})
    .then((movie) => {
        res.json(movie);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    }); 
}); 

// request info about genre
app.get('/movies/genres/:Name', (req, res) => {
   Movies.findOne({ 'Genre.Name': req.params.Name })
   .then((movies) => {
    res.json(movies.Genre);
   })
   .catch((err) => {
    console.error(err);
    res.status(500).send('Error ' + err );
   });
});

// request director by name
app.get('/movies/directors/:Name', (req, res) => {
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
app.get('/users', (req, res) => {
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
app.get('/users/:Username', (req, res) => {
    Users.findOne({ Username: req.params.Username})
    .then((user) => {
        res.json(user);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error' + err);
    });
});





app.get('/', (req, res) => {
    res.send('Welcome to MovieBase');
});

app.get('/documentation.html', (req, res) => {
    res.sendFile('public/documentation.html', {root: __dirname});
});

// error handling middleware
app.use((err, req, res, next) =>{
    console.error(err.stack);
    res.status(500).send('...feels like a mistake to me.')
});

app.listen(8080, () => {
    console.log('Your app is listening on port 8080');
});