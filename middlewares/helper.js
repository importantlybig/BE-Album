exports.generateRandomString = (string_length = 6) => {
	let randomString = ''
	for (let i = 1; i <= string_length; i++) {
		const randomVal = Math.round(Math.random() * 9)
		randomString += randomVal
	}

	return randomString
}


exports.awaitToResponse = (millisecond) => {
	return new Promise((resolve) => {
		setTimeout(resolve, millisecond)
	})
} 