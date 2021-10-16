const prompts = require('prompts')

async function prompt (params) {
  const res = await prompts({ ...params, name: 'value', stdout: process.stderr })

  if (!res.value) {
    process.exit()
  }

  return res.value
}

module.exports = prompt
