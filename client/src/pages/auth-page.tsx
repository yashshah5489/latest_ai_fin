import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";

const loginSchema = z.object({
  username: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  rememberMe: z.boolean().optional(),
});

const registerSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  username: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string().min(6, { message: "Password must be at least 6 characters" }),
  country: z.string().min(1, { message: "Country is required" }),
  terms: z.boolean().refine(val => val === true, { message: "You must agree to the terms" }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [location, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      password: "",
      confirmPassword: "",
      country: "India",
      terms: false,
    },
  });

  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate({
      username: data.username,
      password: data.password,
    });
  };

  const onRegisterSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate({
      username: data.username,
      password: data.password,
      fullName: `${data.firstName} ${data.lastName}`,
    });
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-dark-900">
      <div className="login-bg hidden md:block md:w-1/2 lg:w-3/5 bg-opacity-70 relative">
        <div className="absolute inset-0 bg-dark-900 bg-opacity-60 flex items-center justify-center">
          <div className="p-12 max-w-lg">
            <h1 className="text-4xl font-heading font-bold text-white mb-4">Smart AI Financial Analyzer</h1>
            <p className="text-xl text-gray-200 mb-6">Your personal AI assistant for Indian financial markets analysis and portfolio management</p>
            <ul className="space-y-3 text-gray-200">
              <li className="flex items-center">
                <span className="text-primary-500 mr-2">✓</span>
                AI-powered financial insights
              </li>
              <li className="flex items-center">
                <span className="text-primary-500 mr-2">✓</span>
                Portfolio management and risk analysis
              </li>
              <li className="flex items-center">
                <span className="text-primary-500 mr-2">✓</span>
                Indian market-specific data and news
              </li>
              <li className="flex items-center">
                <span className="text-primary-500 mr-2">✓</span>
                Document analysis and financial reporting
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="w-full md:w-1/2 lg:w-2/5 flex items-center justify-center bg-dark-800 p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 md:hidden">
            <h1 className="text-3xl font-heading font-bold text-white">Smart AI Financial Analyzer</h1>
            <p className="text-gray-300">Your personal AI assistant for Indian financial markets</p>
          </div>
          
          {isLogin ? (
            <Card className="bg-dark-800 border-dark-700">
              <CardContent className="pt-6">
                <h2 className="text-2xl font-heading font-semibold mb-6 text-white">Login to your account</h2>
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Email Address</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="your@email.com" 
                              className="bg-dark-700 border-dark-600 text-white"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="********" 
                              className="bg-dark-700 border-dark-600 text-white"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex items-center justify-between">
                      <FormField
                        control={loginForm.control}
                        name="rememberMe"
                        render={({ field }) => (
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="remember-me" 
                              checked={field.value} 
                              onCheckedChange={field.onChange} 
                              className="bg-dark-700 border-dark-600"
                            />
                            <label 
                              htmlFor="remember-me" 
                              className="text-sm font-medium leading-none text-gray-300"
                            >
                              Remember me
                            </label>
                          </div>
                        )}
                      />
                      <div className="text-sm">
                        <a href="#" className="font-medium text-primary-400 hover:text-primary-300">
                          Forgot password?
                        </a>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-primary-600 hover:bg-primary-700" 
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "Signing in..." : "Sign in"}
                    </Button>
                  </form>
                </Form>
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-400">
                    Don't have an account?{" "}
                    <button 
                      className="font-medium text-primary-400 hover:text-primary-300"
                      onClick={() => setIsLogin(false)}
                    >
                      Sign up
                    </button>
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-dark-800 border-dark-700">
              <CardContent className="pt-6">
                <h2 className="text-2xl font-heading font-semibold mb-6 text-white">Create your account</h2>
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={registerForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">First Name</FormLabel>
                            <FormControl>
                              <Input 
                                className="bg-dark-700 border-dark-600 text-white"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">Last Name</FormLabel>
                            <FormControl>
                              <Input 
                                className="bg-dark-700 border-dark-600 text-white"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Email Address</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="your@email.com" 
                              className="bg-dark-700 border-dark-600 text-white"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password"
                              placeholder="********" 
                              className="bg-dark-700 border-dark-600 text-white"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Confirm Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password"
                              placeholder="********" 
                              className="bg-dark-700 border-dark-600 text-white"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Country</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-dark-700 border-dark-600 text-white">
                                <SelectValue placeholder="Select a country" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-dark-700 border-dark-600 text-white">
                              <SelectItem value="India">India</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="terms"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox 
                              checked={field.value} 
                              onCheckedChange={field.onChange}
                              className="bg-dark-700 border-dark-600"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm text-gray-300">
                              I agree to the <a href="#" className="text-primary-400">Terms of Service</a> and <a href="#" className="text-primary-400">Privacy Policy</a>
                            </FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full bg-primary-600 hover:bg-primary-700" 
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                    </Button>
                  </form>
                </Form>
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-400">
                    Already have an account?{" "}
                    <button 
                      className="font-medium text-primary-400 hover:text-primary-300"
                      onClick={() => setIsLogin(true)}
                    >
                      Sign in
                    </button>
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
