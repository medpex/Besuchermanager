import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useVisits } from "@/hooks/use-visits";
import { useState } from "react";
import { Card } from "@/components/ui/card";

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
  const [selectedOffice, setSelectedOffice] = useState<string>("");

  const form = useForm<VisitorFormData>({
    defaultValues: {
      category: "Media",
      subcategory: "",
      officeLocation: "",
    },
  });

  const onSubmit = async (data: VisitorFormData) => {
    await createVisit({ ...data, officeLocation: selectedOffice });
    form.reset();
  };

  const selectedCategory = form.watch("category");

  if (!selectedOffice) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Bitte wählen Sie Ihren Standort</h3>
        <div className="grid grid-cols-3 gap-4">
          {["Geesthacht", "Büchen", "Schwarzenbek"].map((office) => (
            <Button
              key={office}
              onClick={() => setSelectedOffice(office)}
              className="h-24 text-lg"
              variant="outline"
            >
              {office}
            </Button>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Standort: {selectedOffice}</h3>
        <Button variant="outline" onClick={() => setSelectedOffice("")}>
          Standort ändern
        </Button>
      </div>

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

          <Button type="submit" className="w-full">
            Besuch erfassen
          </Button>
        </form>
      </Form>
    </div>
  );
}