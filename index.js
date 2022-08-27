const express = require('express'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    uuid = require('uuid');

const app = express();

// apply morgan
app.use(morgan('common'));

// apply body-parser
app.use(bodyParser.json());

// direct static request to the public folder
app.use(express.static('public'));


// list movies
let movies = [
    {
        Title: 'Indiana Jones and the Last Crusade',
        Director: {
            Name: 'Steven Spielberg'
        },
        Genre: {
            Name:'Action Adventure',
            Description:''
        }
    },
    {
        Title: 'Indiana Jones and the Raiders of the Lost Ark',
        Director: {
            Name: 'Steven Spielberg'
        },
        Genre: {
            Name:'Action Adventure',
            Description:''

        }
    },
    {
        Title: 'Star Wars: A New Hope',
        Director: {
            Name: 'George Lucas'
        },
        Genre: {
            Name: 'Science Fiction',
            Description:''

        }
    },
    {
        Title: 'Star Wars: The Empire Strikes Back',
        Director: {
            Name: 'Irvin Kershner'
        },
        Genre: {
            Name: 'Science Fiction',
            Description:''

        }
    },
    {
        Title: 'Star Wars: The Return of the Jedi',
        Director: {
            Name: 'Richard Marquand'
        },
        Genre: {
            Name: 'Science Fiction',
            Description:''
        }
    },
    {
        Title: 'The Lord of the Rings: The FellowShip of the Ring',
        Director: {
            Name: 'Peter Jackson'
        },
        Genre: {
            Name: 'Fantasy',
            Description:''
        }
    }
];

let users = [
    {
        Name: 'David',
        id: 1,
        favoriteMovies: []
    }
];

// CREATES

// create new user
app.post('/users', (req, res) => {
    const newUser = req.body;

    if (newUser.Name) {
        newUser.id = uuid.v4();
        users.push(newUser);
        res.status(201).json(newUser);
    } else {
        res.status(400).send('users require a name');
    }
});

// allow user to add to favorite movies
app.post('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;

    let user = users.find(user => user.id == id); /* use == here because on is an int other is a string */

    if (user) {
        user.favoriteMovies.push(movieTitle);
        res.status(200).send(`${movieTitle} has been added to user ${id} array`);
    } else {
        res.status(400).send('no such user');
    }
});

// Delete

// allow user to delete from favoriteMovies
app.delete('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;

    let user = users.find(user => user.id == id); /* use == here because on is an int other is a string */

    if (user) {
        user.favoriteMovies.filter(title => title !== movieTitle);
        res.status(200).send(`${movieTitle} has been removed from user ${id} array`);
    } else {
        res.status(400).send('no such user');
    }
});

// allows user to unregister
app.delete('/users/:id', (req, res) => {
    const { id } = req.params;

    let user = users.find(user => user.id == id); /* use == here because on is an int other is a string */

    if (user) {
        users =  users.filter(user => user.id != id);
        res.status(200).send(`User ${id} has been deleted`);
    } else {
        res.status(400).send('no such user');
    }
});

// UPDATEs

// all user to change name
app.put('/users/:id', (req, res) => {
    const { id } = req.params;
    const updatedUser = req.body;

    let user = users.find(user => user.id == id); /* use == here because on is an int other is a string */

    if (user) {
        user.Name = updatedUser.Name;
        res.status(200).json(user);
    } else {
        res.status(400).send('no such user');
    }
});

// READS

// send request for the ENTIRE movie list
app.get('/movies', (req, res)=>{
    res.status(200).json(movies);
});

// request movie by title
app.get('/movies/:title', (req, res) => {
    const { title } = req.params;
    const movie = movies.find(movie => movie.Title === title);

    if (movie) {
        res.status(200).json(movie);
    } else {
        res.status(400).send('No such movie');
    }
});

// request info about genre
app.get('/movies/genre/:genreName', (req, res) => {
    const { genreName } = req.params;
    const genre = movies.find(movie => movie.Genre.Name === genreName).Genre;

    if (genre) {
        res.status(200).json(genre);
    } else {
        res.status(400).send('No such genre');
    }
});

// request director by name
app.get('/movies/director/:directorName', (req, res) => {
    const { directorName } = req.params;
    const director = movies.find(movie => movie.Director.Name === directorName).Director;

    if (director) {
        res.status(200).json(director);
    } else {
        res.status(400).send('No such director');
    }
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