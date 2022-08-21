const express = require('express'),
    morgan = require('morgan');

const app = express();

// apply morgan
app.use(morgan('common'));

// direct static request to the public folder
app.use(express.static('public'));


// list 10 fav movies
let topTenMovies = [
    {
        title: 'Indiana Jones and the Last Crusade',
        director: 'Steven Spielberg'
    },
    {
        title: 'Indiana Jones and the Raiders of the Lost Ark',
        director: 'Steven Spielberg'
    },
    {
        title: 'Star Wars: A New Hope',
        director: 'Gorge Lucas'
    },
    {
        title: 'Star Wars: The Empire Strikes Back',
        director: 'Irvin Kershner'
    },
    {
        title: 'Star Wars: The Return of the Jedi',
        director: 'Richard Marquand'
    },
    {
        title: 'The Lord of the Rings: The FellowShip of the Ring',
        director: 'Peter Jackson'
    }
]

// send request for the 10 movie list
app.get('/movies', (req, res)=>{
    res.json(topTenMovies);
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