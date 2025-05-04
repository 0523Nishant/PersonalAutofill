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
  gender: z.string().optional(),
  phone: z.string().optional(),
  streetAddress: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  resumeFile: z.string().optional(),
  coverLetter: z.string().optional(),
  enablePayment: z.boolean().default(false),
  cardNumber: z.string().optional(),
  expDate: z.string().optional(),
  cvv: z.string().optional(),
  cardholderName: z.string().optional(),
  
  // Education fields
  school: z.string().optional(),
  degree: z.string().optional(),
  educationStartMonth: z.string().optional(),
  educationStartYear: z.string().optional(),
  educationEndMonth: z.string().optional(),
  educationEndYear: z.string().optional(),
  
  // Social profiles
  linkedinUrl: z.string().url("Invalid LinkedIn URL").optional().or(z.literal("")),
  githubUrl: z.string().url("Invalid GitHub URL").optional().or(z.literal(""))
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
      gender: "",
      phone: "",
      streetAddress: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      resumeFile: "",
      coverLetter: "",
      enablePayment: false,
      cardNumber: "",
      expDate: "",
      cvv: "",
      cardholderName: "",
      
      // Education
      school: "",
      degree: "",
      educationStartMonth: "",
      educationStartYear: "",
      educationEndMonth: "",
      educationEndYear: "",
      
      // Social profiles
      linkedinUrl: "",
      githubUrl: ""
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
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="gender">Gender</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger id="gender">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="non-binary">Non-binary</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
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
        
        {/* Education Information Section */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
            Education
          </h2>
          
          <div className="space-y-3">
            <FormField
              control={form.control}
              name="school"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="school">School/University</FormLabel>
                  <FormControl>
                    <Input {...field} id="school" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="degree"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="degree">Degree/Certificate</FormLabel>
                  <FormControl>
                    <Input {...field} id="degree" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <h3 className="text-xs font-medium text-gray-600 mb-2">Start Date</h3>
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="educationStartMonth"
                    render={({ field }) => (
                      <FormItem>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger id="educationStartMonth">
                              <SelectValue placeholder="Month" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="01">January</SelectItem>
                            <SelectItem value="02">February</SelectItem>
                            <SelectItem value="03">March</SelectItem>
                            <SelectItem value="04">April</SelectItem>
                            <SelectItem value="05">May</SelectItem>
                            <SelectItem value="06">June</SelectItem>
                            <SelectItem value="07">July</SelectItem>
                            <SelectItem value="08">August</SelectItem>
                            <SelectItem value="09">September</SelectItem>
                            <SelectItem value="10">October</SelectItem>
                            <SelectItem value="11">November</SelectItem>
                            <SelectItem value="12">December</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="educationStartYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input {...field} id="educationStartYear" placeholder="Year" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div>
                <h3 className="text-xs font-medium text-gray-600 mb-2">End Date</h3>
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="educationEndMonth"
                    render={({ field }) => (
                      <FormItem>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger id="educationEndMonth">
                              <SelectValue placeholder="Month" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="01">January</SelectItem>
                            <SelectItem value="02">February</SelectItem>
                            <SelectItem value="03">March</SelectItem>
                            <SelectItem value="04">April</SelectItem>
                            <SelectItem value="05">May</SelectItem>
                            <SelectItem value="06">June</SelectItem>
                            <SelectItem value="07">July</SelectItem>
                            <SelectItem value="08">August</SelectItem>
                            <SelectItem value="09">September</SelectItem>
                            <SelectItem value="10">October</SelectItem>
                            <SelectItem value="11">November</SelectItem>
                            <SelectItem value="12">December</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="educationEndYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input {...field} id="educationEndYear" placeholder="Year" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
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

        {/* Professional Documents Section */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
            Professional Documents
          </h2>
          
          <div className="space-y-3">
            <FormField
              control={form.control}
              name="resumeFile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="resumeFile">Resume (PDF)</FormLabel>
                  <FormControl>
                    <div className="flex">
                      <Input 
                        type="file" 
                        id="resumeFile" 
                        accept=".pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              field.onChange(event.target?.result);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      {field.value && (
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="ml-2"
                          onClick={() => field.onChange("")}
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="coverLetter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="coverLetter">Cover Letter</FormLabel>
                  <FormControl>
                    <textarea 
                      {...field} 
                      id="coverLetter" 
                      className="min-h-[120px] w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        {/* Social Profiles Section */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
            Social Profiles
          </h2>
          
          <div className="space-y-3">
            <FormField
              control={form.control}
              name="linkedinUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="linkedinUrl">LinkedIn URL</FormLabel>
                  <FormControl>
                    <Input {...field} id="linkedinUrl" placeholder="https://linkedin.com/in/username" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="githubUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="githubUrl">GitHub URL</FormLabel>
                  <FormControl>
                    <Input {...field} id="githubUrl" placeholder="https://github.com/username" />
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
