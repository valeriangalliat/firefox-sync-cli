const prompt = require('./prompt')

async function password (email, password, options) {
  email = email || await prompt({ type: 'text', message: 'Email:' })
  password = password || await prompt({ type: 'password', message: 'Password:' })

  return options.sync.auth.password(email, password)
}

module.exports = password
