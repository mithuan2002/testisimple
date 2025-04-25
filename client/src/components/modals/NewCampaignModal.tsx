import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Megaphone } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertCampaignSchema } from "@shared/schema";

const campaignFormSchema = insertCampaignSchema.extend({
  platformsArray: z.array(z.string()).min(1, {
    message: "Select at least one platform",
  }),
  contactList: z.string().min(1, { 
    message: "Select a contact list" 
  }),
  dateRange: z.string().min(1, {
    message: "Date range is required",
  }),
});

type CampaignFormValues = z.infer<typeof campaignFormSchema>;

type NewCampaignModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function NewCampaignModal({
  isOpen,
  onClose,
}: NewCampaignModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [charCount, setCharCount] = useState(0);

  const form = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: {
      title: "",
      description: "",
      dateRange: "",
      smsMessage: "",
      platformsArray: [],
      status: "active",
      contactList: "",
    },
  });

  const createCampaign = useMutation({
    mutationFn: async (data: CampaignFormValues) => {
      // Split the date range into start and end dates
      const [startDate, endDate] = data.dateRange.split(" - ");

      // Transform data for API
      const campaignData = {
        title: data.title,
        description: data.description,
        startDate,
        endDate,
        smsMessage: data.smsMessage,
        platforms: data.platformsArray,
        status: data.status,
        createdAt: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
      };

      return apiRequest("POST", "/api/campaigns", campaignData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Campaign created!",
        description: "Your campaign has been created and SMS notifications sent.",
      });
      form.reset();
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Failed to create campaign",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CampaignFormValues) => {
    createCampaign.mutate(data);
  };

  const handleSmsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCharCount(e.target.value.length);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
              <Megaphone className="h-6 w-6 text-blue-600" />
            </div>
            <DialogTitle className="ml-4 text-lg leading-6 font-medium text-slate-900">
              Create New Campaign
            </DialogTitle>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Campaign Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dateRange"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Campaign Duration</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="MM/DD/YYYY - MM/DD/YYYY"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Campaign Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="smsMessage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SMS Message</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={2}
                      placeholder="Message to send to contacts (160 chars max)"
                      onChange={(e) => {
                        field.onChange(e);
                        handleSmsChange(e);
                      }}
                    />
                  </FormControl>
                  <p className="mt-1 text-xs text-slate-500">
                    Characters: <span id="charCount">{charCount}</span>/160
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="platformsArray"
              render={() => (
                <FormItem>
                  <FormLabel>Social Media Platforms</FormLabel>
                  <div className="mt-2 space-y-2">
                    <FormField
                      control={form.control}
                      name="platformsArray"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes("instagram")}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, "instagram"])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== "instagram"
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="text-sm text-slate-700">
                            Instagram
                          </FormLabel>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="platformsArray"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes("snapchat")}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, "snapchat"])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== "snapchat"
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="text-sm text-slate-700">
                            Snapchat
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactList"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact List</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a contact list" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all">All Contacts (2,540)</SelectItem>
                      <SelectItem value="active">
                        Active Customers (1,845)
                      </SelectItem>
                      <SelectItem value="recent">
                        Recent Purchasers (980)
                      </SelectItem>
                      <SelectItem value="vip">VIP Members (350)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="ml-3"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createCampaign.isPending}
              >
                {createCampaign.isPending ? "Creating..." : "Create & Send"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
