const express = require('express');
const fs = require('fs');

const app = express();
app.use(express.json());

const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

app.get('/api/v1/tours/:id', (req, res) => {
    const id = req.params.id * 1;

    if (id > tours.length) {
        return res.status(404).json({
            status: 'failed',
            message: `${id} doesn't exist`,
        });
    }

    const tour = tours.find((el) => el.id === id);

    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            tour,
        },
    });
});

app.post('/api/v1/tours', (req, res) => {
    const newID = tours[tours.length - 1].id + 1;
    const newTour = Object.assign(newID, req.body);

    tours.push(newTour);
    fs.writeFile(
        `${__dirname}/dev-data/data/tours-simple.json`,
        JSON.stringify(tours),
        (err) => {
            res.status(201).json({
                status: 'Success',
                data: {
                    tour: newTour,
                },
            });
        }
    );
    res.send('DONE!!');
});

app.patch('/api/v1/tours/:id', (req, res) => {
    //This is how you would update just the specific information that needs to be updated.
    const id = req.params.id * 1;

    if (id > tours.length) {
        return res.status(404).json({
            status: 'failed',
            message: `${id} doesn't exist`,
        });
    }

    res.status(200).json({
        status: 'success',
        data: {
            tour: 'Updated Tour',
        },
    });
});

app.delete('/api/v1/tours/:id', (req, res) => {
    //This is how you would update just the specific information that needs to be updated.
    const id = req.params.id * 1;

    if (id > tours.length) {
        return res.status(404).json({
            status: 'failed',
            message: `${id} doesn't exist`,
        });
    }

    res.status(204).json({
        status: 'success',
        data: null,
    });
});

const port = 3000;
app.listen(port, () => {
    console.log(`App is listening on port ${port}`);
});
