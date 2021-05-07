export function getAndSaveUuid(uuid) {
  const _uuid = getUuid(uuid)

  if (_uuid) {
    window.sessionStorage.setItem('uuid', _uuid)
  }

  return _uuid
}

/**
 * Prioritize uuid passed in as prop, secondly from url parameter, third from sessionStorage.
 */
export function getUuid(uuid) {
  let _uuid = uuid

  if (!uuid) {
    _uuid =
      new URLSearchParams(window.location.search).get('uuid') ||
      window.sessionStorage.getItem('uuid')
  }

  return _uuid
}
