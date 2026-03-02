import { cn } from "@/lib/utils"
import { useAuthStore } from "@/store/authStore"
import { useNavigate } from "@tanstack/react-router"
import { Card, CardContent } from "./ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "./ui/field"
import { Input } from "./ui/input"
import { Button } from "./ui/button"

export default function LoginForm() {
  const { login, isLoading, error } = useAuthStore()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const success = await login(
      fd.get('email') as string,
      fd.get('password') as string,
    )
    if (success) navigate({ to: '/dashboard' })
  }

  return (
    <div className={cn('flex flex-col gap-6')}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-muted-foreground text-balance">
                  Login to with you admin credentials
                </p>
              </div>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input id="password" name="password" type="password" required />
              </Field>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <Field>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Logging in…' : 'Login'}
                </Button>
              </Field>

              <Field className="grid grid-cols-3 gap-4"></Field>
              <FieldDescription className="text-center">
                <span className="block">Don&apos;t have an account?</span>
                <span className="block">
                  Inquire to the system admin for access
                </span>
              </FieldDescription>
            </FieldGroup>
          </form>
          <div className="bg-muted relative hidden md:block">
            <img
              src="ku_logo.png"
              alt="Image"
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-50 w-50 object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
