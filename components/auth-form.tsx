'use client';

import { useSearchParams } from 'next/navigation';
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signIn } from "next-auth/react"

export function AuthForm({
  action,
  children,
  defaultEmail = '',
  className,
  ...props
}: {
  action: NonNullable<
    string | ((formData: FormData) => void | Promise<void>) | undefined
  >;
  children: React.ReactNode;
  defaultEmail?: string;
  className?: string;
}) {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const handleSignIn = async (provider: string) => {
    await signIn(provider, { redirectTo: callbackUrl });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>
            Login with a provider below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={action}>
            <div className="grid gap-6">
              <div className="flex flex-col gap-4">
                <Button type="button" variant="outline" className="w-full" onClick={() => handleSignIn("discord")}>
                  <svg aria-hidden="true" id="Discord-Logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 126.644 96">
                    <path id="Discord-Symbol-Black" d="M81.15,0c-1.2376,2.1973-2.3489,4.4704-3.3591,6.794-9.5975-1.4396-19.3718-1.4396-28.9945,0-.985-2.3236-2.1216-4.5967-3.3591-6.794-9.0166,1.5407-17.8059,4.2431-26.1405,8.0568C2.779,32.5304-1.6914,56.3725.5312,79.8863c9.6732,7.1476,20.5083,12.603,32.0505,16.0884,2.6014-3.4854,4.8998-7.1981,6.8698-11.0623-3.738-1.3891-7.3497-3.1318-10.8098-5.1523.9092-.6567,1.7932-1.3386,2.6519-1.9953,20.281,9.547,43.7696,9.547,64.0758,0,.8587.7072,1.7427,1.3891,2.6519,1.9953-3.4601,2.0457-7.0718,3.7632-10.835,5.1776,1.97,3.8642,4.2683,7.5769,6.8698,11.0623,11.5419-3.4854,22.3769-8.9156,32.0509-16.0631,2.626-27.2771-4.496-50.9172-18.817-71.8548C98.9811,4.2684,90.1918,1.5659,81.1752.0505l-.0252-.0505ZM42.2802,65.4144c-6.2383,0-11.4159-5.6575-11.4159-12.6535s4.9755-12.6788,11.3907-12.6788,11.5169,5.708,11.4159,12.6788c-.101,6.9708-5.026,12.6535-11.3907,12.6535ZM84.3576,65.4144c-6.2637,0-11.3907-5.6575-11.3907-12.6535s4.9755-12.6788,11.3907-12.6788,11.4917,5.708,11.3906,12.6788c-.101,6.9708-5.026,12.6535-11.3906,12.6535Z"
                      fill="currentColor"/>
                  </svg>
                  Login with Discord
                </Button>
                <Button type="button" variant="outline" className="w-full" onClick={() => handleSignIn("google")}>
                  <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  Login with Google
                </Button>
                <Button type="button" variant="outline" className="w-full" onClick={() => handleSignIn("reddit")}>
                  <svg viewBox="0 -4 48 48" version="1.1" xmlns="http://www.w3.org/2000/svg">
                      <g id="Icons" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                          <g id="Color-" transform="translate(-800.000000, -566.000000)" fill="currentColor">
                              <path d="M831.14,592.325803 C829.346,592.325803 827.8385,590.884067 827.8385,589.106421 C827.8385,587.328775 829.346,585.839477 831.14,585.839477 C832.934,585.839477 834.389,587.328775 834.389,589.106421 C834.389,590.884067 832.934,592.325803 831.14,592.325803 M831.902,598.574316 C830.231,600.228597 827.654,601.032699 824.024,601.032699 C824.0165,601.032699 824.0075,601.031213 823.9985,601.031213 C823.991,601.031213 823.982,601.032699 823.973,601.032699 C820.343,601.032699 817.7675,600.228597 816.098,598.574316 C815.585,598.065993 815.585,597.244055 816.098,596.737218 C816.6095,596.23038 817.439,596.23038 817.952,596.737218 C819.104,597.878716 821.0735,598.434602 823.973,598.434602 C823.982,598.434602 823.991,598.436088 823.9985,598.436088 C824.0075,598.436088 824.0165,598.434602 824.024,598.434602 C826.9235,598.434602 828.8945,597.878716 830.048,596.737218 C830.561,596.228894 831.3905,596.23038 831.902,596.737218 C832.4135,597.245541 832.4135,598.067479 831.902,598.574316 M813.611,589.106421 C813.611,587.330262 815.1155,585.839477 816.908,585.839477 C818.702,585.839477 820.157,587.330262 820.157,589.106421 C820.157,590.884067 818.702,592.325803 816.908,592.325803 C815.1155,592.325803 813.611,590.884067 813.611,589.106421 M839.996,568.598098 C841.211,568.598098 842.1995,569.577586 842.1995,570.780024 C842.1995,571.983948 841.211,572.963436 839.996,572.963436 C838.781,572.963436 837.7925,571.983948 837.7925,570.780024 C837.7925,569.577586 838.781,568.598098 839.996,568.598098 M848,585.570452 C848,582.417955 845.4125,579.854043 842.231,579.854043 C840.854,579.854043 839.5895,580.335612 838.5965,581.136742 C835.079,578.945898 830.615,577.62604 825.83,577.346611 L828.326,569.527051 L835.1855,571.127824 C835.3655,573.602556 837.4535,575.561534 839.996,575.561534 C842.6555,575.561534 844.82,573.416766 844.82,570.780024 C844.82,568.144768 842.6555,566 839.996,566 C838.136,566 836.519,567.049346 835.7135,568.581748 L827.7425,566.722354 C827.075,566.56629 826.4,566.94679 826.193,567.594828 L823.094,577.300535 C817.9385,577.425386 813.092,578.749703 809.3165,581.068371 C808.337,580.308859 807.1055,579.854043 805.769,579.854043 C802.5875,579.854043 800,582.417955 800,585.570452 C800,587.519025 800.99,589.241677 802.4975,590.273187 C802.4345,590.726516 802.4015,591.182818 802.4015,591.645065 C802.4015,595.585315 804.713,599.250595 808.91,601.964625 C812.933,604.567182 818.258,606 823.9025,606 C829.547,606 834.872,604.567182 838.895,601.964625 C843.092,599.250595 845.4035,595.585315 845.4035,591.645065 C845.4035,591.224435 845.375,590.806778 845.3225,590.392093 C846.9305,589.376932 848,587.594828 848,585.570452" id="Reddit">
                          </path>
                          </g>
                      </g>
                  </svg>
                  Login with Reddit
                </Button>
              </div>
              <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="relative z-10 bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="user@acme.com"
                    autoComplete="email"
                    required
                    autoFocus
                    defaultValue={defaultEmail}
                  />
                </div>
                {children}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
