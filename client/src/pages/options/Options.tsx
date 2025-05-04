import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Shield, Save, Trash2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getUserData, saveUserData, getSettings, saveSettings, clearAllData } from "@/lib/storage";
import { UserData, Settings } from "@/lib/types";

const Options = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getUserData();
        const settingsData = await getSettings();
        setUserData(data);
        setSettings(settingsData);
      } catch (error) {
        console.error("Failed to load data:", error);
        toast({
          title: "Error loading data",
          description: "Failed to load your saved information.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [toast]);

  const handleSaveSettings = async () => {
    if (!settings) return;
    
    try {
      await saveSettings(settings);
      toast({
        title: "Settings saved",
        description: "Your settings have been updated successfully.",
      });
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast({
        title: "Error saving settings",
        description: "Failed to save your settings.",
        variant: "destructive",
      });
    }
  };

  const handleClearAllData = async () => {
    if (confirm("Are you sure you want to clear all your data? This action cannot be undone.")) {
      try {
        await clearAllData();
        setUserData(null);
        toast({
          title: "Data cleared",
          description: "All your data has been removed from the extension.",
        });
      } catch (error) {
        console.error("Failed to clear data:", error);
        toast({
          title: "Error clearing data",
          description: "Failed to remove your data.",
          variant: "destructive",
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto p-4">
      <div className="flex items-center mb-6">
        <Shield className="h-8 w-8 text-primary mr-2" />
        <h1 className="text-2xl font-bold">AutoFill Extension Settings</h1>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="autofill">Autofill Settings</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure how the extension behaves
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="enableExtension">Enable Extension</Label>
                  <p className="text-sm text-gray-500">
                    Turn the extension on or off globally
                  </p>
                </div>
                <Switch 
                  id="enableExtension" 
                  checked={settings?.enabled} 
                  onCheckedChange={(checked) => 
                    setSettings(prev => prev ? {...prev, enabled: checked} : null)
                  }
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="showNotifications">Show Notifications</Label>
                  <p className="text-sm text-gray-500">
                    Display notifications when autofill is performed
                  </p>
                </div>
                <Switch 
                  id="showNotifications" 
                  checked={settings?.showFillNotification} 
                  onCheckedChange={(checked) => 
                    setSettings(prev => prev ? {...prev, showFillNotification: checked} : null)
                  }
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="destructive" 
                onClick={handleClearAllData}
                className="flex items-center"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All Data
              </Button>
              <Button onClick={handleSaveSettings} className="flex items-center">
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="autofill" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Autofill Behavior</CardTitle>
              <CardDescription>
                Configure how forms are filled automatically
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="autoFillOnLoad">Autofill on Page Load</Label>
                  <p className="text-sm text-gray-500">
                    Automatically fill forms when a page loads
                  </p>
                </div>
                <Switch 
                  id="autoFillOnLoad" 
                  checked={settings?.autoFillOnLoad} 
                  onCheckedChange={(checked) => 
                    setSettings(prev => prev ? {...prev, autoFillOnLoad: checked} : null)
                  }
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="fillOnlyEmpty">Fill Empty Fields Only</Label>
                  <p className="text-sm text-gray-500">
                    Only fill fields that are empty
                  </p>
                </div>
                <Switch 
                  id="fillOnlyEmpty" 
                  checked={settings?.fillOnlyEmpty} 
                  onCheckedChange={(checked) => 
                    setSettings(prev => prev ? {...prev, fillOnlyEmpty: checked} : null)
                  }
                />
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <Label htmlFor="fillDelay">Fill Delay (milliseconds)</Label>
                <div className="flex items-center space-x-2">
                  <Input 
                    id="fillDelay" 
                    type="range" 
                    min="0" 
                    max="1000" 
                    step="100" 
                    value={settings?.fillDelay || 0} 
                    onChange={(e) => 
                      setSettings(prev => prev ? 
                        {...prev, fillDelay: parseInt(e.target.value)} : null)
                    }
                    className="w-full"
                  />
                  <span className="text-sm">{settings?.fillDelay || 0}ms</span>
                </div>
                <p className="text-xs text-gray-500">
                  Delay between each field being filled
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings} className="w-full">
                Save Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>
                Manage your data and privacy preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="storePaymentInfo">Store Payment Information</Label>
                  <p className="text-sm text-gray-500">
                    Enable or disable storage of payment details
                  </p>
                </div>
                <Switch 
                  id="storePaymentInfo" 
                  checked={userData?.enablePayment || false} 
                  onCheckedChange={(checked) => 
                    setUserData(prev => prev ? {...prev, enablePayment: checked} : null)
                  }
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="trackHistory">Track Autofill History</Label>
                  <p className="text-sm text-gray-500">
                    Keep a record of autofill operations
                  </p>
                </div>
                <Switch 
                  id="trackHistory" 
                  checked={settings?.trackHistory} 
                  onCheckedChange={(checked) => 
                    setSettings(prev => prev ? {...prev, trackHistory: checked} : null)
                  }
                />
              </div>
              
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-amber-800">Data Storage Notice</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    All your data is stored locally in your browser and is never sent to our servers.
                    Clearing your browser data or uninstalling the extension will permanently remove this information.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => {
                  if (confirm("Are you sure you want to clear your autofill history?")) {
                    // Clear history logic
                    toast({
                      title: "History cleared",
                      description: "Your autofill history has been cleared.",
                    });
                  }
                }}
              >
                Clear History Only
              </Button>
              <Button onClick={handleSaveSettings}>
                Save Privacy Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Options;
