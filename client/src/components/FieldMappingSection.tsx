import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CheckIcon, XIcon } from "lucide-react";
import { getSettings, saveSettings } from "@/lib/storage";
import { Settings } from "@/lib/types";

const FieldMappingSection = () => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [showCustomDialog, setShowCustomDialog] = useState(false);

  // Load settings when component mounts
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await getSettings();
        if (savedSettings) {
          setSettings(savedSettings);
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    };

    loadSettings();
  }, []);

  // Handle mapping profile change
  const handleMappingProfileChange = async (value: string) => {
    if (!settings) return;
    
    const updatedSettings = { ...settings, mappingProfile: value };
    setSettings(updatedSettings);
    
    try {
      await saveSettings(updatedSettings);
    } catch (error) {
      console.error("Failed to save mapping profile:", error);
    }
  };

  // Mock function for handling custom mapping edit
  const handleCustomMapping = () => {
    setShowCustomDialog(true);
  };

  if (!settings) {
    return <div>Loading field mapping settings...</div>;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Field Mapping</CardTitle>
        <CardDescription>Configure how your data maps to form fields.</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="mb-3">
          <Label htmlFor="mappingProfile">Mapping Profile</Label>
          <Select
            value={settings.mappingProfile}
            onValueChange={handleMappingProfileChange}
          >
            <SelectTrigger id="mappingProfile">
              <SelectValue placeholder="Select a mapping profile" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard (Recommended)</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="mb-3 text-right">
          <Button
            variant="link"
            onClick={handleCustomMapping}
            className="text-sm text-primary hover:text-primary/80 p-0 h-auto"
          >
            Edit Custom Mapping
          </Button>
        </div>
        
        <div className="bg-muted rounded-md p-3 text-sm">
          <p className="text-foreground font-medium mb-2">Common Field Types Detected:</p>
          <ul className="text-muted-foreground space-y-1 pl-2">
            <li className="flex items-center">
              <CheckIcon className="h-4 w-4 text-green-500 mr-1.5" />
              Name fields
            </li>
            <li className="flex items-center">
              <CheckIcon className="h-4 w-4 text-green-500 mr-1.5" />
              Email fields
            </li>
            <li className="flex items-center">
              <CheckIcon className="h-4 w-4 text-green-500 mr-1.5" />
              Address fields
            </li>
            <li className="flex items-center">
              <XIcon className="h-4 w-4 text-gray-400 mr-1.5" />
              Payment fields (disabled)
            </li>
          </ul>
        </div>
      </CardContent>

      {/* Custom Mapping Dialog */}
      <Dialog open={showCustomDialog} onOpenChange={setShowCustomDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Custom Field Mapping</DialogTitle>
            <DialogDescription>
              Define how your profile data maps to specific form fields.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="text-sm text-muted-foreground">
              Custom mapping functionality will be implemented in a future version.
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setShowCustomDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default FieldMappingSection;
