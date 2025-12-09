import "next-auth"

declare module "next-auth" {
  interface User {
    id: string
    userType?: string
  }

  interface Session {
    user: {
      id: string
      email: string
      name: string
      userType: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    userType?: string
  }
}
