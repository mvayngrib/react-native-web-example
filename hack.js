#!/usr/bin/env node

if (__dirname.indexOf('node_modules') === -1) {
  console.log('fixing datepicker')
  // don't run this when installed as submodule
  const fs = require('fs')
  const path = require('path')
  const writeFile = require('write-file-atomic')
  const bootstrapPath = path.resolve('./node_modules/tcomb-form-native/lib/templates/bootstrap/index.js')
  const bad = fs.readFileSync(bootstrapPath, { encoding: 'utf8' })
  const good = bad.replace("'./datepicker'", "'./datepicker.ios'")
  if (bad !== good) {
    writeFile.sync(bootstrapPath, good)
  }
}
