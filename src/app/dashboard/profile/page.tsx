
"use client";

import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Camera, User, Settings, Shield, Activity, Lock, ChefHat, Heart, Flame, Clock, Award, Share2, VideoOff, KeyRound, HelpCircle, Smartphone, Laptop, Tablet, CheckCircle, X, Star, ArrowRight, ChevronRight, LineChart, Eye, BarChart2, Mail, Link2, Database, Download, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useProfileStore, Profile } from "@/store/profile-store";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import { format, subDays } from 'date-fns';
import { useRecipeStore } from "@/store/recipe-store";
import { saveUserProfile } from "@/services/profile-service";
import { Skeleton } from "@/components/ui/skeleton";

const cuisines = [
  "Italian", "Mexican", "Chinese", "Indian", "Japanese", "Thai", "French", "Spanish", "Greek", "American"
];

const dietaryRestrictions = [
    { id: "vegetarian", label: "Vegetarian", description: "No meat or fish" },
    { id: "vegan", label: "Vegan", description: "No animal products" },
    { id: "glutenFree", label: "Gluten-Free", description: "No gluten-containing ingredients" },
    { id: "dairyFree", label: "Dairy-Free", description: "No dairy products" },
    { id: "ketogenic", label: "Ketogenic", description: "Low-carb, high-fat diet" },
    { id: "paleo", label: "Paleo", description: "Whole foods, no processed items" },
    { id: "lowSodium", label: "Low Sodium", description: "" },
    { id: "highProtein", label: "High Protein", description: "" },
];

const initialConnectedDevices = [
    { icon: Laptop, name: "MacBook Pro", location: "San Francisco, CA", lastActive: "Jan 22, 2025, 04:45 PM", isCurrent: true },
    { icon: Smartphone, name: "iPhone 15", location: "San Francisco, CA", lastActive: "Jan 22, 2025, 03:20 PM", isCurrent: false },
    { icon: Tablet, name: "iPad Air", location: "San Francisco, CA", lastActive: "Jan 21, 2025, 07:30 PM", isCurrent: false },
]

const activityLogData = [
    {
        icon: ChefHat,
        title: "Generated Creamy Mushroom Risotto",
        description: "Used ingredients: mushrooms, arborio rice, parmesan, white wine",
        category: "Recipe Generated",
        date: new Date(),
        color: "text-green-600"
    },
    {
        icon: Heart,
        title: "Added Spicy Thai Basil Chicken to favorites",
        description: "Saved for quick access in your recipe collection",
        category: "Recipe Favorited",
        date: new Date(),
        color: "text-red-500"
    },
    {
        icon: Star,
        title: "Cooked Mediterranean Quinoa Bowl",
        description: "Rated 5 stars and left a review",
        category: "Recipe Cooked",
        date: subDays(new Date(), 1),
        color: "text-yellow-500"
    },
    {
        icon: Settings,
        title: "Updated cooking preferences",
        description: "Changed skill level to intermediate and added dietary restrictions",
        category: "Profile Updated",
        date: subDays(new Date(), 1),
        color: "text-blue-500"
    },
];

export default function ProfilePage() {
  const { profile, setProfile } = useProfileStore();
  const { recentRecipes, favoriteRecipes } = useRecipeStore();
  const { user, sendPasswordReset, loading: authLoading, updateUserEmail, updateUserProfile } = useAuth();
  const { toast } = useToast();

  const [localProfile, setLocalProfile] = useState<Profile>(profile);
  const [isSaving, setIsSaving] = useState(false);
  
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [cookingSkill, setCookingSkill] = useState("Intermediate");
  const [cookingTime, setCookingTime] = useState("30-60 min");
  const [spiceTolerance, setSpiceTolerance] = useState("Medium");
  const [servingSize, setServingSize] = useState("2-4 People");
  const [favoriteCuisine, setFavoriteCuisine] = useState("");
  const [restrictions, setRestrictions] = useState<string[]>([]);
  const [connectedDevices, setConnectedDevices] = useState(initialConnectedDevices);

  useEffect(() => {
    if (profile) {
      setLocalProfile(profile);
    }
  }, [profile]);

  useEffect(() => {
    let stream: MediaStream;
    const getCameraPermission = async () => {
      if (!isCameraOpen) {
        if (videoRef.current?.srcObject) {
            (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({video: true});
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
      }
    };

    getCameraPermission();

    return () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    }
  }, [isCameraOpen]);

  const handlePasswordReset = async () => {
    if (!user?.email) {
        toast({ variant: "destructive", title: "Error", description: "No email address found for this user." });
        return;
    }
    try {
        await sendPasswordReset(user.email);
        toast({ title: "Password Reset Email Sent", description: `A reset link has been sent to ${user.email}.` });
    } catch (error: any) {
        toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const handleDeviceRemove = (deviceName: string) => {
    setConnectedDevices(prev => prev.filter(device => device.name !== deviceName));
    toast({
        title: "Device Removed",
        description: `${deviceName} has been signed out.`,
    })
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setLocalProfile(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSaveChanges = async () => {
    if (!user) {
      toast({ variant: "destructive", title: "Error", description: "You must be logged in to save your profile." });
      return;
    }

    setIsSaving(true);
    try {
      // Update Firestore
      await saveUserProfile(user.uid, localProfile);

      // Update Firebase Auth if necessary
      if (profile.email !== localProfile.email) {
          await updateUserEmail(localProfile.email);
      }
      if (profile.firstName !== localProfile.firstName || profile.lastName !== localProfile.lastName || profile.profilePhoto !== localProfile.profilePhoto) {
        await updateUserProfile({
          firstName: localProfile.firstName,
          lastName: localProfile.lastName,
          profilePhoto: localProfile.profilePhoto,
        });
      }
      
      // Update global state
      setProfile(localProfile);
      
      toast({
        title: "Profile Saved!",
        description: "Your changes have been successfully saved.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: error.message,
      });
    } finally {
        setIsSaving(false);
    }
  };

  const handlePreferencesSave = () => {
    toast({
      title: "Preferences Saved!",
      description: "Your cooking preferences have been updated.",
    });
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalProfile(prev => ({ ...prev, profilePhoto: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  }

  const takePicture = () => {
    if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        if (context) {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/png');
            setLocalProfile(prev => ({ ...prev, profilePhoto: dataUrl }));
            setIsCameraOpen(false); // Close dialog after taking picture
        }
    }
  }

  const handleRestrictionChange = (id: string) => {
    setRestrictions(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
  };

  const formatActivityDate = (date: Date) => {
    const today = new Date();
    const yesterday = subDays(today, 1);
    if (format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
        return `Today at ${format(date, 'p')}`;
    }
    if (format(date, 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd')) {
        return `Yesterday at ${format(date, 'p')}`;
    }
    return format(date, 'MMM d, yyyy');
  };

  if (authLoading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Profile Management</h1>
        <p className="text-muted-foreground">Customize your account and cooking preferences</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="w-full h-auto overflow-x-auto overflow-y-hidden justify-start">
          <TabsTrigger value="profile"><User className="mr-2"/>Profile</TabsTrigger>
          <TabsTrigger value="preferences"><Settings className="mr-2"/>Preferences</TabsTrigger>
          <TabsTrigger value="security"><Shield className="mr-2"/>Security</TabsTrigger>
          <TabsTrigger value="activity"><Activity className="mr-2"/>Activity</TabsTrigger>
          <TabsTrigger value="privacy"><Lock className="mr-2"/>Privacy</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-1 space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Photo</CardTitle>
                  <CardDescription>Upload a photo to personalize your cooking profile</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                  <Avatar className="w-32 h-32">
                    <AvatarImage src={localProfile.profilePhoto} alt="Profile Photo" />
                    <AvatarFallback><User className="w-16 h-16" /></AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col sm:flex-row gap-4 w-full">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                    <Button variant="outline" className="w-full" onClick={triggerFileSelect}><Upload className="mr-2"/>Choose File</Button>
                    <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="w-full"><Camera className="mr-2"/>Take Photo</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Take a Photo</DialogTitle>
                            </DialogHeader>
                            <div>
                                <video ref={videoRef} className="w-full aspect-video rounded-md bg-black" autoPlay muted />
                                <canvas ref={canvasRef} className="hidden" />
                                {hasCameraPermission === false && (
                                     <Alert variant="destructive" className="mt-4">
                                        <VideoOff className="h-4 w-4" />
                                        <AlertTitle>Camera Access Denied</AlertTitle>
                                        <AlertDescription>
                                            Please enable camera permissions in your browser settings.
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>
                            <DialogFooter>
                                <Button onClick={takePicture} disabled={!hasCameraPermission}>Snap Photo</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                  </div>
                  <p className="text-xs text-muted-foreground">Supported formats: JPG, PNG, GIF (max 5MB)</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cooking Statistics</CardTitle>
                  <CardDescription>Your culinary journey at a glance</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-2 rounded-lg bg-accent/50">
                    <ChefHat className="mx-auto w-8 h-8 text-primary"/>
                    <p className="text-2xl font-bold">{recentRecipes.length}</p>
                    <p className="text-xs text-muted-foreground">Recipes Generated</p>
                  </div>
                  <div className="p-2 rounded-lg bg-accent/50">
                    <Heart className="mx-auto w-8 h-8 text-destructive"/>
                    <p className="text-2xl font-bold">{favoriteRecipes.length}</p>
                    <p className="text-xs text-muted-foreground">Favorites Saved</p>
                  </div>
                   <div className="p-2 rounded-lg bg-accent/50">
                    <Flame className="mx-auto w-8 h-8 text-orange-500"/>
                    <p className="text-2xl font-bold">12 <span className="text-sm">days</span></p>
                    <p className="text-xs text-muted-foreground">Cooking Streak</p>
                  </div>
                   <div className="p-2 rounded-lg bg-accent/50">
                    <Clock className="mx-auto w-8 h-8 text-blue-500"/>
                    <p className="text-2xl font-bold">48<span className="text-sm">h</span></p>
                    <p className="text-xs text-muted-foreground">Time Cooking</p>
                  </div>
                   <div className="p-2 rounded-lg bg-accent/50">
                    <Award className="mx-auto w-8 h-8 text-yellow-500"/>
                    <p className="text-2xl font-bold">8</p>
                    <p className="text-xs text-muted-foreground">Skills Unlocked</p>
                  </div>
                   <div className="p-2 rounded-lg bg-accent/50">
                    <Share2 className="mx-auto w-8 h-8 text-green-500"/>
                    <p className="text-2xl font-bold">15</p>
                    <p className="text-xs text-muted-foreground">Recipes Shared</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your personal details and contact information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" name="username" value={localProfile.username} onChange={handleInputChange} />
                    <p className="text-sm text-muted-foreground">This will be displayed on your recipes and profile</p>
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" name="email" type="email" value={localProfile.email} onChange={handleInputChange} />
                    <p className="text-sm text-muted-foreground">Used for account notifications and password recovery</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" name="firstName" value={localProfile.firstName} onChange={handleInputChange}/>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" name="lastName" value={localProfile.lastName} onChange={handleInputChange}/>
                    </div>
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" name="phone" type="tel" value={localProfile.phone} onChange={handleInputChange}/>
                     <p className="text-sm text-muted-foreground">Optional - for account security notifications</p>
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea id="bio" name="bio" value={localProfile.bio} onChange={handleInputChange} rows={4} placeholder="Tell us a little about your cooking journey"/>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleSaveChanges} disabled={isSaving}>{isSaving ? "Saving..." : "Save Changes"}</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="preferences" className="mt-6">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Cooking Preferences</CardTitle>
                <CardDescription>Customize your recipe recommendations</CardDescription>
              </div>
              <Settings className="w-6 h-6 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label htmlFor="cooking-skill">Cooking Skill Level</Label>
                  <Select value={cookingSkill} onValueChange={setCookingSkill}>
                    <SelectTrigger id="cooking-skill">
                      <SelectValue placeholder="Select skill level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">This helps us suggest appropriate recipes</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cooking-time">Preferred Cooking Time</Label>
                  <Select value={cookingTime} onValueChange={setCookingTime}>
                    <SelectTrigger id="cooking-time">
                      <SelectValue placeholder="Select cooking time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Under 30 min">Under 30 min</SelectItem>
                      <SelectItem value="30-60 min">Medium (30-60 min)</SelectItem>
                      <SelectItem value="Over 60 min">Over 60 min</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">How much time do you usually have for cooking?</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="spice-tolerance">Spice Tolerance</Label>
                  <Select value={spiceTolerance} onValueChange={setSpiceTolerance}>
                    <SelectTrigger id="spice-tolerance">
                      <SelectValue placeholder="Select spice tolerance" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mild">Mild</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Spicy">Spicy</SelectItem>
                    </SelectContent>
                  </Select>
                   <p className="text-sm text-muted-foreground">How spicy do you like your food?</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serving-size">Typical Serving Size</Label>
                  <Select value={servingSize} onValueChange={setServingSize}>
                    <SelectTrigger id="serving-size">
                      <SelectValue placeholder="Select serving size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-2 People">1-2 People</SelectItem>
                      <SelectItem value="2-4 People">2-4 People</SelectItem>
                      <SelectItem value="4+ People">4+ People</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">How many people do you usually cook for?</p>
                </div>
                 <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="favorite-cuisines">Favorite Cuisines</Label>
                  <Select value={favoriteCuisine} onValueChange={setFavoriteCuisine}>
                    <SelectTrigger id="favorite-cuisines">
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      {cuisines.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                   <p className="text-sm text-muted-foreground">Select your preferred cuisine types</p>
                </div>
              </div>

              <div>
                <Label className="text-base font-semibold">Dietary Restrictions</Label>
                <p className="text-sm text-muted-foreground">Select any dietary preferences or restrictions</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  {dietaryRestrictions.map(item => (
                    <div key={item.id} className="flex items-start space-x-2">
                       <Checkbox 
                        id={item.id} 
                        checked={restrictions.includes(item.id)}
                        onCheckedChange={() => handleRestrictionChange(item.id)}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <label htmlFor={item.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          {item.label}
                        </label>
                        {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handlePreferencesSave}>Save Preferences</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="security" className="mt-6">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Account Security</CardTitle>
                <CardDescription>Manage your account security and login settings</CardDescription>
              </div>
              <Shield className="w-6 h-6 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-4 rounded-lg border flex items-start gap-4">
                    <Clock className="w-8 h-8 text-muted-foreground mt-1"/>
                    <div>
                        <p className="font-semibold">Last Login</p>
                        <p className="text-muted-foreground text-sm">{user?.metadata.lastSignInTime ? format(new Date(user.metadata.lastSignInTime), 'MMM d, yyyy, p') : 'N/A'}</p>
                        <p className="text-muted-foreground text-sm">San Francisco, CA</p>
                    </div>
                </div>
                <div className="p-4 rounded-lg border flex items-start gap-4">
                    <HelpCircle className="w-8 h-8 text-muted-foreground mt-1"/>
                    <div>
                        <p className="font-semibold">Connected Devices</p>
                        <p className="text-muted-foreground text-sm">{connectedDevices.length} active devices</p>
                    </div>
                </div>
              </div>

              <div>
                <Label className="text-base font-semibold flex items-center gap-2"><KeyRound/>Password & Authentication</Label>
                <div className="mt-4 flex flex-col sm:flex-row gap-4">
                    <Button variant="outline" onClick={handlePasswordReset}>Change Password</Button>
                    <RadioGroup defaultValue="disable-2fa" className="flex items-center gap-4">
                       <div className="flex items-center space-x-2">
                        <RadioGroupItem value="enable-2fa" id="enable-2fa" />
                        <Label htmlFor="enable-2fa">Enable 2FA</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="disable-2fa" id="disable-2fa" />
                        <Label htmlFor="disable-2fa">Disable 2FA</Label>
                      </div>
                    </RadioGroup>
                </div>
              </div>
              
              <div>
                <Label className="text-base font-semibold flex items-center gap-2"><Laptop/>Connected Devices</Label>
                 <div className="mt-4 space-y-4">
                    {connectedDevices.map((device, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-4">
                                <device.icon className="w-8 h-8 text-muted-foreground"/>
                                <div>
                                    <p className="font-semibold">{device.name} {device.isCurrent && <span className="text-xs text-primary font-medium bg-primary/20 px-2 py-1 rounded-full ml-2">Current</span>}</p>
                                    <p className="text-sm text-muted-foreground">{device.location} • Last active {device.lastActive}</p>
                                </div>
                            </div>
                            {!device.isCurrent && (
                              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeviceRemove(device.name)}>
                                  <X className="w-5 h-5"/>
                              </Button>
                            )}
                        </div>
                    ))}
                 </div>
              </div>

              <div>
                <Label className="text-base font-semibold">Security Tips</Label>
                 <div className="mt-4 p-4 border rounded-lg bg-accent/50 space-y-3">
                    <div className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5"/>
                        <p className="text-sm text-muted-foreground">Use a strong, unique password for your account</p>
                    </div>
                     <div className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5"/>
                        <p className="text-sm text-muted-foreground">Enable two-factor authentication for extra security</p>
                    </div>
                     <div className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5"/>
                        <p className="text-sm text-muted-foreground">Regularly review and remove unused connected devices</p>
                    </div>
                 </div>
              </div>

            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="activity" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your cooking journey and recipe interactions</CardDescription>
              </div>
              <LineChart className="w-6 h-6 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {activityLogData.map((item, index) => (
                    <div key={index}>
                      <div className="flex items-start gap-4">
                        <div className={`mt-1 rounded-full p-2 bg-accent/50 ${item.color}`}>
                          <item.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{item.title}</p>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {item.category} &bull; {formatActivityDate(item.date)}
                          </p>
                        </div>
                        <Button variant="ghost" size="icon" className="self-center">
                            <ChevronRight className="w-5 h-5 text-muted-foreground"/>
                        </Button>
                      </div>
                      {index < activityLogData.length - 1 && <Separator className="my-4" />}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
            <Button variant="link" className="w-full text-primary">
                View All Activity <ArrowRight className="ml-2"/>
            </Button>
          </Card>
        </TabsContent>
         <TabsContent value="privacy" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>Control your privacy and data sharing preferences</CardDescription>
              </div>
              <Shield className="w-6 h-6 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-base font-semibold flex items-center gap-2"><Eye /> Profile Visibility</h3>
                <div className="space-y-2 pl-6">
                  <Label htmlFor="profile-visibility">Who can see your profile?</Label>
                  <Select defaultValue="public">
                    <SelectTrigger id="profile-visibility">
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">Control who can view your profile and cooking activity</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-base font-semibold flex items-center gap-2"><Share2 /> Profile & Sharing</h3>
                 <div className="space-y-4 pl-6">
                    <div className="flex items-start space-x-2">
                      <Checkbox id="allow-recipe-sharing" defaultChecked />
                      <div className="grid gap-1.5 leading-none">
                        <label htmlFor="allow-recipe-sharing" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                         Allow Recipe Sharing
                        </label>
                        <p className="text-sm text-muted-foreground">Let others share your recipes with the community</p>
                      </div>
                    </div>
                     <div className="flex items-start space-x-2">
                      <Checkbox id="community-interactions" defaultChecked />
                      <div className="grid gap-1.5 leading-none">
                        <label htmlFor="community-interactions" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                         Community Interactions
                        </label>
                        <p className="text-sm text-muted-foreground">Allow others to comment and rate your recipes</p>
                      </div>
                    </div>
                </div>
              </div>

               <Separator />

                <div className="space-y-4">
                    <h3 className="text-base font-semibold flex items-center gap-2"><BarChart2 /> Data & Analytics</h3>
                    <div className="space-y-4 pl-6">
                        <div className="flex items-start space-x-2">
                            <Checkbox id="activity-tracking" defaultChecked />
                            <div className="grid gap-1.5 leading-none">
                                <label htmlFor="activity-tracking" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Activity Tracking</label>
                                <p className="text-sm text-muted-foreground">Track your cooking activities for personalized recommendations</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-2">
                            <Checkbox id="cooking-analytics" defaultChecked />
                            <div className="grid gap-1.5 leading-none">
                                <label htmlFor="cooking-analytics" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Cooking Analytics</label>
                                <p className="text-sm text-muted-foreground">Analyze your cooking patterns to improve suggestions</p>
                            </div>
                        </div>
                         <div className="flex items-start space-x-2">
                            <Checkbox id="usage-data-collection" defaultChecked />
                            <div className="grid gap-1.5 leading-none">
                                <label htmlFor="usage-data-collection" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Usage Data Collection</label>
                                <p className="text-sm text-muted-foreground">Help ChefAI by sharing anonymous usage data</p>
                            </div>
                        </div>
                    </div>
                </div>

                <Separator />
                
                <div className="space-y-4">
                    <h3 className="text-base font-semibold flex items-center gap-2"><Mail /> Communications</h3>
                    <div className="space-y-4 pl-6">
                        <div className="flex items-start space-x-2">
                            <Checkbox id="email-notifications" defaultChecked/>
                            <div className="grid gap-1.5 leading-none">
                                <label htmlFor="email-notifications" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Email Notifications</label>
                                <p className="text-sm text-muted-foreground">Receive notifications about your account and recipes</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-2">
                            <Checkbox id="marketing-communications" />
                            <div className="grid gap-1.5 leading-none">
                                <label htmlFor="marketing-communications" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Marketing Communications</label>
                                <p className="text-sm text-muted-foreground">Receive updates about new features and cooking tips</p>
                            </div>
                        </div>
                    </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-base font-semibold flex items-center gap-2"><Link2 /> Third-Party Integration</h3>
                   <div className="space-y-4 pl-6">
                      <div className="flex items-start space-x-2">
                          <Checkbox id="third-party-sharing" />
                          <div className="grid gap-1.5 leading-none">
                              <label htmlFor="third-party-sharing" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Third-Party Data Sharing</label>
                              <p className="text-sm text-muted-foreground">Allow sharing anonymized data with cooking partners</p>
                          </div>
                      </div>
                  </div>
                </div>

                <Separator />

                 <div className="space-y-4">
                    <h3 className="text-base font-semibold flex items-center gap-2"><Database /> Data Management</h3>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pl-6">
                       <Button variant="outline"><Download className="mr-2"/>Export My Data</Button>
                       <Button variant="destructive"><Trash2 className="mr-2"/>Delete Account</Button>
                    </div>
                    <p className="text-sm text-muted-foreground pl-6">Export your data or permanently delete your account and all associated data</p>
                </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

const ProfileSkeleton = () => (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-4 w-3/4 mt-2" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                    <Skeleton className="w-32 h-32 rounded-full" />
                    <Skeleton className="w-full h-24" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="w-full h-40" />
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                     <div className="space-y-2">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
)
