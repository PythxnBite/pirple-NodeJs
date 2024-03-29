/* eslint-disable node/no-deprecated-api */

/*
 *Primary file for the API
 *
 *
 */

// Dependency

const http = require('http')
const url = require('url')
const StringDecoder = require('string_decoder').StringDecoder

// Instantiating the HTTP server
const httpServer = http.createServer(function(req, res) {
	unifiedServer(req, res)
})

// Start the HTTP server
httpServer.listen(3000, function() {
	console.log('The sever is listening on port 3000')
})

// All the server logic
let unifiedServer = (req, res) => {
	// Get the URL and parse it
	let parsedUrl = url.parse(req.url, true)

	// Get the Path
	const path = parsedUrl.pathname
	const trimmedPath = path.replace(/^\/+|\/+$/g, '')

	// Get the query string as an object
	let queryStringObject = parsedUrl.query
	console.log('queryStringObject: ', queryStringObject)

	// Get the http Method
	const method = req.method.toUpperCase()

	// Get the headers as an object
	const headers = req.headers

	// Get the payload, if any
	const decoder = new StringDecoder('utf-8')
	let buffer = ''
	req.on('data', function(data) {
		buffer += decoder.write(data)
	})
	req.on('end', function() {
		buffer += decoder.end()

		// Choose the handler this request should go to. If one is not found use the notFound handler
		let chooseHandler =
			typeof router[trimmedPath] !== 'undefined'
				? router[trimmedPath]
				: handlers.notFound

		// Construct the data object to send to the handler
		let data = {
			trimmerPath: trimmedPath,
			queryStringObject: queryStringObject,
			method: method,
			headers: headers,
			payload: buffer
		}

		// Route the request to the handler specified in the handler
		chooseHandler(data, function(statusCode, payload) {
			// Use the status code called back by the handler, or default to 200
			statusCode = typeof statusCode == 'number' ? statusCode : 200

			// Use the payload defined by the handler, or default to an empty object
			payload = typeof payload == 'object' ? payload : {}

			//Convert the payload to string
			let payloadString = JSON.stringify(payload)

			// Return the response
			res.setHeader('Content-Type', 'application/json')
			res.writeHead(statusCode)
			res.end(payloadString)

			// Log the request Path
			console.log('Returning this response: ', statusCode, payloadString)
		})
	})
}

// Define the Handlers
let handlers = {}

// Hello Handler
handlers.hello = (data, callback) => {
	callback(200, {
		Welcome:
			'How ya\'ll doin? Let\'s work together and save our planet, or else ya know we go poof.'
	})
}

// Not Found handler
handlers.notFound = function(data, callback) {
	callback(404, { lul: 'Check ya code.' })
}

// Defining a request router
let router = {
	hello: handlers.hello,
	notFound: handlers.notFound
}
