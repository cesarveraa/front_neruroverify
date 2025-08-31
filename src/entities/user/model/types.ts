export interface User {
  uid: string
  email?: string
  displayName?: string
  photoURL?: string
  profile?: Record<string, any>
}
