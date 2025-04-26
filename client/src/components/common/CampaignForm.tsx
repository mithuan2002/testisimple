import React, { useState } from "react";
import { FaInstagram, FaSnapchat } from "react-icons/fa";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Define submission schema
const submissionSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Valid email is required" }),
  platform: z.enum(["instagram", "snapchat"], { 
    required_error: "Please select a platform" 
  }),
});

type CampaignSubmissionValues = z.infer<typeof submissionSchema>;

type CampaignFormProps = {
  campaignId: number;
  title: string;
  description: string;
  platforms: string[];
};

export default function CampaignForm({ campaignId, title, description, platforms }: CampaignFormProps) {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submissionComplete, setSubmissionComplete] = useState(false);

  const form = useForm<CampaignSubmissionValues>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      name: "",
      email: "",
      platform: undefined,
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const submitEntry = useMutation({
    mutationFn: async (data: CampaignSubmissionValues) => {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("platform", data.platform);
      formData.append("campaignId", campaignId.toString());
      formData.append("engagementCount", "0"); // Default engagement count
      if (file) {
        formData.append("screenshot", file);
      }

      return apiRequest("POST", "/api/submissions", formData);
    },
    onSuccess: () => {
      toast({
        title: "Submission successful!",
        description: "Thank you for your participation.",
      });
      form.reset();
      setFile(null);
      setPreviewUrl(null);
      setSubmissionComplete(true);
    },
    onError: (error) => {
      toast({
        title: "Submission failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CampaignSubmissionValues) => {
    if (!file) {
      toast({
        title: "Missing screenshot",
        description: "Please upload a screenshot of your social media post",
        variant: "destructive",
      });
      return;
    }

    submitEntry.mutate(data);
  };

  if (submissionComplete) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Thank You!</CardTitle>
          <CardDescription className="text-center">
            Your submission has been received and is being reviewed.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-slate-600">
              We'll notify you if you're one of our top promoters!
            </p>
          </div>
        </CardContent>
        <CardFooter className="justify-center">
          <Button variant="outline" onClick={() => setSubmissionComplete(false)}>
            Submit Another Entry
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              {...form.register("name")}
              placeholder="John Doe"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Your Email</Label>
            <Input
              id="email"
              type="email"
              {...form.register("email")}
              placeholder="john@example.com"
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Share on your social media:</Label>
            <div className="flex space-x-2 mt-2">
              {platforms.includes("instagram") && (
                <Button
                  type="button"
                  className={`flex-1 ${
                    form.watch("platform") === "instagram"
                      ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white"
                      : "bg-white text-slate-800 border border-slate-300 hover:bg-purple-50"
                  }`}
                  onClick={() => form.setValue("platform", "instagram")}
                >
                  <FaInstagram className="mr-1" /> Instagram
                </Button>
              )}
              {platforms.includes("snapchat") && (
                <Button
                  type="button"
                  variant={form.watch("platform") === "snapchat" ? "default" : "outline"}
                  className={`flex-1 ${
                    form.watch("platform") === "snapchat"
                      ? "bg-yellow-400 text-black border-yellow-500 hover:bg-yellow-500"
                      : "bg-white text-slate-800 border border-slate-300 hover:bg-yellow-50"
                  }`}
                  onClick={() => form.setValue("platform", "snapchat")}
                >
                  <FaSnapchat className="mr-1" /> Snapchat
                </Button>
              )}
            </div>
            {form.formState.errors.platform && (
              <p className="text-sm text-red-500">{form.formState.errors.platform.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="screenshot">Upload Screenshot</Label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md">
              {previewUrl ? (
                <div className="space-y-2">
                  <img 
                    src={previewUrl} 
                    alt="Screenshot preview" 
                    className="max-h-40 mx-auto"
                  />
                  <div className="flex justify-center">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFile(null);
                        setPreviewUrl(null);
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-slate-400" />
                  <div className="flex text-sm text-slate-600 justify-center">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-slate-500">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              )}
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={submitEntry.isPending}
          >
            {submitEntry.isPending ? "Submitting..." : "Submit Entry"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="text-center text-xs text-slate-500">
        <p>Terms and conditions apply. <a href="#" className="text-blue-600">Learn more</a></p>
      </CardFooter>
    </Card>
  );
}