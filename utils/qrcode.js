'use strict'

const qr = require('qr-element')
const { Image } = require('react-native')

module.exports = function qrcode (value, opts) {
  const el = qr(value, opts)
  const dataURL = el.toDataURL()
  return (
    <Image source={{ uri: dataURL, scale: opts.scale || 1 }} />
  )
}
