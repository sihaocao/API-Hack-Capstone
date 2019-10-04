'use strict';
    
function getCryptoStats(userCryptoChoice) {

    const cryptoListUrl = `https://api.coingecko.com/api/v3/coins/list`;

    function formatQueryParams(params) {
        const queryItems = Object.keys(params).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
        return queryItems.join('&');
    }

    const params = {
        tickers: false,
        market_data: true,
        community_data: false,
        developer_data: false
    };

    const queryString = formatQueryParams(params);

    // First fetching cryptoListUrl by passing in the user search term. Once the search returns the id with the matching name that was passed in, the id is inserted into the second API.
    fetch(cryptoListUrl)
        .then(cryptoListResponse => cryptoListResponse.json())
        .then(cryptoListResponseJson => {
            for (let i = 0; i < cryptoListResponseJson.length; i++) {
                if (userCryptoChoice === cryptoListResponseJson[i].name) {
                    return `https://api.coingecko.com/api/v3/coins/${cryptoListResponseJson[i].id}`;
                }
            }
        })
        .then(statsSearchUrl => {
            fetch(statsSearchUrl + '?' + queryString)
                .then(statsResponse => {
                    if (statsResponse.ok) {
                        $('.loader').addClass('hidden');
                        $('#invalid-search').addClass('hidden');
                        $('.results').removeClass('hidden');
                        return statsResponse.json();
                    }
                    $('.loader').addClass('hidden');
                    $('#invalid-search').removeClass('hidden');
                    $('.results').addClass('hidden');
                    throw new Error(statsResponse.statusText);
                })
                .then((statsResponseJson) => displayCryptoStats(statsResponseJson))
                .catch(error => {
                    $('#js-error-message').html('<p>Did you enter a valid cryptocurrency name? Here is a full <a href="https://www.coingecko.com/en" target="_blank">list</a> of cryptocurrencies. Please enter a valid name and try again.</p>');
                });
        })

    // formatting the 24-hour percent change statistic
    function percentChangeInMarketCap(statsResponseJson) {
        if (statsResponseJson.market_data.market_cap_change_percentage_24h > 0) {
            return $('.percent-change').addClass('percent-change-positive').removeClass('percent-change-negative').removeClass('percent-change-neutral');
        } else if (statsResponseJson.market_data.market_cap_change_percentage_24h < 0) {
            return $('.percent-change').addClass('percent-change-negative').removeClass('percent-change-positive').removeClass('percent-change-neutral');
        } else {
            return $('.percent-change').addClass('percent-change-neutral').removeClass('percent-change-positive').removeClass('percent-change-negative');
        }
    }

    function displayCryptoStats(statsResponseJson) {
        // console.log(statsResponseJson);
        $('.stats-results').empty();
        const cryptoPrice = statsResponseJson.market_data.current_price.usd.toLocaleString('en');
        const cryptoMarketCap = statsResponseJson.market_data.market_cap.usd.toLocaleString('en');
        const cryptoCirculatingSupply = Math.round(statsResponseJson.market_data.circulating_supply).toLocaleString('en');
        const cryptoSymbol = statsResponseJson.symbol.toUpperCase();
        const cryptoPercentChange = statsResponseJson.market_data.market_cap_change_percentage_24h.toFixed(2);
        $('.stats-results').html(`<div class="all-crypto-stats">
            <img src="${statsResponseJson.image.large}" class="crypto-logo" alt="image of chosen cryptocurrency"></img>
            <h2 class="crypto-name">${statsResponseJson.name}</h2>
            <h3 class="crypto-current-price">Current Price: $${cryptoPrice}</h3>
            <h3 class="crypto-market-cap">Market Cap: $${cryptoMarketCap}</h4>
            <h3 class="crypto-circulating-supply">Circulating Supply: ${cryptoCirculatingSupply} ${cryptoSymbol}</h5>
            <h3 class="crypto-change">Change (24h): <span class="percent-change">${cryptoPercentChange}%</span></h5>
        </div>`);
        percentChangeInMarketCap(statsResponseJson);
    }
}



function getCryptoNews(userCryptoChoice) {
    const newsSearchUrl = `https://min-api.cryptocompare.com/data/v2/news/`;
    const newsApiKey = `210cc54ae0fbf13672093c3983a5eabd16bfb78c13e24cb250d23923744fd7b3`;

    function formatQueryParams(params) {
        const queryItems = Object.keys(params).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
        return queryItems.join('&');
    }

    const params = {
        categories: userCryptoChoice,
        lang: 'EN',
        api_key: newsApiKey
    }
    const queryString = formatQueryParams(params);
    const newsUrl = newsSearchUrl + '?' + queryString;

    // fetching the latest news headlines
    fetch(newsUrl)
        .then(newsResponse => {
            if (newsResponse.ok) {
                return newsResponse.json();
            }
            throw new Error(newsResponse.statusText);
        })
        .then(newsResponseJson => displayCryptoNews(newsResponseJson))
        .catch(error => {
            $('#js-error-message').text();
        });
    
    function displayCryptoNews(newsResponseJson) {
        // console.log(newsResponseJson);
        $('.news-results-list').empty();
        for (let i = 0; i < newsResponseJson.Data.length; i++) {
            const newsArticle = newsResponseJson.Data[i].url;
            const newsSource = newsArticle.split('/').slice(0,3).join('/');
            $('.news-results-list').append(`<li class="each-news-item">
                <a href="${newsArticle}" target="_blank"><img src="${newsResponseJson.Data[i].imageurl}" class="news-image" alt="news headline image"></img></a>
                <div class="news-item-information">
                    <h2 class="news-article-title"><a href="${newsArticle}" target="_blank">${newsResponseJson.Data[i].title}</a></h2>
                    <h4 class="news-article-source">Source: <a href="${newsSource}" target="_blank">${newsResponseJson.Data[i].source}</a></h4>
                </div>
            </li>
            `)
        }
    }
}



function getCryptoVideos(userCryptoChoice) {
    const videoSearchUrl = `https://www.googleapis.com/youtube/v3/search`;
    const videoApiKey = `AIzaSyBi04o3ioqfia07DJSSjjw8N0wcR2AaVBk`;
    
    function formatQueryParams(params) {
        const queryItems = Object.keys(params).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
        return queryItems.join('&');
    }

    const params = {
        key: videoApiKey,
        q: userCryptoChoice,
        part: 'snippet',
        maxResults: 50
    }
    const queryString = formatQueryParams(params);
    const videosUrl = videoSearchUrl + '?' + queryString;

    // fetching the relevant videos
    fetch(videosUrl)
        .then(videosResponse => {
            if (videosResponse.ok) {
                return videosResponse.json();
            }
            throw new Error(videosResponse.statusText);
        })
        .then(videosResponseJson => displayCryptoVideos(videosResponseJson))
        .catch(error => {
            $('#js-error-message').text();
        });

    function displayCryptoVideos(videosResponseJson) {
        // console.log(videosResponseJson);
        $('.videos-results-list').empty();
        for (let i = 0; i < videosResponseJson.items.length; i++) {
            $('.videos-results-list').append(`<li class="each-video-item">
                <a href="https://www.youtube.com/watch?v=${videosResponseJson.items[i].id.videoId}" target="_blank"><img src="${videosResponseJson.items[i].snippet.thumbnails.default.url}" class="videos-image" alt="relevant videos image"></img></a>
                <div class="videos-item-information">
                    <h2 class="each-video-title"><a href="https://www.youtube.com/watch?v=${videosResponseJson.items[i].id.videoId}" target="_blank">${videosResponseJson.items[i].snippet.title}</a></h2>
                    <h4 class="each-video-channel">Channel: <a href="https://www.youtube.com/channel/${videosResponseJson.items[i].snippet.channelId}" target="_blank">${videosResponseJson.items[i].snippet.channelTitle}</a></h4>
                </div>
            </li>`)
        }
    }
}



// Capitalizing the first letter of the search term so users who enter the proper name with all lower-case letters will still receive an output
function watchForm() {
    $('form').on('submit', function(event) {
        event.preventDefault();
        const searchTerm = $('#crypto-choice').val().split(' ').map(input => input.charAt(0).toUpperCase() + input.slice(1)).join(' ');
        $('#crypto-choice').val("");
        $('#invalid-search').addClass('hidden');
        $('.results').addClass('hidden');
        $('.loader').removeClass('hidden');
        getCryptoStats(searchTerm);
        getCryptoNews(searchTerm);
        getCryptoVideos(searchTerm);
    });
}

$(watchForm);