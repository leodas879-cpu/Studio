"use client";

import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Camera, User, Settings, Shield, Activity, Lock, ChefHat, Heart, Flame, Clock, Award, Share2, VideoOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useProfileStore } from "@/store/profile-store";

export default function Profile() {
  const { profile, setProfile } = useProfileStore();
  const [localProfile, setLocalProfile] = useState(profile);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();
  
  useEffect(() => {
    setLocalProfile(profile);
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


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setLocalProfile(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSaveChanges = () => {
    setProfile(localProfile);
    toast({
      title: "Profile Saved!",
      description: "Your changes have been successfully saved.",
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


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Profile Management</h1>
        <p className="text-muted-foreground">Customize your account and cooking preferences</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
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
                   <div className="w-full p-6 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center">
                    <User className="w-12 h-12 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">Drop photo here</p>
                  </div>
                  <div className="flex gap-4 w-full">
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
                    <p className="text-2xl font-bold">127</p>
                    <p className="text-xs text-muted-foreground">Recipes Generated</p>
                  </div>
                  <div className="p-2 rounded-lg bg-accent/50">
                    <Heart className="mx-auto w-8 h-8 text-destructive"/>
                    <p className="text-2xl font-bold">23</p>
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
                    <Button onClick={handleSaveChanges}>Save Changes</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="preferences">
          <p>Preferences settings will be here.</p>
        </TabsContent>
        <TabsContent value="security">
          <p>Security settings will be here.</p>
        </TabsContent>
        <TabsContent value="activity">
          <p>Activity feed will be here.</p>
        </TabsContent>
         <TabsContent value="privacy">
          <p>Privacy settings will be here.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
