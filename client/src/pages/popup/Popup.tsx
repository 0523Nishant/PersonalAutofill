import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ProfileForm from "@/components/ProfileForm";
import AutofillControls from "@/components/AutofillControls";
import FieldMappingSection from "@/components/FieldMappingSection";
import HistorySection from "@/components/HistorySection";

const Popup = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const { toast } = useToast();

  // This function would be called from the settings button
  const openOptions = () => {
    if (chrome?.runtime?.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      // Fallback for development environment
      window.open("/options", "_blank");
    }
  };

  return (
    <div className="relative flex flex-col h-full bg-background">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center">
          <Shield className="h-6 w-6 text-primary mr-2" />
          <h1 className="text-lg font-semibold">AutoFill Extension</h1>
        </div>
        <button 
          onClick={openOptions}
          className="text-gray-500 hover:text-primary transition-colors" 
          aria-label="Settings"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Tabs 
          defaultValue="profile" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">My Profile</TabsTrigger>
            <TabsTrigger value="autofill">Autofill</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="p-4">
            <ProfileForm />
          </TabsContent>
          
          <TabsContent value="autofill" className="p-4">
            <div className="space-y-4">
              <AutofillControls />
              <FieldMappingSection />
            </div>
          </TabsContent>
          
          <TabsContent value="history" className="p-4">
            <HistorySection />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 p-3 text-center text-xs text-gray-500">
        <p>AutoFill Extension v1.0.0</p>
      </footer>
    </div>
  );
};

export default Popup;
