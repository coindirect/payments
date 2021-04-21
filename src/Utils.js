export default function secondsToHms(d) {
  d = Number(d)
  var h = Math.floor(d / 3600)
  var m = Math.floor((d % 3600) / 60)
  var s = Math.floor((d % 3600) % 60)

  return { hours: h, minutes: m, seconds: s }
}
