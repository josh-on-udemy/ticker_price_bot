let Snoostorm = require('snoostorm');
let Snoowrap = require('snoowrap');
let axios = require('axios');

const r = new Snoowrap({
    userAgent: process.env.userAgent,
    clientId: process.env.clientId,
    clientSecret: process.env.clientSecret,
    username: process.env.username,
    password: process.env.password
});

const comments = new Snoostorm.CommentStream(r, {
    subreddit: process.env.targetSubreddit,
    limit: 10,
    pollTime: 2000
});

comments.on("item", (comment) => {
    var commentWords = comment.body.split(' ');
    var summonWord = process.env.summonWord;
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