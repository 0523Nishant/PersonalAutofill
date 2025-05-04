import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CheckIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getSettings, saveSettings } from "@/lib/storage";
import { triggerAutofill } from "@/lib/autofill";
import { Settings } from "@/lib/types";

const AutofillControls = () => {
  const [settings, setSettings] = useState<Settings>({
    enabled: true,
    autoFillOnLoad: false,
    showFillNotification: true,
    fillOnlyEmpty: true,
    fillDelay: 200,
    mappingProfile: "standard",
    trackHistory: true
  });
  const [autofillStatus, setAutofillStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { toast } = useToast();

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

  // Handle setting changes
  const handleSettingChange = async (key: keyof Settings, value: any) => {
    const updatedSettings = { ...settings, [key]: value };
    setSettings(updatedSettings);
    
    try {
      await saveSettings(updatedSettings);
    } catch (error) {
      console.error("Failed to save setting:", error);
      toast({
        title: "Error",
        description: "Failed to save your settings.",
        variant: "destructive",
      });
    }
  };

  // Handle autofill button click
  const handleAutofill = async () => {
    setAutofillStatus('idle');
    
    try {
      const result = await triggerAutofill();
      setAutofillStatus('success');
      
      toast({
        title: "Autofill Complete",
        description: `Successfully filled ${result.filledCount} fields.`,
      });
      
      // Reset button state after 2 seconds
      setTimeout(() => {
        setAutofillStatus('idle');
      }, 2000);
    } catch (error) {
      console.error("Autofill failed:", error);
      setAutofillStatus('error');
      
      toast({
        title: "Autofill Failed",
        description: "Could not autofill fields on this page.",
        variant: "destructive",
      });
      
      // Reset button state after 2 seconds
      setTimeout(() => {
        setAutofillStatus('idle');
      }, 2000);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Autofill Controls</CardTitle>
        <CardDescription>Configure how the extension fills forms on websites.</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Button 
          onClick={handleAutofill}
          className="w-full"
          variant={autofillStatus === 'success' ? "success" : "default"}
        >
          {autofillStatus === 'success' ? (
            <>
              <CheckIcon className="mr-2 h-4 w-4" />
              Fields Filled Successfully!
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Autofill This Page
            </>
          )}
        </Button>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="autoFillOnLoad" 
              checked={settings.autoFillOnLoad} 
              onCheckedChange={(checked) => 
                handleSettingChange('autoFillOnLoad', Boolean(checked))
              }
            />
            <Label htmlFor="autoFillOnLoad">Autofill forms when page loads</Label>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="showFillNotification" 
              checked={settings.showFillNotification} 
              onCheckedChange={(checked) => 
                handleSettingChange('showFillNotification', Boolean(checked))
              }
            />
            <Label htmlFor="showFillNotification">Show notification when fields are filled</Label>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="fillOnlyEmpty" 
              checked={settings.fillOnlyEmpty} 
              onCheckedChange={(checked) => 
                handleSettingChange('fillOnlyEmpty', Boolean(checked))
              }
            />
            <Label htmlFor="fillOnlyEmpty">Only fill empty form fields</Label>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="fillDelay">Fill Delay (milliseconds)</Label>
          <Slider
            id="fillDelay"
            min={0}
            max={1000}
            step={100}
            value={[settings.fillDelay]}
            onValueChange={(values) => handleSettingChange('fillDelay', values[0])}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0ms</span>
            <span>{settings.fillDelay}ms</span>
            <span>1000ms</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AutofillControls;
