

module.exports = {
  port: parseInt(process.env.PORT, 10) || 3000,
  url: 'mongodb://localhost:27018/elm',
  session: {
		name: 'SID',
		secret: 'SID',
		cookie: {
			httpOnly: true,
	    secure:   false,
	    maxAge:   365 * 24 * 60 * 60 * 1000,
		}
	}
}