"use strict"

let mongoose = require( 'mongoose' )
let co = require( 'co' )

let env = require( __dirname + '/../env' )

let models = {
	link: mongoose.model( 'link', require( __dirname + '/schemas/link.schema' ) ),
	post: mongoose.model( 'post', require( __dirname + '/schemas/post.schema' ) ),
	comment: mongoose.model( 'comment', require( __dirname + '/schemas/comment.schema' ) ),
	profile: mongoose.model( 'profile', require( __dirname + '/schemas/profile.schema' ) ),
	report: mongoose.model( 'report', require( __dirname + '/schemas/report.schema' ) ),
}

mongoose.Promise = global.Promise
mongoose.connect( env.mongoUrl )

// Connection URL 
let db = mongoose.connection

let dbLayer = {

	upsert: function ( model, key, data ) {

		console.log( 'upsert', model, key + ': ', data && data[key] )
		return models[ model ].findOneAndUpdate( { [key]: data[ key ] }, data, {
			upsert: true,
			setDefaultsOnInsert: true
		} )
	},

	// upsertMany: function ( model, key, data ) {
	// 	// https://stackoverflow.com/questions/25285232/bulk-upsert-in-mongodb-using-mongoose
	// 	let l = data.length
	// 	model = models[ model ]  // string to object
	//
	// 	for ( let i = 0; i < l; i++ ) {
	// 		model.update( { [key]: data[ i ][ key ] }, data[ i ], { upsert: true, setDefaultsOnInsert: true } );
	// 	}
	//
	// 	return this;
	// },

	create: function ( model, data, cb ) {

		// return models[ model ].collection.insert( data, cb )
		model = new models[ model ]( data )
		return model.save( cb )
	},

	// read: function ( model, query ) {
	//
	// 	return models[ model ].find( query )
	// },

	readOne: function ( model, query ) {

		return models[ model ].findOne( query )
	},

	// readMany: function ( model, query, cb ) {
	//
	// 	// const cursor = models[ model ].find(query).cursor()
	// 	// cursor.on('data', cb)
	//
	// 	// http://thecodebarbarian.com/cursors-in-mongoose-45
	// 	co( function*() {
	// 		const cursor = models[ model ].find( query ).cursor()
	// 		for ( let doc = yield cursor.next(); doc != null; doc = yield cursor.next() ) {
	// 			cb( doc );
	// 		}
	// 	} );
	// 	return this;
	// },
	// exist: function ( model, key, val ) {
	// 	return models[ model ].count( { [key]: val } )
	// 		.then( function ( err, count ) {
	// 			return count > 0
	// 		} );
	// },

	close: function () {

		db.close()
	},

	onConnection: function ( fn ) {

		db.once( 'open', fn )
	}
}

db.on( 'error', console.error.bind( console, 'connection error:' ) )

module.exports = dbLayer