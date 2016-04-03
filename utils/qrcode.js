'use strict'

const qr = require('qr-element')
const { Image } = require('react-native')

module.exports = function qrcode (value, opts) {
  const el = qr(value, opts)
  const dataURL = el.toDataURL()
  let src = {
    uri: dataURL
    // scale: opts.scale || 1
  }
  let style = {}
  if (opts  &&  opts.width) {
    style.width = opts.width
    if (opts.height)
      style.height = opts.height
  }
  if (!Object.keys(style).length)
    style = {width: 150, height: 150}
  return (
    <Image source={src} style={style} />
  )
}
