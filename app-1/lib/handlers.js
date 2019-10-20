/*
 * Request Handlers
 *
 */

// * Dependencies
const _data = require('./data')
const helpers = require('./helpers')

// Define the Handlers
let handlers = {}

// * User Handler
handlers.users = (data, callback) => {
	const acceptedMethods = ['POST', 'GET', 'PUT', 'DELETE']
	if (acceptedMethods.indexOf(data.method) > -1) {
		handlers._users[data.method](data, callback)
	} else {
		callback(405)
	}
}

// * Container for the user submethods
handlers._users = {}

// Users - POST
// Required data : firstName, LastName, phone, password, tosAgreement
// Optional data : none
handlers._users.POST = (data, callback) => {
	// Check that all fields are filled out
	let firstName =
		typeof data.payload.firstName == 'string' &&
		data.payload.firstName.trim().length > 0
			? data.payload.firstName.trim()
			: false
	let lastName =
		typeof data.payload.lastName == 'string' &&
		data.payload.lastName.trim().length > 0
			? data.payload.lastName.trim()
			: false
	let phone =
		typeof data.payload.phone == 'string' &&
		data.payload.phone.trim().length == 10
			? data.payload.phone.trim()
			: false
	let password =
		typeof data.payload.password == 'string' &&
		data.payload.password.trim().length > 0
			? data.payload.password.trim()
			: false
	let tosAgreement =
		typeof data.payload.tosAgreement == 'boolean' &&
		data.payload.tosAgreement == true
			? true
			: false

	if (firstName && lastName && phone && password && tosAgreement) {
		// Make sure that the user doesn't already exist
		_data.read('users', phone, (err, data) => {
			if (err) {
				// Hash the password
				const hashedPassword = helpers.hash(password)

				// Create the user object
				if (hashedPassword) {
					let userObject = {
						firstName: firstName,
						lastName: lastName,
						phone: phone,
						hashedPassword: hashedPassword,
						tosAgreement: true
					}

					// Store the user
					_data.create('users', phone, userObject, err => {
						if (!err) {
							callback(200)
						} else {
							console.log(err)
							callback(500, {
								Error: 'Could not create the new user'
							})
						}
					})
				} else {
					callback(500, {
						Error: "Could not hash the user's password"
					})
				}
			} else {
				callback(400, {
					Error: 'A user with that phone number already exists'
				})
			}
		})
	} else {
		callback(400, { Error: 'Missing required fields' })
	}
}

// Users - GET
// Required data : phone
// Optional data : none
// TODO Only let an authenticated user access their object. Don't let them access anyone else's
handlers._users.GET = (data, callback) => {
	// Check that the phone number provided is valid
	const phone =
		typeof data.queryStringObject.phone == 'string' &&
		data.queryStringObject.phone.trim().length == 10
			? data.queryStringObject.phone.trim()
			: false
	if (phone) {
		// Lookup the user
		_data.read('users', phone, (err, data) => {
			if (!err && data) {
				// Remove the hashed password before returning it to the requester
				delete data.hashedPassword
				callback(200, data)
			} else {
				callback(404)
			}
		})
	} else {
		callback(400, { Error: 'Missing required field' })
	}
}

// Users - PUT
// Required data : phone
// Optional data : firstName, lastName, password (at least one must be specified)
// TODO only let an authenticated use update an object, don't let them update anyone else's
handlers._users.PUT = (data, callback) => {
	// Check for the required string
	const phone =
		typeof data.payload.phone == 'string' &&
		data.payload.phone.trim().length == 10
			? data.payload.phone.trim()
			: false

	// Check for the optional fields
	let firstName =
		typeof data.payload.firstName == 'string' &&
		data.payload.firstName.trim().length > 0
			? data.payload.firstName.trim()
			: false
	let lastName =
		typeof data.payload.lastName == 'string' &&
		data.payload.lastName.trim().length > 0
			? data.payload.lastName.trim()
			: false
	let password =
		typeof data.payload.password == 'string' &&
		data.payload.password.trim().length > 0
			? data.payload.password.trim()
			: false

	// Error if the phone is invalid
	if (phone) {
		if (firstName || lastName || password) {
			// Lookup the user
			_data.read('users', phone, (err, userData) => {
				if (!err && userData) {
					// Update the required Fields
					if (firstName) {
						userData.firstName = firstName
					}
					if (lastName) {
						userData.lastName = lastName
					}
					if (password) {
						userData.hashedPassword = helpers.hash(password)
					}

					// Store the new updates
					_data.update('users', phone, userData, err => {
						if (!err) {
							callback(200)
						} else {
							console.log(err)
							callback(500, {
								Error: 'Could not update the user'
							})
						}
					})
				} else {
					callback(400, { Error: "The specified user doesn't exist" })
				}
			})
		} else {
			callback(400, { Error: 'Missing fields to update' })
		}
	} else {
		callback(400, { Error: 'Missing required Field' })
	}
}

// Users - DELETE
// Required Field : phone
// TODO :  Only let authenticated user delete their object. Don't let them delete anyone else's
// TODO : Cleanup any other data files associated with this user.
handlers._users.DELETE = (data, callback) => {
	// Check that the phone number provided is valid
	const phone =
		typeof data.queryStringObject.phone == 'string' &&
		data.queryStringObject.phone.trim().length == 10
			? data.queryStringObject.phone.trim()
			: false
	if (phone) {
		// Lookup the user
		_data.read('users', phone, (err, data) => {
			if (!err && data) {
				// Delete the user
				_data.delete('users', phone, err => {
					if (!err) {
						callback(200)
					} else {
						callback(500, {
							Error: 'Could not delete the specified User'
						})
					}
				})
			} else {
				callback(400, { Error: 'Could not find the specified user' })
			}
		})
	} else {
		callback(400, { Error: 'Missing required field' })
	}
}

// * Ping Handler
handlers.ping = (data, callback) => {
	callback(200)
}

// Not Found handler
handlers.notFound = (data, callback) => {
	callback(404)
}

// * Export the module
module.exports = handlers
