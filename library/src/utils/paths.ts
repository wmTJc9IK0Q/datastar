import type { Paths } from '../engine/types'

export const isPojo = (obj: any): obj is Record<string, any> =>
  obj !== null &&
  typeof obj === 'object' &&
  (Object.getPrototypeOf(obj) === Object.prototype ||
    Object.getPrototypeOf(obj) === null)

export function isEmpty(obj: Record<string, any>): boolean {
  for (const prop in obj) {
    if (Object.hasOwn(obj, prop)) {
      return false
    }
  }
  return true
}

export function updateLeaves(
  obj: Record<string, any>,
  fn: (oldValue: any) => any,
) {
  for (const key in obj) {
    const val = obj[key]
    if (isPojo(val) || Array.isArray(val)) {
      updateLeaves(val, fn)
    } else {
      obj[key] = fn(val)
    }
  }
}

export const pathToObj = (paths: Paths): Record<string, any> => {
  const result: Record<string, any> = {}
  for (const [path, value] of paths) {
    const keys = path.split('.')
    const lastKey = keys.pop()!
    const obj: any = keys.reduce((acc, key) => (getKey(acc, key) ? getKey(acc, key) : setKey(acc, key, {})), result)
    setKey(obj, lastKey, value)
  }
  return result
}

const getKey = (obj: any, key: string): any => {
  let res = indexRegexp.exec(key)
  if (res) {
    key = res[1]
    let index = parseInt(res[2], 10)
    if (!obj[key]) return undefined
    return obj[key][index]
  } else {
    return obj[key]
  }
}

const indexRegexp = /(.*)\[(\d+)\]$/;
const setKey = (obj: any,  key: string, value: any): Record<string, any> => {
  let res = indexRegexp.exec(key)
  if (res) {
    key = res[1]
    let index = parseInt(res[2], 10)
    let arr = []
    arr[index] = value
    obj[key] = arr
    return arr
  } else {
    obj[key] = value
    return obj
  }
}
