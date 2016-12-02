
import app from '../app';
import moment from 'moment';

export default class DemoService {

    constructor ( $enplugAccount, $q) {

        'ngInject';

        // "Feed" or "feeds" is the terminology we are using to describe an "asset" that's data we are modifying
        var feeds = [];

        function newFeed(setDefaultValue) {
            return {
                id: '',
                title: '',
                venueIds: []
            };
        }
        // Data abstraction back to "asset" before saving. Please note, any data saved under nested 'Value' property will be available in the player portion of the application
        function convertFeedToAsset (feed) {
            return {
                Id: feed.id,
                Created: feed.created,
                Value: {
                    title: feed.title
                },
                Schedule: feed.schedule,
                Duration: feed.duration,
                VenueIds: feed.venueIds
            };
        }
        // Data abstraction to convert saved asset into feed
        function convertAssetToFeed (asset) {
            let feed = newFeed();
            feed.id = asset.Id;
            feed.title = asset.Value.title;
            feed.duration = asset.Duration;
            feed.schedule = asset.Schedule;
            feed.venueIds = asset.VenueIds;
            feed.created = moment(asset.Created).format('MMM DD, YYYY');
            return feed;
        }

        // Dashboard SDK - $enplugAccount methods

         function loadFeeds(){
            feeds.length = 0;
            return $enplugAccount.getAssets().then(function (assets) {
                if(assets.length) {
                    for ( let asset of assets ) {
                        feeds.push( convertAssetToFeed(asset) );
                    }
                }
                return feeds;
            });
        }

        function loadFeed (id) {
            return $enplugAccount.getAssets().then(function (assets) {
                var feed = assets.filter(function (asset) { return asset.Id === id; })[0];
                feed = convertAssetToFeed(feed)
                return feed || $q.reject();
            });
        }

        function saveFeed (feed, showDialog) {
            var options = {
                successMessage: 'Saved Feed',
                showDeployDialog : showDialog,
                showSchedule: true, //shows scheduling options when saving or deploying asset
                scheduleOptions : {
                    showDuration : true  //shows duration slider
                }
            }
            return $enplugAccount.saveAsset( convertFeedToAsset(feed) , options);
        }

        function deleteById (id) {
           for ( var i=0,l=feeds.length; i<l; i++ ) {
               let feed = feeds[i];
               if ( feed.id == id ) {
                   feeds.splice(i, 1);
                   break;
               }
           }
           return $enplugAccount.deleteAsset(id);
       }

        return {

            newFeed :  newFeed,

            loadFeeds: loadFeeds,

            loadFeed: loadFeed,

            saveFeed: saveFeed,

            deleteById: deleteById

        }

    }

};

app.service( 'DemoService', DemoService );
