import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { getUserData, saveUserData } from "@/lib/storage";
import { UserData } from "@/lib/types";

// Define form schema with validation
const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  streetAddress: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  enablePayment: z.boolean().default(false),
  cardNumber: z.string().optional(),
  expDate: z.string().optional(),
  cvv: z.string().optional(),
  cardholderName: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const ProfileForm = () => {
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Initialize form with react-hook-form
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      streetAddress: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      enablePayment: false,
      cardNumber: "",
      expDate: "",
      cvv: "",
      cardholderName: "",
    }
  });

  const enablePayment = form.watch("enablePayment");

  // Load user data from storage when component mounts
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const data = await getUserData();
        if (data) {
          // Update form with existing data
          form.reset(data);
        }
      } catch (error) {
        console.error("Failed to load user data:", error);
        toast({
          title: "Error",
          description: "Failed to load your saved information.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [form, toast]);

  // Handle form submission
  const onSubmit = async (data: ProfileFormValues) => {
    try {
      await saveUserData(data);
      toast({
        title: "Success",
        description: "Your profile has been saved successfully!",
      });
    } catch (error) {
      console.error("Failed to save profile:", error);
      toast({
        title: "Error",
        description: "Failed to save your profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle form reset
  const handleReset = () => {
    if (confirm("Are you sure you want to reset the form? All unsaved changes will be lost.")) {
      form.reset();
      toast({
        title: "Form Reset",
        description: "All form fields have been reset.",
      });
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading your profile data...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Information Section */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
            Personal Information
          </h2>
          
          <div className="space-y-3">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="firstName">First Name</FormLabel>
                  <FormControl>
                    <Input {...field} id="firstName" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="lastName">Last Name</FormLabel>
                  <FormControl>
                    <Input {...field} id="lastName" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="email">Email Address</FormLabel>
                  <FormControl>
                    <Input {...field} id="email" type="email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="phone">Phone Number</FormLabel>
                  <FormControl>
                    <Input {...field} id="phone" type="tel" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        {/* Address Information Section */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
            Address Information
          </h2>
          
          <div className="space-y-3">
            <FormField
              control={form.control}
              name="streetAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="streetAddress">Street Address</FormLabel>
                  <FormControl>
                    <Input {...field} id="streetAddress" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="city">City</FormLabel>
                  <FormControl>
                    <Input {...field} id="city" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="state">State/Province</FormLabel>
                    <FormControl>
                      <Input {...field} id="state" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="zipCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="zipCode">ZIP/Postal Code</FormLabel>
                    <FormControl>
                      <Input {...field} id="zipCode" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="country">Country</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger id="country">
                        <SelectValue placeholder="Select a country" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="US">United States</SelectItem>
                      <SelectItem value="CA">Canada</SelectItem>
                      <SelectItem value="UK">United Kingdom</SelectItem>
                      <SelectItem value="AU">Australia</SelectItem>
                      <SelectItem value="FR">France</SelectItem>
                      <SelectItem value="DE">Germany</SelectItem>
                      <SelectItem value="JP">Japan</SelectItem>
                      <SelectItem value="CN">China</SelectItem>
                      <SelectItem value="IN">India</SelectItem>
                      <SelectItem value="BR">Brazil</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        {/* Payment Information Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Payment Information
            </h2>
            <FormField
              control={form.control}
              name="enablePayment"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      id="enablePayment"
                    />
                  </FormControl>
                  <Label
                    htmlFor="enablePayment"
                    className="text-xs text-gray-600"
                  >
                    Enable payment autofill
                  </Label>
                </FormItem>
              )}
            />
          </div>
          
          <div className={`space-y-3 ${!enablePayment ? "opacity-50 pointer-events-none" : ""}`}>
            <FormField
              control={form.control}
              name="cardNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="cardNumber">Card Number</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      id="cardNumber" 
                      placeholder="•••• •••• •••• ••••" 
                      disabled={!enablePayment} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="expDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="expDate">Expiration Date</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        id="expDate" 
                        placeholder="MM/YY" 
                        disabled={!enablePayment} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="cvv"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="cvv">CVV</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        id="cvv" 
                        placeholder="•••" 
                        disabled={!enablePayment} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="cardholderName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="cardholderName">Cardholder Name</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      id="cardholderName" 
                      disabled={!enablePayment} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleReset}
          >
            Reset
          </Button>
          <Button type="submit">
            Save Profile
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProfileForm;
