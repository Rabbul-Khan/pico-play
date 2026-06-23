import { ref, watch, type Ref } from 'vue'

/**
 * Reactive ref backed by localStorage.
 * Falls back to `defaultValue` when key is missing or JSON parsing fails.
 */
export function useLocalStorage<T>(key: string, defaultValue: T): Ref<T> {
  const storedRaw = localStorage.getItem(key)
  let initial = defaultValue

  if (storedRaw !== null) {
    try {
      initial = JSON.parse(storedRaw) as T
    } catch {
      initial = defaultValue
    }
  }

  const data = ref(initial) as Ref<T>

  watch(
    data,
    (value) => {
      localStorage.setItem(key, JSON.stringify(value))
    },
    { deep: true }
  )

  return data
}
