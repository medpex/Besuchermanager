import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useVisits } from "@/hooks/use-visits";

const categories = {
  Media: ["General Consultation", "Contract Completion", "Cancellation", "Customer Management", "Technical/HA", "Billing FM"],
  Energy: ["General Consultation", "Contract Completion", "Cancellation", "Customer Management", "Technical/HA", "Billing FM"],
  General: ["E-World", "Complaints", "E-Mobility/PV", "Bike Rental", "Moving Boxes", "Z28", "Shop"]
};

type VisitorFormData = {
  category: keyof typeof categories;
  subcategory: string;
  officeLocation: string;
};

export default function VisitorForm() {
  const { createVisit } = useVisits();
  
  const form = useForm<VisitorFormData>({
    defaultValues: {
      category: "Media",
      subcategory: "",
      officeLocation: "",
    },
  });

  const onSubmit = async (data: VisitorFormData) => {
    await createVisit(data);
    form.reset();
  };

  const selectedCategory = form.watch("category");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.keys(categories).map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subcategory"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subcategory</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subcategory" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories[selectedCategory]?.map((subcategory) => (
                    <SelectItem key={subcategory} value={subcategory}>
                      {subcategory}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="officeLocation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Office Location</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select office" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="geesthacht">Geesthacht</SelectItem>
                  <SelectItem value="buxtehude">Buxtehude</SelectItem>
                  <SelectItem value="sbk">SBK</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Record Visit
        </Button>
      </form>
    </Form>
  );
}
