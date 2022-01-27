let Snoostorm = require('snoostorm');
let Snoowrap = require('snoowrap');
let PropertiesReader = require('properties-reader');
let axios = require('axios');

var properties = new PropertiesReader('./env.properties');

const r = new Snoowrap({
    userAgent: properties.get('userAgent'),
    clientId: properties.get('clientId'),
    clientSecret: properties.get('clientSecret'),
    username: properties.get('username'),
    password: properties.get('password')
});

const comments = new Snoostorm.CommentStream(r, {
    subreddit: properties.get('targetSubreddit'),
    limit: 10,
    pollTime: 2000
});

comments.on("item", (comment) => {
    var commentWords = comment.body.split(' ');
    var summonWord = properties.get('summonWord');
    var summonIdx = commentWords.indexOf(summonWord);
    // !tickerpriceplease AAPL
    // hi bot please tell me !tickerpriceplease AAPL
    if(summonIdx > -1) {
        var ticker = commentWords[summonIdx+1];
        var options = {
            method: 'GET',
            url: 'https://stock-data-yahoo-finance-alternative.p.rapidapi.com/v6/finance/quote',
            params: {symbols: ticker},
            headers: {
                'x-rapidapi-host': 'stock-data-yahoo-finance-alternative.p.rapidapi.com',
                'x-rapidapi-key': 'c4bfd3b221msh69ff91f97686849p156920jsn4062ada4f4e9'
            }
        }

        axios.request(options).then(function (response) {
            // Current ask price of AAPL is: $xxx.xx
            comment.reply("Current ask price of " + ticker + " is: $" + 
                response.data["quoteResponse"]["result"][0]["ask"]);
        }).catch(function (error) {
            comment.reply("Sorry, I couldn't find that ticker. Please format your request as '!tickerpriceplease <<ticker>>'");
        });
    }
});