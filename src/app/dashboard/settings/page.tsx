"use client";

import * as React from "react";
import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Shield, Palette, Bell, KeyRound, MonitorSmartphone, LogOut, Moon, Type, Languages, Paintbrush, RefreshCw, Mail, Smartphone, Newspaper, CookingPot, Star } from "lucide-react";
import { useTheme } from "next-themes";


const SettingsSection = ({ icon: Icon, title, description, children }: { icon: React.ElementType, title: string, description: string, children: React.ReactNode }) => (
    <Card>
        <Accordion type="single" collapsible defaultValue="item-1">
            <AccordionItem value="item-1" className="border-b-0">
                <AccordionTrigger className="p-6 hover:no-underline">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-accent rounded-full">
                            <Icon className="w-6 h-6 text-accent-foreground" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">{title}</CardTitle>
                            <CardDescription className="text-sm">{description}</CardDescription>
                        </div>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="p-6 pt-0">
                    <Separator className="mb-6" />
                    {children}
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    </Card>
);

const SettingsRow = ({ children }: { children: React.ReactNode }) => (
    <div className="flex items-center justify-between py-4">
        {children}
    </div>
);

const SettingsInfo = ({ title, description }: { title: string, description?: string }) => (
    <div>
        <p className="font-medium">{title}</p>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
    </div>
)

export default function Settings() {
    const { theme, setTheme } = useTheme();
    const [isDarkMode, setIsDarkMode] = useState(theme === 'dark');

    const handleThemeChange = (checked: boolean) => {
        setIsDarkMode(checked);
        setTheme(checked ? 'dark' : 'light');
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold font-headline">Settings</h1>
                <p className="text-muted-foreground">Manage your account and preferences</p>
            </div>

            <SettingsSection
                icon={Shield}
                title="Account Security"
                description="Password, authentication, and security settings"
            >
                <div className="space-y-4">
                    <SettingsRow>
                        <SettingsInfo title="Change Password" description="Update your account password for better security" />
                        <Button variant="outline"><KeyRound className="mr-2" />Change</Button>
                    </SettingsRow>
                    <Separator />
                    <SettingsRow>
                        <SettingsInfo title="Two-Factor Authentication" description="Add an extra layer of security to your account" />
                        <Switch />
                    </SettingsRow>
                    <Separator />
                    <SettingsRow>
                        <SettingsInfo title="Active Sessions" description="Manage your active login sessions" />
                        <Button variant="outline"><MonitorSmartphone className="mr-2" />View Sessions</Button>
                    </SettingsRow>
                    <Separator />
                    <SettingsRow>
                        <SettingsInfo title="Sign Out" description="Sign out from your account on this device" />
                        <Button variant="destructive"><LogOut className="mr-2" />Sign Out</Button>
                    </SettingsRow>
                </div>
            </SettingsSection>

            <SettingsSection
                icon={Palette}
                title="Display Preferences"
                description="Customize appearance, theme, and language settings"
            >
                <div className="space-y-4">
                    <SettingsRow>
                        <SettingsInfo title="Dark Mode" description="Switch between light and dark themes" />
                        <Switch checked={isDarkMode} onCheckedChange={handleThemeChange} />
                    </SettingsRow>
                    <Separator />
                    <SettingsRow>
                        <SettingsInfo title="Font Size" />
                         <Select defaultValue="Default">
                            <SelectTrigger className="w-[180px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Small">Small</SelectItem>
                                <SelectItem value="Default">Default</SelectItem>
                                <SelectItem value="Large">Large</SelectItem>
                            </SelectContent>
                        </Select>
                    </SettingsRow>
                    <Separator />
                    <SettingsRow>
                        <SettingsInfo title="Language" />
                        <Select defaultValue="English">
                            <SelectTrigger className="w-[180px]">
                                <SelectValue/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="English">English</SelectItem>
                                <SelectItem value="Spanish">Spanish</SelectItem>
                                <SelectItem value="French">French</SelectItem>
                            </SelectContent>
                        </Select>
                    </SettingsRow>
                    <Separator />
                    <SettingsRow>
                        <SettingsInfo title="Color Theme" />
                        <Select defaultValue="Warm">
                            <SelectTrigger className="w-[180px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Warm">Warm</SelectItem>
                                <SelectItem value="Cool">Cool</SelectItem>
                                <SelectItem value="Default">Default</SelectItem>
                            </SelectContent>
                        </Select>
                    </SettingsRow>
                    <Separator />
                    <div className="pt-4">
                         <div className="flex items-center justify-between">
                            <SettingsInfo title="Preview" description="Current theme colors"/>
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-green-500"></div>
                                <div className="w-6 h-6 rounded-full bg-yellow-500"></div>
                                <div className="w-6 h-6 rounded-full bg-teal-500"></div>
                            </div>
                        </div>
                    </div>
                     <div className="flex justify-end pt-4">
                        <Button variant="outline"><RefreshCw className="mr-2"/>Reset to Defaults</Button>
                    </div>
                </div>
            </SettingsSection>

            <SettingsSection
                icon={Bell}
                title="Notification Settings"
                description="Manage email, push notifications, and cooking reminders"
            >
                 <div className="space-y-6">
                    <div>
                        <h3 className="text-base font-semibold mb-2 flex items-center gap-2"><Mail />General Notifications</h3>
                        <div className="space-y-3 pl-8">
                             <div className="flex items-start space-x-2">
                                <Checkbox id="email-notifications" defaultChecked />
                                <div className="grid gap-1.5 leading-none">
                                <label htmlFor="email-notifications" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Email Notifications</label>
                                <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                                </div>
                            </div>
                             <div className="flex items-start space-x-2">
                                <Checkbox id="push-notifications" defaultChecked />
                                <div className="grid gap-1.5 leading-none">
                                <label htmlFor="push-notifications" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Push Notifications</label>
                                <p className="text-sm text-muted-foreground">Browser and mobile push notifications</p>
                                </div>
                            </div>
                             <div className="flex items-start space-x-2">
                                <Checkbox id="weekly-digest" defaultChecked />
                                <div className="grid gap-1.5 leading-none">
                                <label htmlFor="weekly-digest" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Weekly Digest</label>
                                <p className="text-sm text-muted-foreground">Summary of your cooking activity and new recipes</p>
                                </div>
                            </div>
                        </div>
                    </div>
                     <div>
                        <h3 className="text-base font-semibold mb-2 flex items-center gap-2"><CookingPot />Recipe Notifications</h3>
                         <div className="space-y-3 pl-8">
                             <div className="flex items-start space-x-2">
                                <Checkbox id="cooking-reminders" defaultChecked />
                                <div className="grid gap-1.5 leading-none">
                                <label htmlFor="cooking-reminders" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Cooking Reminders</label>
                                <p className="text-sm text-muted-foreground">Reminders for meal planning and cooking times</p>
                                </div>
                            </div>
                             <div className="flex items-start space-x-2">
                                <Checkbox id="favorite-updates" defaultChecked />
                                <div className="grid gap-1.5 leading-none">
                                <label htmlFor="favorite-updates" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Favorite Recipe Updates</label>
                                <p className="text-sm text-muted-foreground">Get notified when your favorite recipes are updated</p>
                                </div>
                            </div>
                        </div>
                    </div>
                 </div>
            </SettingsSection>
        </div>
    );
}