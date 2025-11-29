import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { authAPI, removeToken } from "./api"

interface User {
  name: string
  email: string
  id?: string
}

interface UserContextType {
  user: User | null
  setUser: (user: User | null) => void
  logout: () => void
  isLoading: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem("empowerai-user")
    if (storedUser) {
      try {
        setUserState(JSON.parse(storedUser))
      } catch (e) {
        localStorage.removeItem("empowerai-user")
      }
    }
    setIsLoading(false)
  }, [])

  const setUser = (newUser: User | null) => {
    setUserState(newUser)
    if (newUser) {
      localStorage.setItem("empowerai-user", JSON.stringify(newUser))
    } else {
      localStorage.removeItem("empowerai-user")
    }
  }

  const logout = () => {
    setUser(null)
    removeToken()
    authAPI.logout()
  }

  return <UserContext.Provider value={{ user, setUser, logout, isLoading }}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
