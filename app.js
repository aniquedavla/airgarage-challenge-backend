// Using Express
const express = require('express');
const cors = require('cors');
const axios = require('axios');


const app = express();
const port = 3000;
const API_KEY = process.env.YELP_API;
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.json('Hello World!');
})

app.get('/parking-lots', async (request, response) => {
    console.log("location", request.query.location);
    let locationRequested = request.query.location;
    let config = {
        headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-type": "application/json",
        },
        params: {
            term: "parking lots",
            location: locationRequested ? locationRequested : "San Francisco", 
            sort_by: "rating",
            limit: 50
        },
    }
  try {
    axios.get("https://api.yelp.com/v3/businesses/search", config).then((data)=>{
        let parkingLots = data.data.businesses;
        // console.log("Data", data)
        let sortedLots = parkingLots.sort((obj1, obj2)=>{
            return obj1.rating - obj2.rating;
        }); 
        let lowestLots = sortedLots.filter((obj)=>{
            return obj.rating < 3;
        });
        let scoredLowestLots = lowestLots.map((lot)=>{
            // console.log(lot)
            let numOfReviews = lot.review_count;
            let rating = lot.rating;
            let score = (numOfReviews * rating) / (numOfReviews + 1);
            lot["score"] = score;
            return lot;
        })
        return response.json({data: scoredLowestLots});
    });
  } catch (e) {
    // Display error on client
    return response.json({ error: e.message });
  }
});

// app.post('/getBankToken', async (req, res) => {
//     res.json({bank_account_token: bankAccountToken});
// })

app.listen(port, () => {
    console.log(`app listening at http://localhost:${port}`)
})
